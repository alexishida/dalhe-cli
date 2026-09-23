# dl-flutter-engineer

Portable Agent Skill for senior Flutter/Dart engineering work across Claude Code and OpenAI Codex.

## What it covers

- New Flutter apps and feature implementation
- Maintenance and legacy refactoring
- Debugging and root-cause analysis
- Architecture and design patterns
- State management and dependency boundaries
- Performance profiling and optimization
- Unit, widget, integration, and regression testing
- Dependency and Flutter/Dart SDK migrations
- Native Android/iOS/web/desktop integration
- Security, secrets, permissions, CI/CD, and release readiness
- Code review with risk-based prioritization

## Install in Claude Code

User-level installation:

```bash
mkdir -p ~/.claude/skills
cp -R dl-flutter-engineer ~/.claude/skills/
```

Then ask Claude Code for Flutter work normally, or explicitly mention `dl-flutter-engineer` when you want to force use of the skill.

## Install in Codex

User-level installation:

```bash
mkdir -p ~/.codex/skills
cp -R dl-flutter-engineer ~/.codex/skills/
```

Repository-scoped installation:

```bash
mkdir -p .codex/skills
cp -R dl-flutter-engineer .codex/skills/
```

Codex discovers the skill from its `SKILL.md` metadata. You can also explicitly ask Codex to use `dl-flutter-engineer`.

## Design notes

The skill intentionally does not hard-code one state-management package or one architecture. It first inspects the project and preserves sound existing conventions. For new projects, it uses separation of concerns, explicit data boundaries, testability, and predictable state flow as its baseline.

It also avoids hard-coding dependency versions. Flutter, Dart, packages, Android/iOS toolchains, and plugins evolve quickly, so the agent is instructed to inspect the repository and verify current documentation when necessary.
