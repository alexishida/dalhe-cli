import { CliError } from '../core/CliError.js';

export class SkillCommand {
  constructor({ skillManager, remoteSkillRepository }) {
    this.skillManager = skillManager;
    this.remoteSkillRepository = remoteSkillRepository;
  }

  get name() {
    return 'skill';
  }

  get description() {
    return 'Lista, instala, remove e atualiza skills globais pelo GitHub.';
  }

  helpText() {
    return [
      'Usage:',
      '  dalhe skill list',
      '  dalhe skill install <skill-name>',
      '  dalhe skill install-all',
      '  dalhe skill uninstall <skill-name>',
      '  dalhe skill uninstall-all',
      '  dalhe skill update [skill-name]',
      '  dalhe skill update-all',
      '',
      'Manages global skill installation for Codex and Claude Code.',
      'install-all baixa todas as skills disponíveis no GitHub.',
      'update busca a skill mais recente no GitHub; sem nome, atualiza todas as instaladas.',
      '',
    ].join('\n');
  }

  async execute(args) {
    const [subcommand, skillName, ...rest] = args;

    switch (subcommand) {
      case 'list':
        this.#assertNoExtraArgs(rest, 'list');
        this.#assertNoSkillNameForList(skillName);
        return {
          message: this.#listMessage(await this.#listSkills()),
        };

      case 'install':
        this.#assertSkillName(skillName, 'install');
        this.#assertNoExtraArgs(rest, 'install');
        return {
          message: this.#installMessage(await this.skillManager.install(skillName)),
        };

      case 'install-all':
        this.#assertNoArgs([skillName, ...rest], 'install-all');
        return {
          message: this.#installAllMessage(await this.skillManager.installAll()),
        };

      case 'uninstall':
        this.#assertSkillName(skillName, 'uninstall');
        this.#assertNoExtraArgs(rest, 'uninstall');
        return {
          message: this.#uninstallMessage(await this.skillManager.uninstall(skillName)),
        };

      case 'uninstall-all':
        this.#assertNoArgs([skillName, ...rest], 'uninstall-all');
        return {
          message: this.#uninstallAllMessage(await this.skillManager.uninstallAll()),
        };

      case 'update':
        this.#assertNoExtraArgs(rest, 'update');
        if (!skillName) return { message: this.#updateAllMessage(await this.skillManager.updateAll()) };
        return { message: this.#updateMessage(await this.skillManager.update(skillName)) };

      case 'update-all':
        this.#assertNoArgs([skillName, ...rest], 'update-all');
        return {
          message: this.#updateAllMessage(await this.skillManager.updateAll()),
        };

      default:
        throw new CliError(
          `Invalid skill subcommand: ${subcommand || '(empty)'}. Use list, install, install-all, uninstall, uninstall-all, update, or update-all.`,
          { code: 'INVALID_SUBCOMMAND' },
        );
    }
  }

  async #listSkills() {
    if (!this.remoteSkillRepository) {
      return { skills: await this.skillManager.list(), source: 'installed' };
    }

    try {
      const skills = await this.remoteSkillRepository.list();
      return { skills: await this.#withInstallStatus(skills), source: 'repository' };
    } catch {
      return { skills: await this.skillManager.list(), source: 'installed' };
    }
  }

  async #withInstallStatus(skills) {
    return Promise.all(skills.map(async (skill) => ({
      ...skill,
      ...(await this.skillManager.status(skill.name)),
    })));
  }

  #listMessage({ skills, source }) {
    if (skills.length === 0) {
      return source === 'repository' ? 'No skills found in the repository.\n' : 'No skills available.\n';
    }

    const heading =
      source === 'repository'
        ? 'Available skills from the repository:'
        : 'Available skills (from installed version):';

    return [
      heading,
      ...skills.flatMap((skill) => this.#skillListLines(skill)),
      '',
    ].join('\n');
  }

  #skillListLines(skill) {
    const installed = skill.codex?.installed || skill.claude?.installed || skill.claudeCommand?.installed;
    return [`- ${skill.name}${installed ? ' (instalada)' : ''}`];
  }

  #installMessage(result) {
    return [
      `Skill "${result.name}" installed globally.`,
      `Codex: ${result.codexDir}`,
      `Claude Code: ${result.claudeDir}`,
      `Claude Code /command: ${result.claudeCommandFile}`,
      '',
    ].join('\n');
  }

  #uninstallMessage(result) {
    const removed = result.removedFromCodex || result.removedFromClaude || result.removedCommand;

    return [
      removed
        ? `Skill "${result.name}" removed globally.`
        : `Skill "${result.name}" was not installed globally.`,
      `Codex: ${result.removedFromCodex ? 'removed' : 'not found'} (${result.codexDir})`,
      `Claude Code: ${result.removedFromClaude ? 'removed' : 'not found'} (${result.claudeDir})`,
      `Claude Code /command: ${result.removedCommand ? 'removed' : 'not found'} (${result.claudeCommandFile})`,
      '',
    ].join('\n');
  }

  #installAllMessage(result) {
    if (result.totalInstalled === 0) {
      return 'No skills available to install.\n';
    }

    return [
      `${result.totalInstalled} skill${result.totalInstalled > 1 ? 's' : ''} installed globally.`,
      ...result.installedSkills.map((skill) => `- ${skill.name}`),
      '',
    ].join('\n');
  }

  #uninstallAllMessage(result) {
    if (result.totalUninstalled === 0) {
      return 'No skills available to uninstall.\n';
    }

    return [
      `${result.totalUninstalled} skill${result.totalUninstalled > 1 ? 's' : ''} removed globally.`,
      ...result.removedSkills.map((skill) => `- ${skill.name}`),
      '',
    ].join('\n');
  }

  #updateAllMessage(result) {
    if (result.totalUpdated === 0) {
      return 'Nenhuma skill instalada disponível no GitHub para atualizar.\n';
    }

    return [
      `${result.totalUpdated} skill(s) atualizada(s) globalmente pelo GitHub.`,
      ...result.updatedSkills.map((skill) => `- ${skill.name}`),
      '',
    ].join('\n');
  }

  #updateMessage(result) {
    return [
      `Skill "${result.name}" atualizada pelo GitHub.`,
      `Commit: ${result.commit}`,
      `Codex: ${result.codexDir}`,
      `Claude Code: ${result.claudeDir}`,
      '',
    ].join('\n');
  }

  #assertSkillName(skillName, subcommand) {
    if (skillName) {
      return;
    }

    throw new CliError(`Provide a skill name for "${subcommand}".`, {
      code: 'MISSING_SKILL_NAME',
    });
  }

  #assertNoExtraArgs(rest, subcommand) {
    if (rest.length === 0) {
      return;
    }

    throw new CliError(`Invalid arguments for "skill ${subcommand}": ${rest.join(' ')}`, {
      code: 'INVALID_ARGUMENT',
    });
  }

  #assertNoSkillNameForList(skillName) {
    if (!skillName) {
      return;
    }

    throw new CliError(`Invalid argument for "skill list": ${skillName}`, {
      code: 'INVALID_ARGUMENT',
    });
  }

  #assertNoArgs(args, subcommand) {
    const definedArgs = args.filter((arg) => arg !== undefined);

    if (definedArgs.length === 0) {
      return;
    }

    throw new CliError(`Invalid arguments for "skill ${subcommand}": ${definedArgs.join(' ')}`, {
      code: 'INVALID_ARGUMENT',
    });
  }
}
