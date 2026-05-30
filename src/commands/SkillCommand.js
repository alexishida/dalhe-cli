import { CliError } from '../core/CliError.js';

export class SkillCommand {
  constructor({ skillManager }) {
    this.skillManager = skillManager;
  }

  get name() {
    return 'skill';
  }

  get description() {
    return 'Lists, installs, removes, and updates global skills.';
  }

  helpText() {
    return [
      'Usage:',
      '  dalhe skill list',
      '  dalhe skill install <skill-name>',
      '  dalhe skill install-all',
      '  dalhe skill uninstall <skill-name>',
      '  dalhe skill update-all',
      '',
      'Manages global skill installation for Codex and Claude Code.',
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
          message: this.#listMessage(await this.skillManager.list()),
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

      case 'update-all':
        this.#assertNoArgs([skillName, ...rest], 'update-all');
        return {
          message: this.#updateAllMessage(await this.skillManager.updateAll()),
        };

      default:
        throw new CliError(
          `Invalid skill subcommand: ${subcommand || '(empty)'}. Use list, install, install-all, uninstall, or update-all.`,
          { code: 'INVALID_SUBCOMMAND' },
        );
    }
  }

  #listMessage(skills) {
    if (skills.length === 0) {
      return 'No skills available.\n';
    }

    return [
      'Available skills:',
      ...skills.flatMap((skill) => this.#skillListLines(skill)),
      '',
    ].join('\n');
  }

  #skillListLines(skill) {
    return [`- ${skill.name}`];
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

  #updateAllMessage(result) {
    if (result.totalUpdated === 0) {
      return 'No installed skills to update.\n';
    }

    return [
      `${result.totalUpdated} skill${result.totalUpdated > 1 ? 's' : ''} updated globally.`,
      ...result.updatedSkills.map((skill) => `- ${skill.name}`),
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
