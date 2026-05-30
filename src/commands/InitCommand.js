import { CliError } from '../core/CliError.js';

export class InitCommand {
  constructor({ templateCopier, openSpecInitializer, templateDir, targetDir }) {
    this.templateCopier = templateCopier;
    this.openSpecInitializer = openSpecInitializer;
    this.templateDir = templateDir;
    this.targetDir = targetDir;
  }

  get name() {
    return 'init';
  }

  get description() {
    return 'Initializes project and runs OpenSpec.';
  }

  helpText() {
    return [
      'Usage:',
      '  dalhe init',
      '',
      'Copies files from src/template/init and runs openspec init --tools claude,codex in current directory.',
      '',
    ].join('\n');
  }

  async execute(args) {
    if (args.length > 0) {
      throw new CliError(`Invalid argument for init: ${args.join(' ')}`, {
        code: 'INVALID_ARGUMENT',
      });
    }

    const result = await this.templateCopier.copy({
      sourceDir: this.templateDir,
      targetDir: this.targetDir,
    });
    const openSpecResult = await this.#initializeOpenSpec(result);

    return {
      message: [
        `Project initialized in ${result.targetDir}`,
        `Files copied: ${result.filesCopied}`,
        ...this.#openSpecInstallMessage(openSpecResult),
        `OpenSpec: ${openSpecResult.command} ${openSpecResult.args.join(' ')}`,
        '',
      ].join('\n'),
    };
  }

  async #initializeOpenSpec(result) {
    try {
      return await this.openSpecInitializer.initialize({
        targetDir: result.targetDir,
      });
    } catch (error) {
      if (error instanceof CliError) {
        throw new CliError(
          [
            `Project copied to ${result.targetDir}, but failed to run openspec init.`,
            `Files copied: ${result.filesCopied}`,
            error.message,
          ].join('\n'),
          {
            code: error.code,
            exitCode: error.exitCode,
          },
        );
      }

      throw error;
    }
  }

  #openSpecInstallMessage(result) {
    if (!result.install) {
      return [];
    }

    return [`OpenSpec installed: ${result.install.command} ${result.install.args.join(' ')}`];
  }
}
