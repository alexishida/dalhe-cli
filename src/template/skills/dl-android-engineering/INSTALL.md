# Instalação

A pasta `dl-android-engineering/` segue o formato aberto de Agent Skills: um `SKILL.md` com frontmatter YAML e arquivos auxiliares em `references/`.

## Claude Code

Escopo pessoal:

```bash
mkdir -p ~/.claude/skills
cp -R dl-android-engineering ~/.claude/skills/
```

Escopo do projeto:

```bash
mkdir -p .claude/skills
cp -R dl-android-engineering .claude/skills/
```

No claude.ai, compacte a pasta e envie o ZIP pela área de Skills disponível na sua conta.

## Codex

Uma opção comum para skill local do repositório:

```bash
mkdir -p .agents/skills
cp -R dl-android-engineering .agents/skills/
```

Algumas superfícies do Codex também reconhecem skills em diretórios `.codex/skills` ou `~/.codex/skills`. Use o diretório suportado pela sua instalação/harness.

## Uso

A skill foi escrita para ativação automática por intenção. Você também pode solicitá-la explicitamente pelo nome:

```text
Use a skill dl-android-engineering para revisar esta feature Android.
```

ou, em superfícies que suportam invocação explícita de skill, use o mecanismo próprio da ferramenta.

## Estrutura

```text
dl-android-engineering/
├── SKILL.md
├── INSTALL.md
├── references/
│   ├── architecture.md
│   ├── maintenance.md
│   ├── performance.md
│   ├── platforms-adaptive.md
│   ├── platforms-cars.md
│   ├── platforms-tv.md
│   └── quality.md
└── assets/
    └── task-intake.md
```
