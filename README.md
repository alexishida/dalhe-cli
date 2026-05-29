# dalhe-cli

CLI para iniciar projetos com arquivos base do Dalhe.

## O que faz

`dalhe init` copia template de `src/template/init` para diretorio atual e prepara estrutura inicial do projeto.

Hoje template inclui:

- `AGENTS.md`
- `CLAUDE.md`
- `.ai-framework/DESIGN.md`
- `.ai-framework/RULES.md`
- `.ai-framework/skills/caveman/SKILL.md`

Se algum arquivo de destino ja existir, comando para e nao sobrescreve nada.

## Requisitos

- Node.js `>=25.4.0`

## Instalacao

### Via npm

```powershell
npm install -g dalhe-cli
```

### Via GitHub

```powershell
npm install -g github:alexishida/dalhe-cli
```

### Via pacote local

No repositorio do projeto:

```powershell
npm pack
npm install -g .\dalhe-cli-0.1.1.tgz
```

### Via codigo-fonte local

No repositorio do projeto:

```powershell
npm install -g .
```

## Inicio rapido

Entre na pasta onde deseja criar base do projeto:

```powershell
dalhe init
```

Exemplo:

```powershell
mkdir meu-projeto
cd .\meu-projeto
dalhe init
```

## Comandos

```powershell
dalhe init
dalhe --help
dalhe -h
dalhe --version
dalhe -v
```

## Comportamento do `init`

- Copia todos os arquivos do template para pasta atual.
- Cria diretorios necessarios automaticamente.
- Bloqueia sobrescrita quando encontra conflito.
- Exibe total de arquivos copiados ao final.

## Estrutura do projeto

- `bin/dalhe.js`: ponto de entrada do CLI.
- `src/commands`: comandos da aplicacao.
- `src/core`: base da execucao e tratamento de erros.
- `src/services`: servicos de apoio.
- `src/template/init`: template copiado pelo comando `init`.
- `test`: testes automatizados.

## Desenvolvimento local

```powershell
npm install
npm test
node .\bin\dalhe.js --help
```

Para testar fluxo completo sem instalar globalmente:

```powershell
node .\bin\dalhe.js init
```

## Publicacao

Antes de publicar, valide pacote final:

```powershell
npm pack --dry-run
```

Depois publique nova versao:

```powershell
npm publish
```

## Licenca

MIT
