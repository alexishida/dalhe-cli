import assert from 'node:assert/strict';
import test from 'node:test';
import { CliError } from '../src/core/CliError.js';
import { OPENSPEC_PACKAGE } from '../src/services/SelfUpdater.js';
import {
  DEFAULT_OPENSPEC_TOOLS,
  OpenSpecInitializer,
} from '../src/services/OpenSpecInitializer.js';

const openspecCommand = process.platform === 'win32' ? 'openspec.cmd' : 'openspec';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

test('runs openspec init in target directory', async () => {
  const calls = [];
  const initializer = new OpenSpecInitializer({
    runCommand: async (input) => {
      calls.push(input);
    },
  });

  const result = await initializer.initialize({
    targetDir: '/tmp/projeto',
  });

  assert.deepEqual(calls, [
    {
      command: openspecCommand,
      args: ['init', '--tools', DEFAULT_OPENSPEC_TOOLS],
      cwd: '/tmp/projeto',
    },
  ]);
  assert.equal(result.command, openspecCommand);
  assert.equal(result.install, null);
  assert.equal(result.targetDir, '/tmp/projeto');
});

test('uses openspec.cmd on Windows', async () => {
  const calls = [];
  const initializer = new OpenSpecInitializer({
    platform: 'win32',
    runCommand: async (input) => {
      calls.push(input);
    },
  });

  await initializer.initialize({
    targetDir: 'C:\\projeto',
  });

  assert.deepEqual(calls, [
    {
      command: 'openspec.cmd',
      args: ['init', '--tools', DEFAULT_OPENSPEC_TOOLS],
      cwd: 'C:\\projeto',
    },
  ]);
});

test('propagates cli errors from openspec init', async () => {
  const initializer = new OpenSpecInitializer({
    runCommand: async () => {
      throw new CliError('falha controlada', {
        code: 'OPENSPEC_INIT_FAILED',
        exitCode: 2,
      });
    },
  });

  await assert.rejects(
    () =>
      initializer.initialize({
        targetDir: '/tmp/projeto',
      }),
    (error) =>
      error instanceof CliError &&
      error.code === 'OPENSPEC_INIT_FAILED' &&
      error.exitCode === 2 &&
      error.message === 'falha controlada',
  );
});

test('installs openspec globally when command is missing, then runs init', async () => {
  const installCalls = [];
  const runCalls = [];
  const initializer = new OpenSpecInitializer({
    installCommand: async (input) => {
      installCalls.push(input);
    },
    runCommand: async (input) => {
      runCalls.push(input);

      if (runCalls.length === 1) {
        throw new CliError('openspec ausente', {
          code: 'OPENSPEC_NOT_FOUND',
        });
      }
    },
  });

  const result = await initializer.initialize({
    targetDir: '/tmp/projeto',
  });

  assert.deepEqual(installCalls, [
    {
      command: npmCommand,
      args: ['install', '-g', OPENSPEC_PACKAGE],
    },
  ]);
  assert.deepEqual(runCalls, [
    {
      command: openspecCommand,
      args: ['init', '--tools', DEFAULT_OPENSPEC_TOOLS],
      cwd: '/tmp/projeto',
    },
    {
      command: openspecCommand,
      args: ['init', '--tools', DEFAULT_OPENSPEC_TOOLS],
      cwd: '/tmp/projeto',
    },
  ]);
  assert.deepEqual(result.install, {
    command: npmCommand,
    args: ['install', '-g', OPENSPEC_PACKAGE],
    target: OPENSPEC_PACKAGE,
  });
});
