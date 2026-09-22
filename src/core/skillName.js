import { CliError } from './CliError.js';

export function assertSkillName(name) {
  if (!name) {
    throw new CliError('Informe o nome da skill.', { code: 'MISSING_SKILL_NAME' });
  }
  if (typeof name !== 'string' || name === '.' || name === '..' || /[\/\\:\0]/.test(name)) {
    throw new CliError('Nome de skill inválido. Informe apenas o nome, sem caminhos.', {
      code: 'INVALID_SKILL_NAME',
    });
  }
}
