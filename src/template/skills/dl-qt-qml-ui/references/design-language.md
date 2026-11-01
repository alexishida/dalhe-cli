# Linguagem visual para Qt Quick desktop

## O que caracteriza uma interface desktop moderna

Reproduzir a *qualidade do produto* (clareza, consistência, microinterações, navegação, acabamento), não uma DOM com HTML. Referências amplas: ferramentas de desenvolvimento, produtividade e organização como Linear, VS Code, Raycast e Notion. Evite reproduzir identidades visuais protegidas literalmente; use-as como referência de comportamento.

## Escolha uma direção antes de codificar

- **Developer tool:** dark neutro, bordas discretas, densidade média/alta, listas úteis, atalhos, realce cuidadoso.
- **Productivity workspace:** claro ou escuro, painéis acolhedores, conteúdo em primeiro plano, navegação consistente.
- **Data console:** números claros, filtros e tabelas legíveis, gráficos modestos, comparações justificadas.

Não faça um dashboard por hábito. Explore a necessidade real: editor, launcher, fila de tarefas, comparador, settings, file browser etc.

## Tokens sugeridos (ponto de partida, não paleta obrigatória)

### Dark neutral

| Token | Hex | Uso |
|---|---|---|
| `canvas` | `#0B101B` | base |
| `sidebar` | `#101725` | navegação |
| `surface` | `#161F2E` | cards e popovers |
| `hover` | `#223047` | hover discreto |
| `border` | `#293548` | separadores |
| `primaryText` | `#F3F6FC` | títulos |
| `secondaryText` | `#9AAAC2` | apoio |
| `accent` | `#8A80FF` | ação e seleção |
| `positive` | `#4BDBB2` | status |
| `negative` | `#FC7B88` | erro |

### Light neutral

| Token | Hex | Uso |
|---|---|---|
| `canvas` | `#F5F7FB` | base |
| `sidebar` | `#FFFFFF` | navegação |
| `surface` | `#FFFFFF` | cards |
| `hover` | `#EDF1F7` | hover |
| `border` | `#DFE5EE` | separadores |
| `primaryText` | `#172034` | títulos |
| `secondaryText` | `#5F6B80` | apoio |
| `accent` | `#6255D8` | ação e seleção |

## Sistema de espaçamento e tipografia

- Espaçamentos: 4, 8, 12, 16, 20, 24, 32, 40 (Qt Quick trabalha com pixels lógicos, adequados a DPI scaling).
- Alturas de controle: 36–44 em apps desktop; alvos maiores quando touch for relevante.
- Raios: 8 para campos/botões, 12 para painéis menores, 16–20 para cards extensos.
- Títulos: 24–28 px; subtítulos: 16–18; texto: 13–15; metadados: 11–13. Adapte ao SO, idioma e acessibilidade.
- Tipografia: use a fonte de UI do sistema por padrão. Prefira uma fonte embutida somente com licença e carregamento corretos.
- Altura de linha: textos pequenos precisam de respiro. Não use tudo em negrito e caixa alta.

## Composição

1. Uma ação dominante por região: não crie vários botões primários lado a lado.
2. Agrupe por proximidade e alinhamento; não desenhe um card para cada elemento sem necessidade.
3. Sidebar fixa ~220–264 px quando apropriada, com seleção visível; conteúdo rolável, barra superior concisa.
4. Empty states devem explicar a situação e oferecer próximo passo quando há ação disponível.
5. Em telas estreitas, reduza colunas, recoloque painéis e evite texto comprimido. Defina largura mínima realista.
6. Trate gráfico como informação, não decoração: unidades, legenda e acessibilidade devem ser claros em produção.

## Estados e interação

- Hover muda superfície ou borda de modo sutil; não salte o layout.
- Pressed comunica clique de maneira discreta.
- Focus é visível e independente do hover (ex.: borda do accent).
- Selected permanece perceptível mesmo sem hover.
- Disabled usa contraste e cursor apropriados; não apenas opacidade extrema.
- Loading não deve mover os componentes; use placeholders proporcionais.
- Redução de movimento: exponha um token `motionEnabled` configurável quando aplicável.

## Anti-padrões comuns

- Gradientes fortes em todos os painéis; blur generalizado; glassmorphism em ferramentas densas.
- Bordas inexistentes com superfícies quase da mesma cor e sem separação.
- Grande quantidade de cores de destaque, ícones inconsistentes e texto minúsculo.
- Componentes visualmente bonitos mas sem tab order, scroll, feedback ou integração.
- Cópia automática de um dashboard, sem atender ao problema da aplicação.
