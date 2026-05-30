import { CliError } from '../core/CliError.js';

export class UpdateCommand {
  constructor({ selfUpdater }) {
    this.selfUpdater = selfUpdater;
  }

  get name() {
    return 'update';
  }

  get description() {
    return 'Updates dalhe-cli and OpenSpec.';
  }

  helpText() {
    return [
      'Usage:',
      '  dalhe update',
      '',
      'Runs a global update for dalhe-cli and OpenSpec via npm.',
      '',
    ].join('\n');
  }

  async execute(args) {
    if (args.length > 0) {
      throw new CliError(`Invalid argument for update: ${args.join(' ')}`, {
        code: 'INVALID_ARGUMENT',
      });
    }

    const result = await this.selfUpdater.update();

    return {
      message: [
        'dalhe-cli updated successfully.',
        `Source: ${result.target}`,
        `OpenSpec: ${result.openspec.target}`,
        'Executed commands:',
        `- ${result.command} ${result.args.join(' ')}`,
        `- ${result.openspec.command} ${result.openspec.args.join(' ')}`,
        '',
      ].join('\n'),
    };
  }
}
