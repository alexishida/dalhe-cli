# Rust Engineering Expert — Agent Skill

Skill portátil para **Codex** e **Claude Code**, focada em desenvolvimento, manutenção, debugging, revisão, performance e hardening de projetos Rust.

## O que ela cobre

- implementação e refatoração idiomática;
- ownership, borrowing, lifetimes, traits e desenho de APIs;
- diagnóstico de erros do compilador e Clippy;
- Cargo workspaces, features, MSRV e semver;
- manutenção, upgrades e regressões;
- testes, CI e quality gates;
- profiling e otimização de CPU, memória, alocações, latência, throughput, tamanho de binário e tempo de compilação;
- async/concurrency, Tokio e outros runtimes;
- `unsafe`, FFI, pinning e revisão de soundness;
- segurança e robustez de produção.

A skill segue o padrão aberto **Agent Skills**: uma pasta contendo `SKILL.md` com frontmatter YAML e instruções, além de referências/scripts opcionais.

## Estrutura

```text
dl-rust-engineering-expert/
├── SKILL.md
├── README.md
├── assets/
│   ├── performance-report.md
│   └── review-report.md
├── evals/
│   └── trigger-cases.md
├── references/
│   ├── async-concurrency.md
│   ├── cargo-tooling.md
│   ├── development.md
│   ├── maintenance.md
│   ├── performance.md
│   ├── unsafe-security.md
│   └── verification.md
└── scripts/
    ├── project-snapshot.sh
    └── rust-verify.sh
```

## Instalação no Codex

Para usar dentro de um repositório, copie a pasta para:

```text
.agents/skills/dl-rust-engineering-expert/
```

Exemplo em macOS/Linux/WSL, executado na raiz do projeto:

```bash
mkdir -p .agents/skills
cp -R /caminho/dl-rust-engineering-expert .agents/skills/
```

O Codex pode selecionar a skill automaticamente pelo `description`. Para solicitar explicitamente, use:

```text
$dl-rust-engineering-expert
```

Exemplo:

```text
$dl-rust-engineering-expert revise este workspace, corrija o bug no parser e rode os checks relevantes sem quebrar o MSRV.
```

## Instalação no Claude Code

### Por projeto

Copie a pasta para:

```text
.claude/skills/dl-rust-engineering-expert/
```

```bash
mkdir -p .claude/skills
cp -R /caminho/dl-rust-engineering-expert .claude/skills/
```

### Global

Para disponibilizar em todos os projetos:

```bash
mkdir -p ~/.claude/skills
cp -R /caminho/dl-rust-engineering-expert ~/.claude/skills/
```

O Claude Code pode ativá-la automaticamente quando relevante. Para chamar explicitamente:

```text
/dl-rust-engineering-expert
```

Exemplo:

```text
/dl-rust-engineering-expert faça profiling deste serviço e proponha otimizações somente com evidência mensurável.
```

## Usando a mesma cópia com os dois

Em um repositório que será usado por Codex e Claude Code, você pode manter cópias idênticas em `.agents/skills/` e `.claude/skills/`. Se seu ambiente e política de versionamento aceitarem symlinks, também pode manter uma pasta canônica e apontar ambos os diretórios para ela.

## Scripts incluídos

### `scripts/project-snapshot.sh`

Faz reconhecimento **somente leitura** do projeto: lista instruções, toolchain disponível, manifests e arquivos Rust. Não compila nem executa código do repositório.

```bash
./scripts/project-snapshot.sh /caminho/do/projeto
```

### `scripts/rust-verify.sh`

Executa uma verificação conservadora sem usar `--all-features` nem instalar ferramentas.

```bash
./scripts/rust-verify.sh quick
./scripts/rust-verify.sh standard
./scripts/rust-verify.sh standard nome-do-package
```

`standard` pode executar `cargo fmt --check`, `cargo check`, `cargo clippy --all-targets` e `cargo test`, conforme ferramentas disponíveis. Como Cargo pode executar `build.rs`, proc macros e testes, use apenas em repositórios confiáveis.

## Filosofia da skill

A skill evita alguns anti-padrões comuns de assistência em Rust:

- não transforma todo problema do borrow checker em `clone()` ou `Arc<Mutex<_>>`;
- não adiciona `unsafe` para "resolver" ownership;
- não usa `--all-features` sem conferir a matriz de features;
- não ignora MSRV/semver/targets;
- não trata async como sinônimo de performance;
- não declara otimização sem benchmark/profiling;
- não instala ferramentas ou dependências sem necessidade/aprovação;
- diferencia claramente o que foi realmente testado do que apenas foi recomendado.

## Personalização rápida

Se quiser adaptar a skill a um projeto específico, mantenha o núcleo genérico e coloque regras do repositório em `AGENTS.md` (Codex) e/ou `CLAUDE.md` (Claude Code): comandos oficiais de CI, MSRV, runtimes permitidos, política de `unsafe`, targets, convenções de erro/logging e requisitos de performance.

## Compatibilidade

O pacote usa apenas os campos obrigatórios `name` e `description` no frontmatter e não depende de extensões específicas de um fornecedor. Isso maximiza a portabilidade entre implementações que suportam o padrão Agent Skills.
