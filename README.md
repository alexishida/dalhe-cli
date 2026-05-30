# dalhe-cli

CLI for bootstrapping projects with Dalhe base files.

## What it does

`dalhe init` copies the template from `src/template/init` into the current directory, prepares the initial project structure, and runs `openspec init --tools claude,codex`.

`dalhe skill` lists, installs, removes, and updates skills maintained in `src/template/skills`, publishing them globally for Codex and Claude Code.
Official skills do not use prefixes.

`dalhe update` updates the global CLI installation and also updates `OpenSpec`.

Current template includes:

- `AGENTS.md`
- `CLAUDE.md`
- `.ai-framework/DESIGN.md`
- `.ai-framework/RULES.md`

During `init`, if any destination file already exists, execution stops and nothing is overwritten.

## Requirements

- Node.js `>=22.0.0`

## Installation

Package on npm: https://www.npmjs.com/package/dalhe-cli

### Via npm

Install directly from npm:

```bash
npm install -g dalhe-cli
```

`OpenSpec` is installed automatically on the first `dalhe init` if it is not already available in `PATH`.

### Via internal Git repository

Install directly from repository:

```bash
npm install -g git+https://github.com/alexishida/dalhe-cli.git
```

`OpenSpec` is installed automatically on the first `dalhe init` if it is not already available in `PATH`.

### Via local source code

Inside project repository:

```bash
npm install -g .
```

`OpenSpec` is installed automatically on the first `dalhe init` if it is not already available in `PATH`.

## Quick start

Go into folder where you want to create project base:

```bash
dalhe init
```

Example:

```bash
mkdir my-project
cd ./my-project
dalhe init
```

## Commands

```bash
dalhe init
dalhe skill list
dalhe skill install <skill-name>
dalhe skill install-all
dalhe skill uninstall <skill-name>
dalhe skill uninstall-all
dalhe skill update-all
dalhe update
dalhe --help
dalhe -h
dalhe --version
dalhe -v
```

## `init` behavior

- Copies all template files into current folder.
- Creates required directories automatically.
- Blocks overwrites when a conflict is found.
- If `openspec` is not available in `PATH`, runs `npm install -g @fission-ai/openspec@latest`.
- After copying, runs `openspec init --tools claude,codex` in current folder.
- This mode avoids the interactive OpenSpec menu and installs configuration directly for Claude Code and Codex.
- Requires `npm` to be installed in order to install `OpenSpec` automatically when needed.
- Shows total number of copied files at the end.

## Project structure

- `bin/dalhe.js`: CLI entry point.
- `src/commands`: application commands.
- `src/core`: execution base and error handling.
- `src/services`: support services.
- `src/template/init`: base files copied by `init`.
- `src/template/skills`: skill helper files maintained in repository.
- `test`: automated tests.
- `.ai-framework/RULES.md`: official project rules, including technical context and mandatory change guidelines.

## `skill` command

### Listing

Lists all skills available in `src/template/skills`.

Currently included skills:

- `rails8`: support for development, refactoring, and review of Rails 8 apps.
- `rails-code-audit`: structured Rails 7/8 audits focused on security, code smells, conventions, and Oracle or MariaDB/MySQL concerns.
- `nodejs-dev`: support for developing and maintaining Node.js projects.
- `pure-ruby`: support for developing and maintaining pure Ruby projects.

```bash
dalhe skill list
```

### Installation

Installs a skill globally in both environments:

- Codex: copies entire skill folder to `$CODEX_HOME/skills/<skill-name>`.
- Codex without `CODEX_HOME`: uses `~/.codex/skills/<skill-name>` on Linux and `%USERPROFILE%\.codex\skills\<skill-name>` on Windows.
- Claude Code: copies entire skill folder to `~/.claude/skills/<skill-name>` on Linux and `%USERPROFILE%\.claude\skills\<skill-name>` on Windows.
- If skill already exists in global destination, that skill folder is replaced with current template version.

```bash
dalhe skill install rails8
```

### Install all

Installs all skills shipped with this CLI globally for both Codex and Claude Code.

```bash
dalhe skill install-all
```

### Uninstallation

Removes skill from both global destinations.

```bash
dalhe skill uninstall rails8
```

### Uninstall all

Removes all skills shipped with this CLI from both global destinations.

```bash
dalhe skill uninstall-all
```

### Bulk update

Reinstalls all skills from this CLI that are already installed in at least one managed destination, syncing current template version to Codex and Claude Code.

```bash
dalhe skill update-all
```

## `update` command

Updates CLI globally from official repository and syncs `OpenSpec`:

```bash
dalhe update
```

Behavior:

- Runs `npm install -g git+https://github.com/alexishida/dalhe-cli.git`.
- Then runs `npm install -g @fission-ai/openspec@latest`.
- Uses `npm.cmd` on Windows.
- Uses `npm` on Linux.
- Requires `npm` to be installed and permission to update global packages.

## Local development

Any project change must keep this `README.md` updated whenever there is impact on behavior, usage, commands, flow, structure, requirements, or any relevant tool context.

```bash
npm install
npm test
node ./bin/dalhe.js --help
```

To test full flow without installing globally:

```bash
node ./bin/dalhe.js init
```

In this case, make sure `npm` is installed and available in `PATH`, so CLI can install `OpenSpec` automatically when needed.

## License

MIT

## Publish package to npm

If you need to renew npm authentication before publishing:

```bash
npm logout
npm login
npm whoami
npm publish
```
