# Pendências para retomada

## Objetivo em andamento

Revisar as skills distribuídas em `src/template/skills`, aprofundar as que
estiverem superficiais e garantir compatibilidade de instalação com Codex e
Claude Code.

## Já feito nesta retomada

- Foi lido `.ai-framework/RULES.md`; a pasta da skill e o campo `name` do
  front matter precisam ser idênticos e usar o prefixo `dl-`.
- Foi aplicada a skill `skill-creator` para revisar a estrutura e validar os
  metadados das skills.
- Foi consultada a documentação oficial:
  - Codex descobre skills em `.agents/skills` no repositório ou
    `~/.agents/skills` para o usuário.
  - Claude Code usa `.claude/skills/<nome>/SKILL.md` no projeto ou
    `~/.claude/skills/<nome>/SKILL.md` para o usuário.
  - O formato portátil entre os dois requer apenas `name` e `description` no
    front matter de `SKILL.md`.
- A skill `dl-code-review` foi reescrita para exigir evidência, cenário de
  falha, prioridade baseada em impacto e revisão sem modificar código.
- A skill `dl-nodejs-dev` e referências foram aprofundadas para cobrir:
  cancelamento, limites de concorrência, limpeza de tarefas, filesystem,
  subprocessos, empacotamento e testes de regressão por fronteira.
- A skill `dl-pure-ruby` e referências foram corrigidas para considerar a
  versão real do Ruby, disponibilidade de bibliotecas, streaming, I/O,
  subprocessos e testes de artefatos empacotados.
- A skill `dl-rails-8` e referências foram ajustadas para não fixar Ruby 4,
  evitar recomendações imprecisas de ActiveRecord e tratar transações, jobs,
  idempotência, migrações expansivas e adaptadores de banco.

## Arquivos já modificados nesta tarefa

- `src/template/skills/dl-code-review/SKILL.md`
- `src/template/skills/dl-nodejs-dev/SKILL.md`
- `src/template/skills/dl-nodejs-dev/references/async-and-errors.md`
- `src/template/skills/dl-nodejs-dev/references/testing.md`
- `src/template/skills/dl-nodejs-dev/references/tooling.md`
- `src/template/skills/dl-pure-ruby/SKILL.md`
- `src/template/skills/dl-pure-ruby/references/gems.md`
- `src/template/skills/dl-pure-ruby/references/testing.md`
- `src/template/skills/dl-rails-8/SKILL.md`
- `src/template/skills/dl-rails-8/references/clean-code-patterns.md`
- `src/template/skills/dl-rails-8/references/rails8-features.md`
- `src/template/skills/dl-rails-8/references/rubocop-config.md`

## Concluído nesta retomada

- `dl-electron-react` agora trata electron-vite/electron-builder como opções
  para novos projetos, preserva a configuração existente e exige validação do
  frame emissor em IPC, política explícita de navegação e abertura externa.
- `dl-rails-code-audit` não esconde falhas de ferramentas, separa seus alertas
  de achados confirmados e só grava relatório em um caminho informado pelo
  usuário.
- As instruções de instalação de `dl-binary-recompilation-engineer` e
  `dl-matching-decomp` foram revisadas: já usam os caminhos portáteis atuais e
  não continham referência específica de host a remover.
- `SkillManager` usa `~/.agents/skills/<skill-name>` como destino padrão do
  Codex; `CODEX_HOME/skills/<skill-name>` continua disponível quando definido.
  README e testes foram atualizados.
- Foi adicionado teste que instala todas as skills distribuídas em uma home
  temporária, valida o front matter portátil e compara todos os arquivos
  copiados nos destinos Codex e Claude Code.
- O validador do `skill-creator` passou para as oito skills e `git diff --check`
  não reportou problemas. Os testes focados passaram. `npm test` teve somente
  a falha ambiental já observada de instalação via `git+file`, bloqueada pelo
  npm com `EALLOWGIT`; os demais 70 testes passaram.

## Contexto adicional do repositório

- A árvore de trabalho já estava modificada por tarefas anteriores. Não usar
  `git reset`, `git checkout --` ou comandos destrutivos para limpar mudanças.
- Há implementações anteriores ainda não consolidadas para:
  - atualização de skills diretamente do GitHub;
  - proteção contra traversal e conflitos de cópia;
  - renomeação da skill para `dl-matching-decomp`.
- `README.md`, `bin/dalhe.js`, serviços e testes já foram modificados nessas
  tarefas anteriores e devem ser preservados.
