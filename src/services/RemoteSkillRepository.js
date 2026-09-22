import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CliError } from '../core/CliError.js';
import { assertSkillName } from '../core/skillName.js';

const SKILLS_PATH = 'src/template/skills';

export class RemoteSkillRepository {
  constructor({
    repositoryUrl,
    fetchImpl = globalThis.fetch,
    env = process.env,
    timeoutMs = 5000,
  }) {
    this.repositoryUrl = repositoryUrl;
    this.fetchImpl = fetchImpl;
    this.env = env;
    this.timeoutMs = timeoutMs;
  }

  async list() {
    if (this.env.DALHE_CLI_SKIP_REMOTE_SKILL_LIST === '1') {
      throw new CliError('Remote skill listing is disabled.', {
        code: 'REMOTE_FETCH_FAILED',
      });
    }

    const items = await this.#request(this.#contentsUrl());

    if (!Array.isArray(items) || items.some((item) =>
      !item || typeof item.name !== 'string' || typeof item.type !== 'string')) {
      throw new CliError('Resposta inválida do repositório de skills.', { code: 'REMOTE_FETCH_FAILED' });
    }

    return items
      .filter((item) => item.type === 'dir' && !item.name.startsWith('.'))
      .map((item) => ({ name: item.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async snapshot() {
    const { owner, repo } = this.#ownerAndRepo();
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const commit = await this.#request(`${apiUrl}/commits/HEAD`);
    const treeSha = commit?.commit?.tree?.sha;
    if (!/^[a-f0-9]{40}$/.test(commit?.sha) || !/^[a-f0-9]{40}$/.test(treeSha)) {
      throw new CliError('Commit inválido recebido do GitHub.', { code: 'REMOTE_FETCH_FAILED' });
    }
    const tree = await this.#request(`${apiUrl}/git/trees/${treeSha}?recursive=1`);
    if (!Array.isArray(tree?.tree) || tree.truncated) {
      throw new CliError('A árvore de arquivos do GitHub está inválida ou incompleta.', {
        code: 'REMOTE_FETCH_FAILED',
      });
    }

    const skills = new Map();
    for (const entry of tree.tree) {
      if (typeof entry?.path !== 'string') {
        throw new CliError('Caminho inválido recebido do GitHub.', { code: 'REMOTE_FETCH_FAILED' });
      }
      if (!entry.path.startsWith(`${SKILLS_PATH}/`)) continue;
      const [name, ...parts] = entry.path.slice(SKILLS_PATH.length + 1).split('/');
      assertSkillName(name);
      if (name.startsWith('.') || parts.length === 0) continue;
      if (!skills.has(name)) skills.set(name, { name, files: [] });
      skills.get(name).files.push({ path: parts.join('/'), type: entry.type, mode: entry.mode });
    }

    return {
      commit: commit.sha,
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${commit.sha}`,
      skills: [...skills.values()]
        .filter((skill) => skill.files.some((file) => file.path === 'SKILL.md' && file.type === 'blob'))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  async download({ snapshot, skill, targetDir }) {
    assertSkillName(skill.name);
    for (const file of skill.files) {
      const parts = file.path.split('/');
      if (parts.some((part) => !part || part === '.' || part === '..' || /[\\:\0]/.test(part)) ||
          !((file.type === 'tree' && file.mode === '040000') ||
            (file.type === 'blob' && ['100644', '100755'].includes(file.mode)))) {
        throw new CliError(`Arquivo remoto inválido ou não suportado: ${skill.name}/${file.path}`, {
          code: 'INVALID_SKILL_TEMPLATE',
        });
      }
    }

    const files = skill.files.filter((file) => file.type === 'blob');
    for (let offset = 0; offset < files.length; offset += 4) {
      // Wait for the whole batch before returning an error so cleanup cannot race a download.
      const results = await Promise.allSettled(files.slice(offset, offset + 4).map(async (file) => {
        const path = `${SKILLS_PATH}/${skill.name}/${file.path}`.split('/').map(encodeURIComponent).join('/');
        const contents = await this.#request(`${snapshot.rawUrl}/${path}`, { binary: true });
        const destination = join(targetDir, file.path);
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, contents, { flag: 'wx', mode: file.mode === '100755' ? 0o755 : 0o644 });
      }));
      const failed = results.find((result) => result.status === 'rejected');
      if (failed) throw failed.reason;
    }
  }

  async #request(url, { binary = false } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort(new Error('Tempo limite de consulta às skills excedido.'));
    }, this.timeoutMs);
    try {
      const response = await this.#fetch(url, controller.signal);
      return binary ? Buffer.from(await response.arrayBuffer()) : await this.#readJson(response);
    } catch (error) {
      if (error instanceof CliError) throw error;
      throw new CliError(`Falha ao baixar a skill do GitHub: ${error.message}`, { code: 'REMOTE_FETCH_FAILED' });
    } finally {
      clearTimeout(timer);
    }
  }

  async #fetch(url, signal) {
    let response;

    try {
      response = await this.fetchImpl(url, { signal });
    } catch (error) {
      throw new CliError(`Could not fetch skills from the git repository.\n${error.message}`, {
        code: 'REMOTE_FETCH_FAILED',
      });
    }

    if (!response.ok) {
      throw new CliError(`Could not fetch skills from the git repository (HTTP ${response.status}).`, {
        code: 'REMOTE_FETCH_FAILED',
      });
    }

    return response;
  }

  async #readJson(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new CliError(`Could not read skills from the git repository.\n${error.message}`, {
        code: 'REMOTE_FETCH_FAILED',
      });
    }
  }

  #contentsUrl() {
    const { owner, repo } = this.#ownerAndRepo();
    return `https://api.github.com/repos/${owner}/${repo}/contents/${SKILLS_PATH}`;
  }

  #ownerAndRepo() {
    if (!this.repositoryUrl) {
      throw new CliError('Official dalhe-cli repository is not configured.', {
        code: 'MISSING_REPOSITORY_URL',
      });
    }

    const match = this.repositoryUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);

    if (!match) {
      throw new CliError('Official dalhe-cli repository is not configured.', {
        code: 'MISSING_REPOSITORY_URL',
      });
    }

    return { owner: match[1], repo: match[2] };
  }
}
