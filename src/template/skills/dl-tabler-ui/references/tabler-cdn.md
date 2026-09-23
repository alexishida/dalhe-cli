# Tabler por CDN

Use este arquivo quando precisar incluir ou revisar dependências frontend.

## Core

Baseline oficial via jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css">
<script src="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/js/tabler.min.js"></script>
```

Para produção, prefira trocar `@latest` por uma versão explícita já verificada no projeto ou na documentação oficial.

Exemplo conceitual:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@X.Y.Z/dist/css/tabler.min.css">
<script src="https://cdn.jsdelivr.net/npm/@tabler/core@X.Y.Z/dist/js/tabler.min.js"></script>
```

Nunca invente um número de versão. Preserve a versão existente ou confirme a versão antes de fixá-la.

## Tabler Icons

Webfont por CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">
```

Uso:

```html
<i class="ti ti-home" aria-hidden="true"></i>
```

Para botão somente com ícone:

```html
<button type="button" class="btn btn-icon" aria-label="Editar">
  <i class="ti ti-edit" aria-hidden="true"></i>
</button>
```

Observação: algumas variantes de ícones preenchidos podem ter diferenças entre versões do webfont. Se um ícone filled não renderizar, confirme o pacote/versão e prefira um ícone outline equivalente em vez de criar workaround frágil.

## Dependências extras

Antes de adicionar qualquer biblioteca:

1. confirme que Tabler/Bootstrap não resolve o caso;
2. veja se a aplicação já carrega biblioteca equivalente;
3. confirme a documentação oficial do plugin;
4. use CDN confiável, preferencialmente o CDN indicado pelo projeto do pacote;
5. em produção, fixe versão explícita quando possível;
6. inclua somente CSS/JS necessários;
7. não misture versões incompatíveis do mesmo ecossistema.

Exemplos de necessidades que podem justificar plugin:

- chart avançado;
- date picker;
- select pesquisável;
- máscara de input;
- upload drag-and-drop;
- editor rico.

A existência de um plugin não justifica adicioná-lo automaticamente.

## Ordem recomendada

No `<head>`:

1. meta charset;
2. viewport;
3. Tabler core CSS;
4. Tabler Icons e CSS de plugins;
5. CSS customizado da aplicação.

Antes de fechar `</body>`:

1. scripts de bibliotecas/plugin exigidos;
2. Tabler core JS, conforme necessidade/compatibilidade do projeto;
3. JS da aplicação.

Se a aplicação existente já usa outra ordem funcional, não reorganize sem motivo.

## Fontes oficiais

- https://docs.tabler.io/
- https://github.com/tabler/tabler
- https://github.com/tabler/tabler-icons
- https://cdn.jsdelivr.net/npm/@tabler/core@latest/
- https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/
