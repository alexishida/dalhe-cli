import { CliError } from './CliError.js';

export class CliApplication {
  #commands;
  #homepage;
  #name;
  #version;

  constructor({ name, version, homepage, commands }) {
    this.#name = name;
    this.#version = version;
    this.#homepage = homepage;
    this.#commands = new Map(commands.map((command) => [command.name, command]));
  }

  async run(argv, io) {
    const [commandName, ...commandArgs] = argv;

    if (!commandName || this.#isHelp(commandName)) {
      await this.#write(io.stdout, this.#helpText());
      return 0;
    }

    if (this.#isVersion(commandName)) {
      await this.#write(io.stdout, `${this.#name} ${this.#version}\n`);
      return 0;
    }

    const command = this.#commands.get(commandName);

    if (!command) {
      await this.#write(io.stderr, `Unknown command: ${commandName}\n\n${this.#helpText()}`);
      return 1;
    }

    if (commandArgs.some((arg) => this.#isHelp(arg))) {
      await this.#write(io.stdout, command.helpText());
      return 0;
    }

    try {
      const result = await command.execute(commandArgs);

      if (result?.message) {
        await this.#write(io.stdout, result.message);
      }

      return result?.exitCode ?? 0;
    } catch (error) {
      if (error instanceof CliError) {
        await this.#write(io.stderr, `${error.message}\n`);
        return error.exitCode;
      }

      await this.#write(io.stderr, `Unexpected error: ${error.message}\n`);
      return 1;
    }
  }

  #helpText() {
    const commands = [...this.#commands.values()]
      .map((command) => `  ${command.name.padEnd(10)} ${command.description}`)
      .join('\n');

    return [
      'Usage:',
      `  ${this.#name} <command>`,
      '',
      'Commands:',
      commands,
      '',
      'Options:',
      '  -h, --help    Show help',
      '  -v, --version Show version',
      ...(this.#homepage ? ['', `More information: ${this.#homepage}`] : []),
      '',
    ].join('\n');
  }

  #isHelp(arg) {
    return arg === '-h' || arg === '--help';
  }

  #isVersion(arg) {
    return arg === '-v' || arg === '--version';
  }

  #write(stream, text) {
    return new Promise((resolve, reject) => {
      stream.write(text, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}
