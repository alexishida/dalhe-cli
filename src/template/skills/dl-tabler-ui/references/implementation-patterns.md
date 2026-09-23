# Padrões de implementação

## Página de listagem

Estrutura recomendada:

1. page header com título e ação principal;
2. filtros/busca quando houver volume que justifique;
3. card contendo tabela/lista;
4. estado vazio dentro do mesmo contexto;
5. paginação no footer do card quando apropriado.

A ação “Novo” deve ficar visível quando criar registros for atividade frequente.

## Formulário criar/editar

- Use largura confortável; não faça formulário curto ocupar toda a tela sem necessidade.
- Agrupe campos relacionados.
- Coloque ações no fim do fluxo.
- `Salvar` é primária; `Cancelar` é secundária.
- Em edição, se houver exclusão, separe visualmente da ação de salvar.
- Mostre erros próximos aos campos e mantenha um resumo no topo quando existirem múltiplos erros ou quando isso melhorar descoberta.

## Página de detalhes

- Mostre primeiro identidade/status do registro.
- Separe metadados de conteúdo operacional.
- Ações frequentes ficam visíveis; ações raras podem ir a dropdown.
- Evite apresentar dados simples como dezenas de cards pequenos sem ganho de leitura.

## Dashboard

- Métricas devem responder perguntas reais.
- Valor principal > contexto > tendência.
- Não use gráfico quando tabela/número responde melhor.
- Evite excesso de cores.
- Destaque exceções e itens que exigem ação.
- Forneça intervalo temporal explícito para números que mudam no tempo.

## Modal

Use para:

- confirmação;
- edição curta;
- escolha rápida;
- detalhes contextuais pequenos.

Evite para:

- formulários longos;
- fluxos multi-etapa extensos;
- páginas inteiras comprimidas em janela.

## Empty state

Um bom empty state responde:

- o que está vazio;
- por que isso pode estar vazio;
- qual é a próxima ação, se houver.

Não use mensagens culpabilizantes.

## Busca e filtros

- Diferencie busca textual de filtros estruturados.
- Exiba filtros aplicados.
- Forneça “Limpar filtros” quando houver múltiplos critérios.
- Preserve critérios ao paginar.
- Quando nenhum resultado aparecer, diferencie “não há dados” de “nenhum resultado para estes filtros”.

## Flash/alerts

- Sucesso: confirme a ação e o objeto quando útil.
- Erro: explique o problema e o próximo passo.
- Aviso: use para risco real, não para informação comum.
- Informação: use com parcimônia.

## Botões e ícones

- Use texto para ações que podem ser ambíguas.
- Ícones podem reforçar, não substituir, significado em ações importantes.
- Botão somente com ícone é adequado para ações compactas e conhecidas, desde que tenha nome acessível/tooltip quando necessário.

## CRUD com autorização

A interface deve refletir permissões do servidor:

- não mostrar ação proibida quando a autorização já é conhecida;
- ainda manter validação/autorização real no backend;
- não confiar em esconder botão como mecanismo de segurança.
