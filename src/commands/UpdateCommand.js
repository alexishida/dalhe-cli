import { CliError } from '../core/CliError.js';

export class UpdateCommand {
  constructor({ selfUpdater }) {
    this.selfUpdater = selfUpdater;
  }

  get name() {
    return 'update';
  }

  get description() {
    return 'Atualiza o dalhe-cli e o OpenSpec.';
  }

  helpText() {
    return [
      'Uso:',
      '  dalhe update',
      '',
      'Executa atualizacao global do dalhe-cli e do OpenSpec via npm.',
      '',
    ].join('\n');
  }

  async execute(args) {
    if (args.length > 0) {
      throw new CliError(`Argumento invalido para update: ${args.join(' ')}`, {
        code: 'INVALID_ARGUMENT',
      });
    }

    const result = await this.selfUpdater.update();

    return {
      message: [
        'dalhe-cli atualizado com sucesso.',
        `Origem: ${result.target}`,
        `OpenSpec: ${result.openspec.target}`,
        'Comandos executados:',
        `- ${result.command} ${result.args.join(' ')}`,
        `- ${result.openspec.command} ${result.openspec.args.join(' ')}`,
        '',
      ].join('\n'),
    };
  }
}
