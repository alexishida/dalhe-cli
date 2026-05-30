import { spawn } from 'node:child_process';
import { CliError } from '../core/CliError.js';

export const OPENSPEC_PACKAGE = '@fission-ai/openspec@latest';
export const SKIP_OPENSPEC_POSTINSTALL_ENV = 'DALHE_CLI_SKIP_OPENSPEC_POSTINSTALL';

export class SelfUpdater {
  constructor({
    repositoryUrl,
    platform = process.platform,
    runCommand = defaultRunCommand,
  }) {
    this.repositoryUrl = repositoryUrl;
    this.platform = platform;
    this.runCommand = runCommand;
  }

  async update() {
    const target = this.#installTarget();
    const command = this.#npmCommand();
    const args = ['install', '-g', target];
    const openspecArgs = ['install', '-g', OPENSPEC_PACKAGE];

    await this.runCommand({
      command,
      args,
      env: {
        [SKIP_OPENSPEC_POSTINSTALL_ENV]: '1',
      },
    });
    await this.runCommand({ command, args: openspecArgs });

    return {
      command,
      args,
      target,
      openspec: {
        command,
        args: openspecArgs,
        target: OPENSPEC_PACKAGE,
      },
    };
  }

  #installTarget() {
    if (!this.repositoryUrl) {
      throw new CliError('Official dalhe-cli repository is not configured.', {
        code: 'MISSING_REPOSITORY_URL',
      });
    }

    return this.repositoryUrl.startsWith('git+') ? this.repositoryUrl : `git+${this.repositoryUrl}`;
  }

  #npmCommand() {
    return this.platform === 'win32' ? 'npm.cmd' : 'npm';
  }
}

function defaultRunCommand({ command, args, env = {} }) {
  return new Promise((resolve, reject) => {
    const child = spawnCommand(command, args, {
      env: {
        ...process.env,
        ...env,
      },
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
          code: 'UPDATE_FAILED',
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
        new CliError(`Failed to update dalhe-cli.\n${details}`, {
          code: 'UPDATE_FAILED',
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
