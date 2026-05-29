import { CliError } from '../core/CliError.js';

export class InitCommand {
  constructor({ templateCopier, templateDir, targetDir }) {
    this.templateCopier = templateCopier;
    this.templateDir = templateDir;
    this.targetDir = targetDir;
  }

  get name() {
    return 'init';
  }

  get description() {
    return 'Inicia projeto copiando arquivos base.';
  }

  helpText() {
    return [
      'Uso:',
      '  dalhe init',
      '',
      'Copia os arquivos de src/template/init para o diretorio atual.',
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

    return {
      message: [
        `Projeto iniciado em ${result.targetDir}`,
        `Arquivos copiados: ${result.filesCopied}`,
        '',
      ].join('\n'),
    };
  }
}
