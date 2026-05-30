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

test('skill install-all shows installed skill names', async () => {
  const command = new SkillCommand({
    skillManager: {
      async installAll() {
        return {
          totalInstalled: 2,
          installedSkills: [{ name: 'nodejs-dev' }, { name: 'pure-ruby' }],
        };
      },
    },
  });

  const result = await command.execute(['install-all']);

  assert.equal(
    result.message,
    ['2 skills installed globally.', '- nodejs-dev', '- pure-ruby', ''].join('\n'),
  );
});

test('skill uninstall-all shows removed skill names', async () => {
  const command = new SkillCommand({
    skillManager: {
      async uninstallAll() {
        return {
          totalUninstalled: 2,
          removedSkills: [{ name: 'nodejs-dev' }, { name: 'pure-ruby' }],
        };
      },
    },
  });

  const result = await command.execute(['uninstall-all']);

  assert.equal(
    result.message,
    ['2 skills removed globally.', '- nodejs-dev', '- pure-ruby', ''].join('\n'),
  );
});
