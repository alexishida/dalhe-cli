# Quality gates e revisão de interface Qt/QML

## Antes de finalizar

### Arquitetura

- [ ] A versão de Qt e a linguagem do backend foram identificadas corretamente.
- [ ] Não houve alteração indevida do backend, protocolo de dados ou forma de empacotar.
- [ ] Tokens semânticos estão centralizados e os componentes podem ser reutilizados.
- [ ] Controles interativos são controles reais (ou implementam foco/teclado/acessibilidade equivalentes).

### Design visual

- [ ] Uma hierarquia clara é percebida em 3 segundos: título, ação, conteúdo principal.
- [ ] Espaçamentos e raios seguem escalas pequenas, sem valores aleatórios disseminados.
- [ ] Hover, pressed, focus, selected, disabled e erro têm tratamento quando pertinentes.
- [ ] Não há excesso de sombras, blur ou gradientes.
- [ ] Contraste e texto são legíveis em dark e light (se ambos foram implementados).
- [ ] A tela parece desktop: boa densidade, rolagem, resize, consistência da navegação.

### Responsividade e acesso

- [ ] A janela funciona no tamanho inicial e perto da largura mínima suportada.
- [ ] Campos e textos longos não invadem outros componentes.
- [ ] É possível navegar por teclado e localizar o foco.
- [ ] Interações oferecem feedback e não contêm ações de mentira.
- [ ] Não há animações desnecessárias nem travamento perceptível em listas extensas.

### Validação técnica

- [ ] `cmake -S . -B build` e `cmake --build build` passaram, se CMake/Qt estão presentes.
- [ ] `qmllint` passou, se disponível, com paths corretos do módulo.
- [ ] A aplicação abriu e a UI foi verificada visualmente, se execução gráfica disponível.
- [ ] Erros e warnings do console QML foram analisados.
- [ ] O relatório final diferencia verificações realizadas de verificações pendentes.

## Testes sugeridos

1. Janela 1280×800, depois aproximadamente 1024×700 e mínimo declarado.
2. Tab/Shift+Tab entre navegação, botões e campos; Enter/Space para acionar.
3. Zoom/escala de display, se disponível, e strings de idioma mais longas.
4. Alternância de tema e foco visível nos dois temas.
5. Lista de dados vazia e grande volume de dados; verificar scroll e overflow.
6. Dados reais com erro: loading, timeout, ausência de dados e retry.

## Como relatar

Use quatro blocos sucintos: **Alterações**, **Design**, **Como rodar**, **Validação/Pendências**. Nunca afirme que a UI foi compilada ou visualizada sem ter executado essa verificação.
