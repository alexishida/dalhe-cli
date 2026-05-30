import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

test('npm pack includes package.json and skill templates', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'dalhe-cli-npm-cache-'));

  try {
    const result = spawnCommandSync(npmCommand, ['--cache', cacheDir, 'pack', '--dry-run'], {
      cwd: resolve(process.cwd()),
      encoding: 'utf8',
    });
    const output = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, 0, output);
    assert.match(output, /package\.json/);
    assert.match(output, /src\/template\/skills\/rails-code-audit\/SKILL\.md/);
    assert.match(output, /src\/template\/skills\/code-review\/SKILL\.md/);
    assert.match(output, /src\/template\/skills\/nodejs-dev\/SKILL\.md/);
    assert.match(output, /src\/template\/skills\/pure-ruby\/SKILL\.md/);
  } finally {
    await rm(cacheDir, { force: true, recursive: true });
  }
});

test('package.json does not use npm install lifecycle scripts', async () => {
  const packageJson = JSON.parse(await readFile(resolve(process.cwd(), 'package.json'), 'utf8'));

  assert.equal(packageJson.scripts.preinstall, undefined);
  assert.equal(packageJson.scripts.install, undefined);
  assert.equal(packageJson.scripts.postinstall, undefined);
  assert.equal(packageJson.scripts.prepare, undefined);
});

function spawnCommandSync(command, args, options) {
  if (process.platform === 'win32' && command.endsWith('.cmd')) {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', buildWindowsCommand(command, args)], options);
  }

  return spawnSync(command, args, options);
}

function buildWindowsCommand(command, args) {
  return [command, ...args].map(quoteWindowsArg).join(' ');
}

function quoteWindowsArg(value) {
  if (value.length === 0) {
    return '""';
  }

  if (!/[\s"&^|<>]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}
