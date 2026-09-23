# Smartphones, tablets, dobráveis e UI adaptativa

## Objetivo

A UI deve responder ao espaço real da janela, às posturas e aos modos de entrada, não apenas ao modelo do dispositivo.

## Regras

- Use window size classes ou APIs adaptativas equivalentes adotadas pelo projeto.
- Não fixe decisões em `screenWidthDp` espalhadas por telas.
- Prefira layouts canônicos quando combinarem com o conteúdo: list-detail, supporting pane, feed.
- Adapte navegação: bottom bar, rail ou drawer conforme espaço e hierarquia.
- Suporte resize em tempo de execução.
- Não force orientação sem requisito forte.
- Preserve estado em mudanças de configuração.
- Teste split-screen, freeform/desktop windowing quando aplicável.
- Considere fold/hinge apenas quando a postura mudar a experiência; não crie lógica especial sem necessidade.
- Trate teclado, mouse, trackpad e stylus como possíveis inputs em telas grandes.
- Evite stretch excessivo de conteúdo textual; use largura máxima quando melhora leitura.
- Imagens e grids devem responder ao espaço sem desperdiçar tela.

## Compose

Em projetos compatíveis, prefira as APIs Material 3 Adaptive oficiais para navegação e layouts adaptativos. Não copie implementações artesanais de breakpoints se a biblioteca já resolver o caso.

## Test matrix mínima

Para uma feature adaptativa, considere:

- telefone compacto retrato;
- telefone paisagem quando suportado;
- tablet médio;
- tablet grande;
- split-screen;
- font scale aumentado;
- dark theme;
- teclado físico quando a interação depender de foco.

## Fontes oficiais

- Adaptive apps: https://developer.android.com/develop/adaptive-apps
- Compose adaptive: https://developer.android.com/develop/ui/compose/build-adaptive-apps
- Large screens: https://developer.android.com/guide/topics/large-screens
