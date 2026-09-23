# dl-tabler-ui

Skill portátil para Claude Code e OpenAI Codex, baseada no padrão Agent Skills (`SKILL.md`).

Ela orienta o agente a criar e manter aplicações com layout Tabler usando sempre CDN para dependências frontend, com foco em UI/UX, acessibilidade, responsividade e manutenção incremental.

## Estrutura

```text
dl-tabler-ui/
├── SKILL.md
├── README.md
├── assets/
│   └── tabler-shell.html
├── references/
│   ├── implementation-patterns.md
│   ├── tabler-cdn.md
│   └── ui-ux-checklist.md
└── scripts/
    └── check_cdn_policy.py
```

## Instalação no Claude Code

Instalação de usuário:

```bash
mkdir -p ~/.claude/skills
cp -R dl-tabler-ui ~/.claude/skills/
```

## Instalação no Codex

Instalação de usuário:

```bash
mkdir -p ~/.codex/skills
cp -R dl-tabler-ui ~/.codex/skills/
```

Ou, com escopo do repositório:

```text
.codex/skills/dl-tabler-ui/SKILL.md
```

## Uso explícito

Claude pode descobrir a skill automaticamente quando a tarefa for compatível. Você também pode pedir diretamente para usar `dl-tabler-ui`.

No Codex, use a skill pelo nome quando quiser forçar o fluxo, por exemplo:

```text
Use $dl-tabler-ui para implementar a tela de usuários seguindo o layout atual.
```

## Regra central

Dependências frontend de terceiros são servidas por CDN. A skill não deve adicionar Tabler, ícones, plugins visuais ou frameworks frontend via npm/yarn/pnpm/bun apenas para montar a interface.

## Validador opcional

Dentro de um projeto:

```bash
python /caminho/para/dl-tabler-ui/scripts/check_cdn_policy.py .
```

Ele procura padrões óbvios que contrariem a política de CDN. O resultado é heurístico e deve ser revisado por uma pessoa/agente.
