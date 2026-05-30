import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import packageJson from '../package.json' with { type: 'json' };

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gitCommand = process.platform === 'win32' ? 'git.exe' : 'git';
const tarCommand = process.platform === 'win32' ? 'tar.exe' : 'tar';

test('packed tarball installs successfully', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'dalhe-cli-npm-cache-'));
  const prefixDir = await mkdtemp(join(tmpdir(), 'dalhe-cli-prefix-'));
  const tarballName = `dalhe-cli-${packageJson.version}.tgz`;
  const tarballPath = resolve(process.cwd(), tarballName);

  try {
    const packResult = spawnCommandSync(npmCommand, ['--cache', cacheDir, 'pack'], {
      cwd: resolve(process.cwd()),
      encoding: 'utf8',
    });

    assert.equal(packResult.status, 0, packResult.stderr || packResult.stdout);

    const installResult = spawnCommandSync(
      npmCommand,
      ['--cache', cacheDir, 'install', '-g', tarballPath, '--prefix', prefixDir],
      {
        cwd: resolve(process.cwd()),
        encoding: 'utf8',
      },
    );

    assert.equal(installResult.status, 0, installResult.stderr || installResult.stdout);
  } finally {
    await rm(cacheDir, { force: true, recursive: true });
    await rm(prefixDir, { force: true, recursive: true });
    await rm(tarballPath, { force: true });
  }
});

test('git package installs as executable global command', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'dalhe-cli-npm-cache-'));
  const prefixDir = await mkdtemp(join(tmpdir(), 'dalhe-cli-prefix-'));
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-git-package-'));

  try {
    const packageDir = await createPackedGitRepository({ cacheDir, workspace });
    const installResult = spawnCommandSync(
      npmCommand,
      [
        '--cache',
        cacheDir,
        'install',
        '-g',
        `git+${pathToFileURL(packageDir).href}`,
        '--prefix',
        prefixDir,
      ],
      {
        cwd: resolve(process.cwd()),
        encoding: 'utf8',
      },
    );

    assert.equal(installResult.status, 0, installResult.stderr || installResult.stdout);

    const executablePath =
      process.platform === 'win32' ? join(prefixDir, 'dalhe.cmd') : join(prefixDir, 'bin', 'dalhe');
    const versionResult = spawnCommandSync(executablePath, ['--version'], {
      encoding: 'utf8',
    });

    assert.equal(versionResult.status, 0, versionResult.stderr || versionResult.stdout);
    assert.equal(versionResult.stdout, `dalhe ${packageJson.version}\n`);
  } finally {
    await rm(cacheDir, { force: true, recursive: true });
    await rm(prefixDir, { force: true, recursive: true });
    await rm(workspace, { force: true, recursive: true });
  }
});

async function createPackedGitRepository({ cacheDir, workspace }) {
  const packResult = spawnCommandSync(npmCommand, ['--cache', cacheDir, 'pack', '--pack-destination', workspace], {
    cwd: resolve(process.cwd()),
    encoding: 'utf8',
  });

  assert.equal(packResult.status, 0, packResult.stderr || packResult.stdout);

  const tarballName = (await readdir(workspace)).find((file) => file.endsWith('.tgz'));
  assert.ok(tarballName, 'npm pack did not create a tarball');

  const extractResult = spawnSync(tarCommand, ['-xf', join(workspace, tarballName), '-C', workspace], {
    encoding: 'utf8',
  });

  assert.equal(extractResult.status, 0, extractResult.stderr || extractResult.stdout);

  const packageDir = join(workspace, 'package');

  for (const args of [
    ['init'],
    ['add', '.'],
    ['-c', 'user.email=dalhe-cli@example.invalid', '-c', 'user.name=dalhe-cli', 'commit', '-m', 'package'],
  ]) {
    const result = spawnSync(gitCommand, args, {
      cwd: packageDir,
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
  }

  return packageDir;
}

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
