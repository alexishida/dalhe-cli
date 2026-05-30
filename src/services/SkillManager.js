import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { CliError } from '../core/CliError.js';

const SKILL_FILENAME = 'SKILL.md';

export class SkillManager {
  constructor({ templateRootDir, env = process.env, userHomeDir = homedir() }) {
    this.templateRootDir = templateRootDir;
    this.env = env;
    this.userHomeDir = userHomeDir;
  }

  async list() {
    await this.#assertDirectory(this.templateRootDir);

    const dirents = await readdir(this.templateRootDir, { withFileTypes: true });
    const skillNames = [];

    for (const dirent of dirents) {
      if (!dirent.isDirectory() || dirent.name.startsWith('.')) {
        continue;
      }

      const skillFile = join(this.templateRootDir, dirent.name, SKILL_FILENAME);

      if (await this.#exists(skillFile)) {
        skillNames.push(dirent.name);
      }
    }

    skillNames.sort();

    return Promise.all(skillNames.map((name) => this.#skillStatus(name)));
  }

  async install(skillName) {
    const sourceDir = await this.#skillSourceDir(skillName);
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

  async uninstall(skillName) {
    await this.#skillSourceDir(skillName);

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

  async updateAll() {
    const skills = await this.list();
    const installedSkills = skills.filter((skill) => this.#isInstalled(skill));
    const updatedSkills = [];

    for (const skill of installedSkills) {
      updatedSkills.push(await this.install(skill.name));
    }

    return {
      totalUpdated: updatedSkills.length,
      updatedSkills,
    };
  }

  async #skillStatus(skillName) {
    const sourceDir = join(this.templateRootDir, skillName);
    const codexDir = this.#codexSkillDir(skillName);
    const claudeDir = this.#claudeSkillDir(skillName);
    const claudeCommandFile = this.#claudeCommandFile(skillName);

    return {
      name: skillName,
      sourceDir,
      codex: {
        path: codexDir,
        installed: await this.#exists(codexDir),
      },
      claude: {
        path: claudeDir,
        installed: await this.#exists(claudeDir),
      },
      claudeCommand: {
        path: claudeCommandFile,
        installed: await this.#exists(claudeCommandFile),
      },
    };
  }

  async #skillSourceDir(skillName) {
    if (!skillName) {
      throw new CliError('Provide a skill name.', {
        code: 'MISSING_SKILL_NAME',
      });
    }

    const sourceDir = join(this.templateRootDir, skillName);

    await this.#assertDirectory(sourceDir, `Skill not found: ${skillName}`);

    const skillFile = join(sourceDir, SKILL_FILENAME);

    if (!(await this.#exists(skillFile))) {
      throw new CliError(`File ${SKILL_FILENAME} not found for skill: ${skillName}`, {
        code: 'INVALID_SKILL_TEMPLATE',
      });
    }

    return sourceDir;
  }

  #codexHomeDir() {
    return resolve(this.env.CODEX_HOME || join(this.userHomeDir, '.codex'));
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
}
