# dalhe-cli

CLI for bootstrapping projects with Dalhe base files.

## What it does

`dalhe init` copies the template from `src/template/init` into the current directory, prepares the initial project structure, and runs `openspec init --tools claude,codex`. Use `dalhe init --no-openspec` to create only the base files without installing or running OpenSpec.

`dalhe skill` lists skills from the official git repository, and installs, removes, and updates skills maintained in `src/template/skills`, publishing them globally for Codex and Claude Code.
Official skills use the `dl-` prefix.

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
npm install -g --allow-git=all git+https://github.com/alexishida/dalhe-cli.git
```

`--allow-git=all` is required by npm 12+, which blocks Git dependencies by
default. It enables Git fetching for this command only.

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
dalhe init --no-openspec
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
dalhe skill update <skill-name>
dalhe skill update
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
- Reports a conflict when a file or symbolic link occupies a required directory, before copying any template files.
- Uses exclusive file copies so a file created after the initial conflict check is not overwritten.
- If `openspec` is not available in `PATH`, runs `npm install -g @fission-ai/openspec@latest`.
- After copying, runs `openspec init --tools claude,codex` in current folder.
- This mode avoids the interactive OpenSpec menu and installs configuration directly for Claude Code and Codex.
- `dalhe init --no-openspec` copies only the template and skips OpenSpec installation and initialization.
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

Lists all skills available in the official git repository (`src/template/skills`), fetched directly from GitHub.
Each installed skill is marked with `(instalada)`.

If the remote repository is unreachable or not configured, it falls back to listing the skills shipped with the currently installed CLI version.
The remote request has a 5-second timeout, including reading the response body. Invalid responses also trigger the local fallback.

Currently included skills:

- `dl-matching-decomp`: reconstructing source to match reference binaries, with reproducible builds and byte-for-byte verification.
- `dl-android-engineering`: development, maintenance, debugging, review, and optimization of Android applications in Kotlin.
- `dl-c-cpp-expert`: implementation, refactoring, review, debugging, and performance optimization for C and C++ projects.
- `dl-rails-8`: support for development, refactoring, and review of Rails 8 apps.
- `dl-rails-code-audit`: structured Rails 7/8 audits focused on security, code smells, conventions, and Oracle or MariaDB/MySQL concerns.
- `dl-nodejs-dev`: support for developing and maintaining Node.js projects.
- `dl-pure-ruby`: support for developing and maintaining pure Ruby projects.
- `dl-code-review`: Rails code quality, architecture, and pattern analysis without modifying code.
- `dl-electron-react`: building, scaffolding, and structuring Electron desktop apps with React and TypeScript.
- `dl-flutter-engineer`: building, maintaining, debugging, reviewing, optimizing, testing, and shipping Flutter and Dart applications.
- `dl-rayban-meta-sdk`: building and integrating iOS/Android apps with Meta Wearables DAT for Ray-Ban Meta glasses, including the Gen 1 mobile path.
- `dl-tabler-ui`: building and maintaining accessible, responsive web application interfaces based on Tabler.

```bash
dalhe skill list
```

To force listing the installed version locally (no network), set `DALHE_CLI_SKIP_REMOTE_SKILL_LIST=1`.

### Installation

Downloads and installs the requested skill from the official GitHub repository in both environments. It requires internet access and does not fall back to bundled templates if the remote request fails.

- Codex: copies the entire skill folder to `$CODEX_HOME/skills/<skill-name>` when `CODEX_HOME` is explicitly configured.
- Codex without `CODEX_HOME`: uses `~/.agents/skills/<skill-name>` on Linux and `%USERPROFILE%\.agents\skills\<skill-name>` on Windows.
- Claude Code: copies entire skill folder to `~/.claude/skills/<skill-name>` on Linux and `%USERPROFILE%\.claude\skills\<skill-name>` on Windows.
- If skill already exists in global destination, that skill folder is replaced with current template version.
- Skill names must be directory names: `/`, `\`, `:` and null characters are rejected, as are the names `.` and `..`.
- Templates must contain a `SKILL.md` file; a directory with that name is not a valid template.
- Creates a Claude Code command at `~/.claude/commands/<skill-name>.md`, which is also removed on uninstallation.

```bash
dalhe skill install dl-rails-8
```

### Install all

Downloads and installs all skills available in the official GitHub repository globally for both Codex and Claude Code. This includes skills released after the installed CLI version; it requires internet access and does not fall back to bundled templates if the remote request fails.

```bash
dalhe skill install-all
```

### Uninstallation

Removes a skill only when it is installed in at least one managed destination. It does not require the skill to exist in the bundled templates or on GitHub.

```bash
dalhe skill uninstall dl-rails-8
```

### Uninstall all

Removes all skills shipped with this CLI from both global destinations.

```bash
dalhe skill uninstall-all
```

### Update from GitHub

Updates an installed skill directly from `src/template/skills` in the latest commit of the official GitHub repository's default branch. You do not need to update the CLI first.

```bash
dalhe skill update dl-rails-8
```

- Requires the skill to be installed in at least one managed destination (Codex, Claude Code, or its Claude command).
- Downloads the entire skill, including references, scripts, and binary assets, from the same commit. Script executable permissions are preserved on systems that support them.
- Replaces the installed folders in Codex and Claude Code and refreshes the Claude command. Local edits and obsolete files inside these folders are replaced or removed.
- Downloads and validates the selected skills in a temporary directory before replacing installed files. Network or download validation failures leave installed skills unchanged and return an error; updates never fall back to bundled templates.
- Requires internet access to GitHub. Requests have a 5-second timeout each; GitHub API errors, including rate limits, are reported.
- Downloads up to four files concurrently, without requiring Git or additional dependencies.
- Rejects remote symbolic links, submodules, and unsafe paths.
- `DALHE_CLI_SKIP_REMOTE_SKILL_LIST=1` only affects listing; it does not disable remote updates.

### Bulk update

Updates all skills present in the official GitHub repository that are already installed in at least one managed destination. This includes installed skills absent from the bundled CLI templates. Skills absent from GitHub are left untouched; uninstalled skills are not installed.

```bash
dalhe skill update
# Equivalent:
dalhe skill update-all
```

## `update` command

Updates CLI globally from official repository, syncs `OpenSpec`, and synchronizes globally installed skills:

```bash
dalhe update
```

Behavior:

- Runs `npm install -g --allow-git=all git+https://github.com/alexishida/dalhe-cli.git`.
- Then runs `npm install -g @fission-ai/openspec@latest`.
- Then syncs the globally installed skills directly from GitHub (equivalent to `dalhe skill update-all`).
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
