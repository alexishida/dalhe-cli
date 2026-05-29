import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import packageJson from '../package.json' with { type: 'json' };

const execFileAsync = promisify(execFile);
const cliPath = resolve(process.cwd(), 'bin', 'dalhe.js');

test('prints help with --help and -h', async () => {
  const longOption = await execFileAsync(process.execPath, [cliPath, '--help']);
  const shortOption = await execFileAsync(process.execPath, [cliPath, '-h']);

  assert.match(longOption.stdout, /Uso:/);
  assert.match(longOption.stdout, /Comandos:/);
  assert.match(longOption.stdout, /Mais informacoes: https:\/\/github\.com\/alexishida\/dalhe-cli/);
  assert.doesNotMatch(longOption.stdout, /^dalhe /);
  assert.equal(shortOption.stdout, longOption.stdout);
  assert.equal(longOption.stderr, '');
  assert.equal(shortOption.stderr, '');
});

test('prints version with --version and -v', async () => {
  const longOption = await execFileAsync(process.execPath, [cliPath, '--version']);
  const shortOption = await execFileAsync(process.execPath, [cliPath, '-v']);

  assert.equal(longOption.stdout, `dalhe ${packageJson.version}\n`);
  assert.equal(shortOption.stdout, `dalhe ${packageJson.version}\n`);
  assert.equal(longOption.stderr, '');
  assert.equal(shortOption.stderr, '');
});
