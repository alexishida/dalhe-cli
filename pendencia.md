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

## Próximos passos

1. Revisar `dl-electron-react` e as referências, principalmente os exemplos de
   IPC. Eles precisam validar também a origem da chamada e manter uma política
   de navegação/abertura externa, além de não apresentar Electron Vite como
   obrigatório para todo projeto existente.
2. Revisar `dl-rails-code-audit`:
   - remover comandos que escondem falhas com `2>/dev/null` e `|| true`;
   - deixar claro o que é resultado de ferramenta versus achado confirmado;
   - remover a instrução específica de gravar em `/mnt/user-data/outputs/`,
     que não é portátil entre Codex e Claude Code.
3. Revisar `dl-binary-recompilation-engineer` e `dl-matching-decomp` apenas
   para eliminar instruções específicas de um host e referências de instalação
   desatualizadas. O conteúdo técnico delas já é aprofundado.
4. Atualizar `SkillManager` para instalar a cópia do Codex no caminho padrão
   `~/.agents/skills/<skill-name>`. Preservar `CODEX_HOME` como configuração
   explícita para instalações que já usam esse caminho, se essa
   retrocompatibilidade for desejada. Ajustar testes e README para refletir o
   caminho final.
5. Acrescentar teste que instala cada skill em uma home temporária e confirma:
   - `SKILL.md` existe nos destinos Codex e Claude;
   - `name` do front matter é igual ao nome da pasta;
   - as referências, scripts e assets são copiados;
   - a skill não tem front matter específico de Claude que possa prejudicar
     a portabilidade.
6. Rodar o validador do `skill-creator` para todas as pastas de skill:

   ```bash
   for skill in src/template/skills/*; do
     python3 /home/alexishida/.codex/skills/.system/skill-creator/scripts/quick_validate.py "$skill" || exit 1
   done
   ```

7. Executar `npm test` e `git diff --check` depois dos ajustes.

## Contexto adicional do repositório

- A árvore de trabalho já estava modificada por tarefas anteriores. Não usar
  `git reset`, `git checkout --` ou comandos destrutivos para limpar mudanças.
- Há implementações anteriores ainda não consolidadas para:
  - atualização de skills diretamente do GitHub;
  - proteção contra traversal e conflitos de cópia;
  - renomeação da skill para `dl-matching-decomp`.
- `README.md`, `bin/dalhe.js`, serviços e testes já foram modificados nessas
  tarefas anteriores e devem ser preservados.
