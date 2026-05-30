import assert from 'node:assert/strict';
import test from 'node:test';
import { InitCommand } from '../src/commands/InitCommand.js';
import { CliError } from '../src/core/CliError.js';
import { DEFAULT_OPENSPEC_TOOLS } from '../src/services/OpenSpecInitializer.js';
import { OPENSPEC_PACKAGE } from '../src/services/SelfUpdater.js';

test('runs openspec after copying template', async () => {
  const calls = [];
  const command = new InitCommand({
    templateCopier: {
      async copy() {
        calls.push('copy');
        return {
          targetDir: '/tmp/projeto',
          filesCopied: 3,
        };
      },
    },
    openSpecInitializer: {
      async initialize(input) {
        calls.push(['openspec', input]);
        return {
          command: 'openspec',
          args: ['init', '--tools', DEFAULT_OPENSPEC_TOOLS],
        };
      },
    },
    templateDir: '/tmp/template',
    targetDir: '/tmp/projeto',
  });

  const result = await command.execute([]);

  assert.deepEqual(calls, [
    'copy',
    ['openspec', { targetDir: '/tmp/projeto' }],
  ]);
  assert.match(result.message, /Projeto iniciado em \/tmp\/projeto/);
  assert.match(result.message, /Arquivos copiados: 3/);
  assert.match(result.message, /OpenSpec: openspec init --tools claude,codex/);
});

test('prints openspec install command when initializer installs openspec', async () => {
  const command = new InitCommand({
    templateCopier: {
      async copy() {
        return {
          targetDir: '/tmp/projeto',
          filesCopied: 3,
        };
      },
    },
    openSpecInitializer: {
      async initialize() {
        return {
          command: 'openspec',
          args: ['init', '--tools', DEFAULT_OPENSPEC_TOOLS],
          install: {
            command: 'npm',
            args: ['install', '-g', OPENSPEC_PACKAGE],
            target: OPENSPEC_PACKAGE,
          },
        };
      },
    },
    templateDir: '/tmp/template',
    targetDir: '/tmp/projeto',
  });

  const result = await command.execute([]);

  assert.match(result.message, /OpenSpec instalado: npm install -g @fission-ai\/openspec@latest/);
  assert.match(result.message, /OpenSpec: openspec init --tools claude,codex/);
});

test('reports copied files when openspec init fails after copy', async () => {
  const command = new InitCommand({
    templateCopier: {
      async copy() {
        return {
          targetDir: '/tmp/projeto',
          filesCopied: 3,
        };
      },
    },
    openSpecInitializer: {
      async initialize() {
        throw new CliError('Nao foi possivel executar openspec.', {
          code: 'OPENSPEC_NOT_FOUND',
          exitCode: 1,
        });
      },
    },
    templateDir: '/tmp/template',
    targetDir: '/tmp/projeto',
  });

  await assert.rejects(
    () => command.execute([]),
    (error) =>
      error instanceof CliError &&
      error.code === 'OPENSPEC_NOT_FOUND' &&
      error.exitCode === 1 &&
      /Projeto copiado em \/tmp\/projeto, mas falha ao executar openspec init\./.test(error.message) &&
      /Arquivos copiados: 3/.test(error.message) &&
      /Nao foi possivel executar openspec\./.test(error.message),
  );
});
