# dalhe-cli

CLI para iniciar projetos com arquivos base do Dalhe.

## O que faz

`dalhe init` copia template de `src/template/init` para diretorio atual, prepara estrutura inicial do projeto e executa `openspec init --tools claude,codex`.

`dalhe skill` lista, instala, remove e atualiza skills mantidas em `src/template/skills`, publicando-as globalmente para Codex e Claude Code.
As skills oficiais nao usam prefixo.

`dalhe update` atualiza a instalacao global do CLI e tambem atualiza o `OpenSpec`.

Hoje template inclui:

- `AGENTS.md`
- `CLAUDE.md`
- `.ai-framework/DESIGN.md`
- `.ai-framework/RULES.md`

No comando `init`, se algum arquivo de destino ja existir, a execucao para e nada e sobrescrito.

## Requisitos

- Node.js `>=22.0.0`

## Instalacao

Pacote no npm: https://www.npmjs.com/package/dalhe-cli

### Via npm

Instale direto do npm:

```bash
npm install -g dalhe-cli
```

O `OpenSpec` e instalado automaticamente no primeiro `dalhe init`, caso ainda nao esteja disponivel no `PATH`.

### Via repositório Git interno

Instale direto do repositório:

```bash
npm install -g git+https://github.com/alexishida/dalhe-cli.git
```

O `OpenSpec` e instalado automaticamente no primeiro `dalhe init`, caso ainda nao esteja disponivel no `PATH`.

### Via codigo-fonte local

No repositorio do projeto:

```bash
npm install -g .
```

O `OpenSpec` e instalado automaticamente no primeiro `dalhe init`, caso ainda nao esteja disponivel no `PATH`.

## Inicio rapido

Entre na pasta onde deseja criar base do projeto:

```bash
dalhe init
```

Exemplo:

```bash
mkdir meu-projeto
cd ./meu-projeto
dalhe init
```

## Comandos

```bash
dalhe init
dalhe skill list
dalhe skill install <nome-da-skill>
dalhe skill uninstall <nome-da-skill>
dalhe skill update-all
dalhe update
dalhe --help
dalhe -h
dalhe --version
dalhe -v
```

## Comportamento do `init`

- Copia todos os arquivos do template para pasta atual.
- Cria diretorios necessarios automaticamente.
- Bloqueia sobrescrita quando encontra conflito.
- Se `openspec` nao estiver disponivel no `PATH`, executa `npm install -g @fission-ai/openspec@latest`.
- Depois da copia, executa `openspec init --tools claude,codex` na pasta atual.
- Esse modo evita menu interativo do OpenSpec e instala diretamente configuracoes para Claude Code e Codex.
- Requer `npm` instalado para instalar `OpenSpec` automaticamente quando necessario.
- Exibe total de arquivos copiados ao final.

## Estrutura do projeto

- `bin/dalhe.js`: ponto de entrada do CLI.
- `src/commands`: comandos da aplicacao.
- `src/core`: base da execucao e tratamento de erros.
- `src/services`: servicos de apoio.
- `src/template/init`: arquivos base copiados pelo comando `init`.
- `src/template/skills`: arquivos auxiliares de skills mantidos no repositorio.
- `test`: testes automatizados.
- `.ai-framework/RULES.md`: regras oficiais do projeto, incluindo contexto tecnico e diretrizes obrigatorias para alteracoes.

## Comando `skill`

### Listagem

Lista todas as skills disponiveis em `src/template/skills`.

Skills incluidas atualmente:

- `rails8`: apoio para desenvolvimento, refatoracao e revisao de apps Rails 8.
- `code-review`: revisao de qualidade, arquitetura e padroes em codigo Rails.
- `security-audit`: auditoria de seguranca Rails com foco em OWASP, Brakeman e vulnerabilidades comuns.

```bash
dalhe skill list
```

### Instalacao

Instala uma skill globalmente nos dois ambientes:

- Codex: copia pasta inteira da skill para `$CODEX_HOME/skills/<nome-da-skill>`.
- Codex sem `CODEX_HOME`: usa `~/.codex/skills/<nome-da-skill>` no Linux e `%USERPROFILE%\.codex\skills\<nome-da-skill>` no Windows.
- Claude Code: copia pasta inteira da skill para `~/.claude/skills/<nome-da-skill>` no Linux e `%USERPROFILE%\.claude\skills\<nome-da-skill>` no Windows.
- Se a skill ja existir no destino global, a pasta daquela skill e substituida pela versao do template.

```bash
dalhe skill install rails8
```

### Desinstalacao

Remove a skill dos dois destinos globais.

```bash
dalhe skill uninstall rails8
```

### Atualizacao em lote

Reinstala todas as skills deste CLI que ja estejam instaladas em pelo menos um destino gerenciado, sincronizando a versao atual do template para Codex e Claude Code.

```bash
dalhe skill update-all
```

## Comando `update`

Atualiza o CLI globalmente a partir do repositorio oficial e sincroniza o `OpenSpec`:

```bash
dalhe update
```

Comportamento:

- Executa `npm install -g git+https://github.com/alexishida/dalhe-cli.git`.
- Em seguida executa `npm install -g @fission-ai/openspec@latest`.
- No Windows usa `npm.cmd`.
- No Linux usa `npm`.
- Requer `npm` instalado e permissao para atualizar pacote global.

## Desenvolvimento local

Toda alteracao do projeto deve manter este `README.md` atualizado sempre que houver impacto em comportamento, uso, comandos, fluxo, estrutura, requisitos ou contexto relevante da ferramenta.

```bash
npm install
npm test
node ./bin/dalhe.js --help
```

Para testar fluxo completo sem instalar globalmente:

```bash
node ./bin/dalhe.js init
```

Neste caso, garanta que `npm` esteja instalado e disponivel no `PATH`, para que o CLI possa instalar o `OpenSpec` automaticamente quando necessario.

## Licenca

MIT

## Atualizar pacote no npm

```bash
npm publish
```
