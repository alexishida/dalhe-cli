import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, parse, resolve } from 'node:path';
import test from 'node:test';
import packageJson from '../package.json' with { type: 'json' };
import { DEFAULT_OPENSPEC_TOOLS } from '../src/services/OpenSpecInitializer.js';

const cliPath = resolve(process.cwd(), 'bin', 'dalhe.js');
const openspecCommand = process.platform === 'win32' ? 'openspec.cmd' : 'openspec';

function runCli(args, { cwd, env } = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  });
}

test('prints help with --help and -h', async () => {
  const longOption = runCli(['--help']);
  const shortOption = runCli(['-h']);

  assert.match(longOption.stdout, /Usage:/);
  assert.match(longOption.stdout, /Commands:/);
  assert.match(longOption.stdout, /skill/);
  assert.match(longOption.stdout, /update/);
  assert.match(longOption.stdout, /More information: https:\/\/github\.com\/alexishida\/dalhe-cli/);
  assert.doesNotMatch(longOption.stdout, /^dalhe /);
  assert.equal(shortOption.stdout, longOption.stdout);
  assert.equal(longOption.stderr, '');
  assert.equal(shortOption.stderr, '');
  assert.equal(longOption.status, 0);
  assert.equal(shortOption.status, 0);
});

test('prints version with --version and -v', async () => {
  const longOption = runCli(['--version']);
  const shortOption = runCli(['-v']);

  assert.equal(longOption.stdout, `dalhe ${packageJson.version}\n`);
  assert.equal(shortOption.stdout, `dalhe ${packageJson.version}\n`);
  assert.equal(longOption.stderr, '');
  assert.equal(shortOption.stderr, '');
  assert.equal(longOption.status, 0);
  assert.equal(shortOption.status, 0);
});

test('lists available skills', async () => {
  const fakeHome = await mkdtemp(resolve(tmpdir(), 'dalhe-cli-home-'));

  try {
    const result = runCli(['skill', 'list'], {
      env: {
        HOME: fakeHome,
        CODEX_HOME: resolve(fakeHome, 'codex-home'),
      },
    });

    assert.match(result.stdout, /Available skills:/);
    assert.match(result.stdout, /rails8/);
    assert.doesNotMatch(result.stdout, /Codex: not found/);
    assert.doesNotMatch(result.stdout, /Claude Code: not found/);
    assert.doesNotMatch(result.stdout, /\/codex-home\/skills\/rails8/);
    assert.doesNotMatch(result.stdout, /\/\.claude\/skills\/rails8/);
    assert.equal(result.stderr, '');
    assert.equal(result.status, 0);
  } finally {
    await rm(fakeHome, { force: true, recursive: true });
  }
});

test('initializes project and runs openspec init', async () => {
  const workspace = await mkdtemp(resolve(tmpdir(), 'dalhe-cli-init-'));
  const binDir = join(workspace, 'bin');
  const markerFile = join(workspace, '.openspec-ran');
  const env = {
    PATH: `${binDir}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH || ''}`,
  };

  try {
    await createFakeOpenSpec(binDir, markerFile);

    const result = runCli(['init'], {
      cwd: workspace,
      env,
    });

    assert.match(result.stdout, /Project initialized in/);
    assert.match(result.stdout, /Files copied: \d+/);
    assert.match(result.stdout, new RegExp(`OpenSpec: ${openspecCommand.replace('.', '\\.')} init --tools claude,codex`));
    assert.equal(result.stderr, '');
    assert.equal(result.status, 0);
    assert.equal(await readFile(markerFile, 'utf8'), `init --tools ${DEFAULT_OPENSPEC_TOOLS}\n`);
    assert.equal((await readFile(join(workspace, 'AGENTS.md'), 'utf8')).length > 0, true);
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('updates all installed skills', async () => {
  const fakeHome = await mkdtemp(resolve(tmpdir(), 'dalhe-cli-home-update-all-'));
  const codexHome = resolve(fakeHome, 'codex-home');
  const installedSkillFile = join(codexHome, 'skills', 'rails8', 'SKILL.md');
  const templateSkillFile = resolve(process.cwd(), 'src', 'template', 'skills', 'rails8', 'SKILL.md');
  const env = {
    HOME: fakeHome,
    USERPROFILE: fakeHome,
    CODEX_HOME: codexHome,
  };

  try {
    const installResult = runCli(['skill', 'install', 'rails8'], { env });

    assert.equal(installResult.status, 0);

    await writeFile(installedSkillFile, '# versao antiga\n');

    const result = runCli(['skill', 'update-all'], { env });

    assert.match(result.stdout, /1 skill updated globally\./);
    assert.match(result.stdout, /- rails8/);
    assert.equal(result.stderr, '');
    assert.equal(result.status, 0);
    assert.equal(
      await readFile(installedSkillFile, 'utf8'),
      await readFile(templateSkillFile, 'utf8'),
    );
  } finally {
    await rm(fakeHome, { force: true, recursive: true });
  }
});

test('installs all available skills', async () => {
  const fakeHome = await mkdtemp(resolve(tmpdir(), 'dalhe-cli-home-install-all-'));
  const codexHome = resolve(fakeHome, 'codex-home');
  const parsedHome = parse(fakeHome);
  const env = {
    HOME: fakeHome,
    USERPROFILE: fakeHome,
    HOMEDRIVE: parsedHome.root.replace(/[\\\/]+$/, ''),
    HOMEPATH: fakeHome.slice(parsedHome.root.length - 1),
    CODEX_HOME: codexHome,
  };

  try {
    const result = runCli(['skill', 'install-all'], { env });

    assert.match(result.stdout, /\d+ skills installed globally\./);
    assert.match(result.stdout, /- rails8/);
    assert.equal(result.stderr, '');
    assert.equal(result.status, 0);
    assert.equal((await readFile(join(codexHome, 'skills', 'rails8', 'SKILL.md'), 'utf8')).length > 0, true);
    assert.equal(
      (await readFile(join(fakeHome, '.claude', 'skills', 'rails8', 'SKILL.md'), 'utf8')).length > 0,
      true,
    );
  } finally {
    await rm(fakeHome, { force: true, recursive: true });
  }
});

async function createFakeOpenSpec(binDir, markerFile) {
  await rm(binDir, { force: true, recursive: true });
  await writeFile(markerFile, '');
  await mkdir(binDir, { recursive: true });

  if (process.platform === 'win32') {
    const scriptPath = join(binDir, 'openspec.js');
    const commandPath = join(binDir, 'openspec.cmd');

    await writeFile(
      scriptPath,
      [
        "const { appendFileSync } = require('node:fs');",
        `appendFileSync(${JSON.stringify(markerFile)}, process.argv.slice(2).join(' ') + '\\n');`,
      ].join('\n'),
    );
    await writeFile(commandPath, `@echo off\r\n"${process.execPath}" "${scriptPath}" %*\r\n`);
    return;
  }

  const commandPath = join(binDir, 'openspec');

  await writeFile(
    commandPath,
    [
      '#!/usr/bin/env node',
      "const { appendFileSync } = require('node:fs');",
      `appendFileSync(${JSON.stringify(markerFile)}, process.argv.slice(2).join(' ') + '\\n');`,
    ].join('\n'),
  );
  await chmod(commandPath, 0o755);
}
