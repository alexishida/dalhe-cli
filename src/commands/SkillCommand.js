import { CliError } from '../core/CliError.js';

export class SkillCommand {
  constructor({ skillManager }) {
    this.skillManager = skillManager;
  }

  get name() {
    return 'skill';
  }

  get description() {
    return 'Lista, instala, remove e atualiza skills globais.';
  }

  helpText() {
    return [
      'Uso:',
      '  dalhe skill list',
      '  dalhe skill install <nome-da-skill>',
      '  dalhe skill uninstall <nome-da-skill>',
      '  dalhe skill update-all',
      '',
      'Gerencia instalacao global de skills no Codex e no Claude Code.',
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
          `Subcomando invalido para skill: ${subcommand || '(vazio)'}. Use list, install, uninstall ou update-all.`,
          { code: 'INVALID_SUBCOMMAND' },
        );
    }
  }

  #listMessage(skills) {
    if (skills.length === 0) {
      return 'Nenhuma skill disponivel.\n';
    }

    return [
      'Skills disponiveis:',
      ...skills.flatMap((skill) => this.#skillListLines(skill)),
      '',
    ].join('\n');
  }

  #skillListLines(skill) {
    return [`- ${skill.name}`];
  }

  #installMessage(result) {
    return [
      `Skill "${result.name}" instalada globalmente.`,
      `Codex: ${result.codexDir}`,
      `Claude Code: ${result.claudeDir}`,
      `Claude Code /comando: ${result.claudeCommandFile}`,
      '',
    ].join('\n');
  }

  #uninstallMessage(result) {
    const removed = result.removedFromCodex || result.removedFromClaude || result.removedCommand;

    return [
      removed
        ? `Skill "${result.name}" removida globalmente.`
        : `Skill "${result.name}" nao estava instalada globalmente.`,
      `Codex: ${result.removedFromCodex ? 'removida' : 'nao encontrada'} (${result.codexDir})`,
      `Claude Code: ${result.removedFromClaude ? 'removida' : 'nao encontrada'} (${result.claudeDir})`,
      `Claude Code /comando: ${result.removedCommand ? 'removido' : 'nao encontrado'} (${result.claudeCommandFile})`,
      '',
    ].join('\n');
  }

  #updateAllMessage(result) {
    if (result.totalUpdated === 0) {
      return 'Nenhuma skill instalada para atualizar.\n';
    }

    return [
      `${result.totalUpdated} skill${result.totalUpdated > 1 ? 's' : ''} atualizada${result.totalUpdated > 1 ? 's' : ''} globalmente.`,
      ...result.updatedSkills.map((skill) => `- ${skill.name}`),
      '',
    ].join('\n');
  }

  #assertSkillName(skillName, subcommand) {
    if (skillName) {
      return;
    }

    throw new CliError(`Informe nome da skill para "${subcommand}".`, {
      code: 'MISSING_SKILL_NAME',
    });
  }

  #assertNoExtraArgs(rest, subcommand) {
    if (rest.length === 0) {
      return;
    }

    throw new CliError(`Argumentos invalidos para "skill ${subcommand}": ${rest.join(' ')}`, {
      code: 'INVALID_ARGUMENT',
    });
  }

  #assertNoSkillNameForList(skillName) {
    if (!skillName) {
      return;
    }

    throw new CliError(`Argumento invalido para "skill list": ${skillName}`, {
      code: 'INVALID_ARGUMENT',
    });
  }

  #assertNoArgs(args, subcommand) {
    const definedArgs = args.filter((arg) => arg !== undefined);

    if (definedArgs.length === 0) {
      return;
    }

    throw new CliError(`Argumentos invalidos para "skill ${subcommand}": ${definedArgs.join(' ')}`, {
      code: 'INVALID_ARGUMENT',
    });
  }
}
