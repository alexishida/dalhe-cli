export class CliError extends Error {
  constructor(message, { code = 'CLI_ERROR', exitCode = 1 } = {}) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.exitCode = exitCode;
  }
}
