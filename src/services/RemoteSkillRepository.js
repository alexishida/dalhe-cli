import { CliError } from '../core/CliError.js';

const SKILLS_PATH = 'src/template/skills';

export class RemoteSkillRepository {
  constructor({
    repositoryUrl,
    fetchImpl = globalThis.fetch,
    env = process.env,
  }) {
    this.repositoryUrl = repositoryUrl;
    this.fetchImpl = fetchImpl;
    this.env = env;
  }

  async list() {
    if (this.env.DALHE_CLI_SKIP_REMOTE_SKILL_LIST === '1') {
      throw new CliError('Remote skill listing is disabled.', {
        code: 'REMOTE_FETCH_FAILED',
      });
    }

    const url = this.#contentsUrl();
    const response = await this.#fetch(url);

    const items = await this.#readJson(response);

    return items
      .filter((item) => item.type === 'dir' && !item.name.startsWith('.'))
      .map((item) => ({ name: item.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async #fetch(url) {
    let response;

    try {
      response = await this.fetchImpl(url);
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