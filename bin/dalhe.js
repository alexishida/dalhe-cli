#!/usr/bin/env node

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from '../package.json' with { type: 'json' };
import { InitCommand } from '../src/commands/InitCommand.js';
import { SkillCommand } from '../src/commands/SkillCommand.js';
import { UpdateCommand } from '../src/commands/UpdateCommand.js';
import { CliApplication } from '../src/core/CliApplication.js';
import { OpenSpecInitializer } from '../src/services/OpenSpecInitializer.js';
import { SelfUpdater } from '../src/services/SelfUpdater.js';
import { SkillManager } from '../src/services/SkillManager.js';
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
      openSpecInitializer: new OpenSpecInitializer(),
      templateCopier: new TemplateCopier(),
      templateDir: resolve(projectRoot, 'src', 'template', 'init'),
      targetDir: process.cwd(),
    }),
    new SkillCommand({
      skillManager: new SkillManager({
        templateRootDir: resolve(projectRoot, 'src', 'template', 'skills'),
      }),
    }),
    new UpdateCommand({
      selfUpdater: new SelfUpdater({
        repositoryUrl: packageJson.repository?.url,
      }),
    }),
  ],
});

process.exitCode = await app.run(process.argv.slice(2), {
  stdout: process.stdout,
  stderr: process.stderr,
});
