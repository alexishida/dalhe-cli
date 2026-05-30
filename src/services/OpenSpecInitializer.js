import { spawn } from 'node:child_process';
import { CliError } from '../core/CliError.js';
import { OPENSPEC_PACKAGE } from './SelfUpdater.js';

export const DEFAULT_OPENSPEC_TOOLS = 'claude,codex';

export class OpenSpecInitializer {
  constructor({
    installCommand = defaultInstallCommand,
    platform = process.platform,
    runCommand = defaultRunCommand,
  } = {}) {
    this.installCommand = installCommand;
    this.platform = platform;
    this.runCommand = runCommand;
  }

  async initialize({ targetDir }) {
    const command = this.#command();
    const args = ['init', '--tools', DEFAULT_OPENSPEC_TOOLS];
    let install = null;

    try {
      await this.#runOpenSpec({ command, args, targetDir });
    } catch (error) {
      if (!(error instanceof CliError) || error.code !== 'OPENSPEC_NOT_FOUND') {
        throw error;
      }

      install = await this.#installOpenSpec();
      await this.#runOpenSpec({ command, args, targetDir });
    }

    return {
      command,
      args,
      install,
      targetDir,
    };
  }

  #command() {
    return this.platform === 'win32' ? 'openspec.cmd' : 'openspec';
  }

  #npmCommand() {
    return this.platform === 'win32' ? 'npm.cmd' : 'npm';
  }

  async #installOpenSpec() {
    const command = this.#npmCommand();
    const args = ['install', '-g', OPENSPEC_PACKAGE];

    await this.installCommand({ command, args });

    return {
      command,
      args,
      target: OPENSPEC_PACKAGE,
    };
  }

  #runOpenSpec({ command, args, targetDir }) {
    return this.runCommand({
      command,
      args,
      cwd: targetDir,
    });
  }
}

function defaultRunCommand({ command, args, cwd }) {
  return new Promise((resolve, reject) => {
    const child = spawnCommand(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(
          new CliError(
            'Could not run openspec. Make sure OpenSpec is installed and available in PATH.',
            { code: 'OPENSPEC_NOT_FOUND' },
          ),
        );
        return;
      }

      reject(
        new CliError(`Failed to run openspec init: ${error.message}`, {
          code: 'OPENSPEC_INIT_FAILED',
        }),
      );
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const details = [stderr.trim(), stdout.trim()].find(Boolean) || `openspec returned code ${code}`;

      reject(
        new CliError(`Failed to run openspec init.\n${details}`, {
          code: 'OPENSPEC_INIT_FAILED',
          exitCode: code ?? 1,
        }),
      );
    });
  });
}

function defaultInstallCommand({ command, args }) {
  return new Promise((resolve, reject) => {
    const child = spawnCommand(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(
          new CliError(
            `Could not run ${command}. Make sure npm is installed and available in PATH.`,
            { code: 'NPM_NOT_FOUND' },
          ),
        );
        return;
      }

      reject(
        new CliError(`Failed to run ${command}: ${error.message}`, {
          code: 'OPENSPEC_INSTALL_FAILED',
        }),
      );
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const details = [stderr.trim(), stdout.trim()].find(Boolean) || `npm returned code ${code}`;

      reject(
        new CliError(`Failed to install OpenSpec automatically.\n${details}`, {
          code: 'OPENSPEC_INSTALL_FAILED',
          exitCode: code ?? 1,
        }),
      );
    });
  });
}

function spawnCommand(command, args, options) {
  if (process.platform === 'win32' && command.endsWith('.cmd')) {
    return spawn('cmd.exe', ['/d', '/s', '/c', buildWindowsCommand(command, args)], options);
  }

  return spawn(command, args, options);
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
