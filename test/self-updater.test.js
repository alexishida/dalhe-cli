import assert from 'node:assert/strict';
import test from 'node:test';
import { CliError } from '../src/core/CliError.js';
import {
  OPENSPEC_PACKAGE,
  SKIP_OPENSPEC_POSTINSTALL_ENV,
  SelfUpdater,
} from '../src/services/SelfUpdater.js';
import { UpdateCommand } from '../src/commands/UpdateCommand.js';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

test('updates dalhe-cli and openspec via npm install -g', async () => {
  const calls = [];
  const updater = new SelfUpdater({
    repositoryUrl: 'git+https://github.com/alexishida/dalhe-cli.git',
    runCommand: async (input) => {
      calls.push(input);
    },
  });

  const result = await updater.update();

  assert.deepEqual(calls, [
    {
      command: npmCommand,
      args: ['install', '-g', 'git+https://github.com/alexishida/dalhe-cli.git'],
      env: {
        [SKIP_OPENSPEC_POSTINSTALL_ENV]: '1',
      },
    },
    {
      command: npmCommand,
      args: ['install', '-g', OPENSPEC_PACKAGE],
    },
  ]);
  assert.equal(result.command, npmCommand);
  assert.equal(result.target, 'git+https://github.com/alexishida/dalhe-cli.git');
  assert.equal(result.openspec.target, OPENSPEC_PACKAGE);
});

test('uses npm.cmd on Windows', async () => {
  const calls = [];
  const updater = new SelfUpdater({
    repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
    platform: 'win32',
    runCommand: async (input) => {
      calls.push(input);
    },
  });

  await updater.update();

  assert.deepEqual(calls, [
    {
      command: 'npm.cmd',
      args: ['install', '-g', 'git+https://github.com/alexishida/dalhe-cli.git'],
      env: {
        [SKIP_OPENSPEC_POSTINSTALL_ENV]: '1',
      },
    },
    {
      command: 'npm.cmd',
      args: ['install', '-g', OPENSPEC_PACKAGE],
    },
  ]);
});

test('fails when repository url is missing', async () => {
  const updater = new SelfUpdater({
    repositoryUrl: '',
    runCommand: async () => {},
  });

  await assert.rejects(() => updater.update(), /Repositorio oficial do dalhe-cli nao configurado/);
});

test('update command prints executed install command', async () => {
  const command = new UpdateCommand({
    selfUpdater: {
      async update() {
        return {
          command: 'npm',
          args: ['install', '-g', 'git+https://github.com/alexishida/dalhe-cli.git'],
          target: 'git+https://github.com/alexishida/dalhe-cli.git',
          openspec: {
            command: 'npm',
            args: ['install', '-g', OPENSPEC_PACKAGE],
            target: OPENSPEC_PACKAGE,
          },
        };
      },
    },
  });

  const result = await command.execute([]);

  assert.match(result.message, /dalhe-cli atualizado com sucesso/);
  assert.match(result.message, /OpenSpec: @fission-ai\/openspec@latest/);
  assert.match(result.message, /- npm install -g git\+https:\/\/github\.com\/alexishida\/dalhe-cli\.git/);
  assert.match(result.message, /- npm install -g @fission-ai\/openspec@latest/);
});

test('update command rejects extra arguments', async () => {
  const command = new UpdateCommand({
    selfUpdater: {
      async update() {
        throw new Error('should not run');
      },
    },
  });

  await assert.rejects(
    () => command.execute(['agora']),
    (error) => error instanceof CliError && /Argumento invalido para update/.test(error.message),
  );
});
