# Binary Recompilation Engineer Skill

Portable Agent Skill for binary recompilation and native-port engineering.

## Contents

```text
dl-binary-recompilation-engineer/
├── SKILL.md
└── references/
    ├── architecture-patterns.md
    ├── platform-notes.md
    └── validation-checklist.md
```

## Codex

Repository-local installation:

```text
<repo>/.agents/skills/dl-binary-recompilation-engineer/
```

User-level installation:

```text
~/.agents/skills/dl-binary-recompilation-engineer/
```

Invoke explicitly as appropriate for your Codex client, or allow the description to trigger it automatically.

## Claude Code

User-level installation:

```text
~/.claude/skills/dl-binary-recompilation-engineer/
```

It may also be distributed using Claude's skill/plugin mechanisms.

## Design choice

The `SKILL.md` frontmatter intentionally uses only:

```yaml
name:
description:
```

The instructions avoid vendor-specific tool names, permissions, hooks, subagents, or proprietary metadata so the same skill can be used by both ecosystems.

## Suggested prompts

```text
Use the dl-binary-recompilation-engineer skill to design a PS1 MIPS-to-C AOT recompiler with overlay support.
```

```text
Use the dl-binary-recompilation-engineer skill to review this PowerPC recompilation repository for ABI and relocation bugs.
```

```text
Use the dl-binary-recompilation-engineer skill to add differential tests between this interpreter and generated C++.
```

```text
Use the dl-binary-recompilation-engineer skill to design function discovery for a stripped executable with jump tables.
```
