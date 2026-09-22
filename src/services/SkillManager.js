import { cp, mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { CliError } from '../core/CliError.js';
import { assertSkillName } from '../core/skillName.js';

const SKILL_FILENAME = 'SKILL.md';

export class SkillManager {
  constructor({ templateRootDir, env = process.env, userHomeDir = homedir(), remoteSkillRepository }) {
    this.templateRootDir = templateRootDir;
    this.env = env;
    this.userHomeDir = userHomeDir;
    this.remoteSkillRepository = remoteSkillRepository;
  }

  async list({ includeStatus = true } = {}) {
    await this.#assertDirectory(this.templateRootDir);

    const dirents = await readdir(this.templateRootDir, { withFileTypes: true });
    const candidates = dirents.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));
    const valid = await Promise.all(
      candidates.map((entry) => this.#isSkillFile(join(this.templateRootDir, entry.name, SKILL_FILENAME))),
    );
    const skillNames = candidates
      .filter((entry, index) => valid[index])
      .map((entry) => entry.name)
      .sort();

    if (!includeStatus) {
      return skillNames.map((name) => ({ name, sourceDir: join(this.templateRootDir, name) }));
    }

    return Promise.all(skillNames.map((name) => this.#skillStatus(name)));
  }

  async install(skillName) {
    const sourceDir = await this.#skillSourceDir(skillName);
    return this.#installSkill({ skillName, sourceDir });
  }

  async installAll() {
    const skills = await this.list({ includeStatus: false });
    const installedSkills = [];

    for (const skill of skills) {
      installedSkills.push(await this.#installSkill({ skillName: skill.name, sourceDir: skill.sourceDir }));
    }

    return {
      totalInstalled: installedSkills.length,
      installedSkills,
    };
  }

  async uninstall(skillName) {
    await this.#skillSourceDir(skillName);
    return this.#uninstallSkill(skillName);
  }

  async uninstallAll() {
    const skills = await this.list({ includeStatus: false });
    const removedSkills = [];

    for (const skill of skills) {
      removedSkills.push(await this.#uninstallSkill(skill.name));
    }

    return {
      totalUninstalled: removedSkills.length,
      removedSkills,
    };
  }

  async update(skillName) {
    assertSkillName(skillName);
    if (!this.#isInstalled(await this.#skillStatus(skillName))) {
      throw new CliError(`A skill "${skillName}" não está instalada. Use dalhe skill install ${skillName}.`, {
        code: 'SKILL_NOT_INSTALLED',
      });
    }
    const snapshot = await this.#remoteSnapshot();
    const skill = snapshot.skills.find((skill) => skill.name === skillName);
    if (!skill) {
      throw new CliError(`Skill não encontrada no GitHub: ${skillName}`, { code: 'REMOTE_SKILL_NOT_FOUND' });
    }
    const [result] = await this.#updateSkills(snapshot, [skill]);
    return result;
  }

  async updateAll() {
    const snapshot = await this.#remoteSnapshot();
    const statuses = await Promise.all(snapshot.skills.map((skill) => {
      assertSkillName(skill.name);
      return this.#skillStatus(skill.name);
    }));
    const installedSkills = snapshot.skills.filter((skill, index) => this.#isInstalled(statuses[index]));
    const updatedSkills = await this.#updateSkills(snapshot, installedSkills);
    return {
      totalUpdated: updatedSkills.length,
      updatedSkills,
    };
  }

  #remoteSnapshot() {
    if (!this.remoteSkillRepository) {
      throw new CliError('Repositório remoto de skills não configurado.', { code: 'MISSING_REPOSITORY_URL' });
    }
    return this.remoteSkillRepository.snapshot();
  }

  async #updateSkills(snapshot, skills) {
    if (skills.length === 0) return [];
    const workspace = await mkdtemp(join(tmpdir(), 'dalhe-skill-update-'));
    try {
      for (const skill of skills) {
        await this.remoteSkillRepository.download({ snapshot, skill, targetDir: join(workspace, skill.name) });
        if (!(await this.#isSkillFile(join(workspace, skill.name, SKILL_FILENAME)))) {
          throw new CliError(`Template remoto inválido: ${skill.name}`, { code: 'INVALID_SKILL_TEMPLATE' });
        }
      }
      const updatedSkills = [];
      for (const skill of skills) {
        const result = await this.#installSkill({ skillName: skill.name, sourceDir: join(workspace, skill.name) });
        updatedSkills.push({ ...result, commit: snapshot.commit });
      }
      return updatedSkills;
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  }

  async #skillStatus(skillName) {
    const sourceDir = join(this.templateRootDir, skillName);
    const codexDir = this.#codexSkillDir(skillName);
    const claudeDir = this.#claudeSkillDir(skillName);
    const claudeCommandFile = this.#claudeCommandFile(skillName);
    const [codexInstalled, claudeInstalled, commandInstalled] = await Promise.all([
      this.#exists(codexDir),
      this.#exists(claudeDir),
      this.#exists(claudeCommandFile),
    ]);

    return {
      name: skillName,
      sourceDir,
      codex: {
        path: codexDir,
        installed: codexInstalled,
      },
      claude: {
        path: claudeDir,
        installed: claudeInstalled,
      },
      claudeCommand: {
        path: claudeCommandFile,
        installed: commandInstalled,
      },
    };
  }

  async #skillSourceDir(skillName) {
    assertSkillName(skillName);

    const sourceDir = join(this.templateRootDir, skillName);

    await this.#assertDirectory(sourceDir, `Skill not found: ${skillName}`);

    const skillFile = join(sourceDir, SKILL_FILENAME);

    if (!(await this.#isSkillFile(skillFile))) {
      throw new CliError(`File ${SKILL_FILENAME} not found for skill: ${skillName}`, {
        code: 'INVALID_SKILL_TEMPLATE',
      });
    }

    return sourceDir;
  }

  #codexHomeDir() {
    return resolve(this.env.CODEX_HOME || join(this.userHomeDir, '.agents'));
  }

  #codexSkillsDir() {
    return join(this.#codexHomeDir(), 'skills');
  }

  #codexSkillDir(skillName) {
    return join(this.#codexSkillsDir(), skillName);
  }

  #claudeSkillsDir() {
    return join(this.userHomeDir, '.claude', 'skills');
  }

  #claudeSkillDir(skillName) {
    return join(this.#claudeSkillsDir(), skillName);
  }

  #claudeCommandsDir() {
    return join(this.userHomeDir, '.claude', 'commands');
  }

  #claudeCommandFile(skillName) {
    return join(this.#claudeCommandsDir(), `${skillName}.md`);
  }

  #commandFileContent(skillName) {
    return `Invoke the \`${skillName}\` skill. $ARGUMENTS\n`;
  }

  async #installSkill({ skillName, sourceDir }) {
    const codexDir = this.#codexSkillDir(skillName);
    const claudeDir = this.#claudeSkillDir(skillName);
    const claudeCommandFile = this.#claudeCommandFile(skillName);

    await rm(codexDir, { force: true, recursive: true });
    await mkdir(this.#codexSkillsDir(), { recursive: true });
    await cp(sourceDir, codexDir, { recursive: true });

    await rm(claudeDir, { force: true, recursive: true });
    await mkdir(this.#claudeSkillsDir(), { recursive: true });
    await cp(sourceDir, claudeDir, { recursive: true });

    await mkdir(this.#claudeCommandsDir(), { recursive: true });
    await writeFile(claudeCommandFile, this.#commandFileContent(skillName));

    return {
      name: skillName,
      sourceDir,
      codexDir,
      claudeDir,
      claudeCommandFile,
    };
  }

  async #uninstallSkill(skillName) {
    const codexDir = this.#codexSkillDir(skillName);
    const claudeDir = this.#claudeSkillDir(skillName);
    const claudeCommandFile = this.#claudeCommandFile(skillName);
    const codexInstalled = await this.#exists(codexDir);
    const claudeInstalled = await this.#exists(claudeDir);
    const commandInstalled = await this.#exists(claudeCommandFile);

    if (codexInstalled) {
      await rm(codexDir, { force: true, recursive: true });
    }

    if (claudeInstalled) {
      await rm(claudeDir, { force: true, recursive: true });
    }

    if (commandInstalled) {
      await rm(claudeCommandFile, { force: true });
    }

    return {
      name: skillName,
      codexDir,
      claudeDir,
      claudeCommandFile,
      removedFromCodex: codexInstalled,
      removedFromClaude: claudeInstalled,
      removedCommand: commandInstalled,
    };
  }

  #isInstalled(skill) {
    return skill.codex.installed || skill.claude.installed || skill.claudeCommand?.installed;
  }

  async #assertDirectory(directory, message = `Directory not found: ${directory}`) {
    const info = await stat(directory).catch((error) => {
      if (error.code === 'ENOENT') {
        return null;
      }

      throw error;
    });

    if (!info?.isDirectory()) {
      throw new CliError(message, {
        code: 'DIRECTORY_NOT_FOUND',
      });
    }
  }

  async #exists(path) {
    const info = await stat(path).catch((error) => {
      if (error.code === 'ENOENT') {
        return null;
      }

      throw error;
    });

    return Boolean(info);
  }

  async #isSkillFile(path) {
    const info = await stat(path).catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    return info?.isFile() ?? false;
  }
}
