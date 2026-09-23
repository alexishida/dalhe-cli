# dl-c-cpp-expert

Portable Agent Skill for expert C and C++ engineering, design patterns, debugging, concurrency, and measured performance optimization.

The same skill contents can be used by Claude Code and OpenAI Codex because both support the `SKILL.md` Agent Skills format.

## Install in Claude Code

Project-local:

```sh
mkdir -p .claude/skills
cp -R dl-c-cpp-expert .claude/skills/
```

Personal:

```sh
mkdir -p ~/.claude/skills
cp -R dl-c-cpp-expert ~/.claude/skills/
```

## Install in Codex

Project-local:

```sh
mkdir -p .agents/skills
cp -R dl-c-cpp-expert .agents/skills/
```

A common setup for a repository used by both tools is to keep one canonical copy and symlink it:

```sh
mkdir -p .skills .claude/skills .agents/skills
cp -R dl-c-cpp-expert .skills/
ln -s ../../.skills/dl-c-cpp-expert .claude/skills/dl-c-cpp-expert
ln -s ../../.skills/dl-c-cpp-expert .agents/skills/dl-c-cpp-expert
```

Adjust symlink paths to match your repository layout/platform.

## Suggested prompts

- `Revise este módulo C procurando UB, leaks e oportunidades de simplificação.`
- `Otimize este hot path em C++ e só proponha mudanças com hipótese mensurável.`
- `Projete uma API C estável para este componente sem expor a implementação.`
- `Analise esta classe C++ quanto a ownership, lifetime e Rule of Zero.`
- `Compare AoS e SoA para este workload e proponha um benchmark.`
- `Investigue esta race condition e explique o happens-before.`
- `Refatore isso para C++20 idiomático sem alterar a ABI pública.`

## Contents

- `SKILL.md`: core behavior and routing metadata.
- `references/patterns.md`: C/C++ architecture and pattern guidance.
- `references/performance.md`: profiling and optimization workflow.
- `references/concurrency.md`: synchronization and atomics guidance.
- `references/tooling.md`: compilers, CMake, warnings, sanitizers, analysis.
- `references/review-checklist.md`: deep-review checklist.
- `scripts/check-cpp.sh`: optional non-invasive clang-tidy helper.
- `assets/benchmark-notes.md`: benchmark record template.
