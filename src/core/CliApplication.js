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
      io.stdout.write(this.#helpText());
      return 0;
    }

    if (this.#isVersion(commandName)) {
      io.stdout.write(`${this.#name} ${this.#version}\n`);
      return 0;
    }

    const command = this.#commands.get(commandName);

    if (!command) {
      io.stderr.write(`Comando desconhecido: ${commandName}\n\n${this.#helpText()}`);
      return 1;
    }

    if (commandArgs.some((arg) => this.#isHelp(arg))) {
      io.stdout.write(command.helpText());
      return 0;
    }

    try {
      const result = await command.execute(commandArgs);

      if (result?.message) {
        io.stdout.write(result.message);
      }

      return result?.exitCode ?? 0;
    } catch (error) {
      if (error instanceof CliError) {
        io.stderr.write(`${error.message}\n`);
        return error.exitCode;
      }

      io.stderr.write(`Erro inesperado: ${error.message}\n`);
      return 1;
    }
  }

  #helpText() {
    const commands = [...this.#commands.values()]
      .map((command) => `  ${command.name.padEnd(10)} ${command.description}`)
      .join('\n');

    return [
      'Uso:',
      `  ${this.#name} <comando>`,
      '',
      'Comandos:',
      commands,
      '',
      'Opcoes:',
      '  -h, --help   Mostra ajuda',
      '  -v, --version Mostra versao',
      ...(this.#homepage ? ['', `Mais informacoes: ${this.#homepage}`] : []),
      '',
    ].join('\n');
  }

  #isHelp(arg) {
    return arg === '-h' || arg === '--help';
  }

  #isVersion(arg) {
    return arg === '-v' || arg === '--version';
  }
}
