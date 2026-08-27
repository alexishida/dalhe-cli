import { CliError } from '../core/CliError.js';

export class UpdateCommand {
  constructor({ selfUpdater, skillManager }) {
    this.selfUpdater = selfUpdater;
    this.skillManager = skillManager;
  }

  get name() {
    return 'update';
  }

  get description() {
    return 'Updates dalhe-cli, OpenSpec, and global skills.';
  }

  helpText() {
    return [
      'Usage:',
      '  dalhe update',
      '',
      'Runs a global update for dalhe-cli and OpenSpec via npm,',
      'and syncs globally installed skills from the repository.',
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
    const skills = await this.skillManager.updateAll();

    return {
      message: [
        'dalhe-cli updated successfully.',
        `Source: ${result.target}`,
        `OpenSpec: ${result.openspec.target}`,
        'Executed commands:',
        `- ${result.command} ${result.args.join(' ')}`,
        `- ${result.openspec.command} ${result.openspec.args.join(' ')}`,
        '',
        ...this.#skillsMessage(skills),
      ].join('\n'),
    };
  }

  #skillsMessage(result) {
    if (result.totalUpdated === 0) {
      return ['No installed skills to sync.'];
    }

    return [
      'Skills synced globally:',
      ...result.updatedSkills.map((skill) => `- ${skill.name}`),
    ];
  }
}
