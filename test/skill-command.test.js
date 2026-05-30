import assert from 'node:assert/strict';
import test from 'node:test';
import { SkillCommand } from '../src/commands/SkillCommand.js';

test('skill list shows only skill names', async () => {
  const command = new SkillCommand({
    skillManager: {
      async list() {
        return [
          {
            name: 'rails8',
            codex: {
              installed: true,
              path: '/home/user/.codex/skills/rails8',
            },
            claude: {
              installed: true,
              path: '/home/user/.claude/skills/rails8',
            },
            claudeCommand: {
              installed: true,
              path: '/home/user/.claude/commands/rails8.md',
            },
          },
        ];
      },
    },
  });

  const result = await command.execute(['list']);

  assert.equal(result.message, ['Available skills:', '- rails8', ''].join('\n'));
});
