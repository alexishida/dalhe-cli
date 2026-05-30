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
    return 'Inicia projeto e executa OpenSpec.';
  }

  helpText() {
    return [
      'Uso:',
      '  dalhe init',
      '',
      'Copia os arquivos de src/template/init e executa openspec init --tools claude,codex no diretorio atual.',
      '',
    ].join('\n');
  }

  async execute(args) {
    if (args.length > 0) {
      throw new CliError(`Argumento invalido para init: ${args.join(' ')}`, {
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
        `Projeto iniciado em ${result.targetDir}`,
        `Arquivos copiados: ${result.filesCopied}`,
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
            `Projeto copiado em ${result.targetDir}, mas falha ao executar openspec init.`,
            `Arquivos copiados: ${result.filesCopied}`,
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

    return [`OpenSpec instalado: ${result.install.command} ${result.install.args.join(' ')}`];
  }
}
