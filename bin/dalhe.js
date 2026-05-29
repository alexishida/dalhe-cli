#!/usr/bin/env node

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from '../package.json' with { type: 'json' };
import { InitCommand } from '../src/commands/InitCommand.js';
import { CliApplication } from '../src/core/CliApplication.js';
import { TemplateCopier } from '../src/services/TemplateCopier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const app = new CliApplication({
  name: 'dalhe',
  version: packageJson.version,
  homepage: packageJson.homepage,
  commands: [
    new InitCommand({
      templateCopier: new TemplateCopier(),
      templateDir: resolve(projectRoot, 'src', 'template', 'init'),
      targetDir: process.cwd(),
    }),
  ],
});

process.exitCode = await app.run(process.argv.slice(2), {
  stdout: process.stdout,
  stderr: process.stderr,
});
