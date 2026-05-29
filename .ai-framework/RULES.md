# Regras para IA

Este arquivo define as diretrizes principais para a IA dentro do projeto.
As instrucoes abaixo devem orientar analise, implementacao, alteracoes visuais e tomada de decisao.

# Regras Gerais

- Ler contexto local antes de propor ou executar mudancas.
- Priorizar entendimento do objetivo de produto, fluxo do usuario e restricoes tecnicas antes de implementar.
- Respeitar arquitetura, convencoes, nomenclaturas e organizacao ja adotadas no projeto.
- Fazer mudancas pequenas, objetivas e faceis de revisar, evitando refatoracoes paralelas sem necessidade.
- Explicitar riscos, impactos e premissas quando puderem afetar comportamento, dados ou experiencia do usuario.
- Preferir solucoes simples, previsiveis e de facil manutencao.

# Regras de Codigo

- Escrever codigo claro, organizado e de facil manutencao.
- Respeitar arquitetura, convencoes e estrutura do projeto.
- Separar responsabilidades por modulo, classe, servico ou componente quando isso melhorar legibilidade e evolucao.
- Reutilizar funcoes, componentes e utilitarios existentes antes de criar novas abstracoes.
- Nao introduzir dependencias, camadas extras ou padroes complexos sem beneficio concreto.
- Preservar nomes expressivos, contratos estaveis e fluxo facil de entender.
- Tratar erros de forma clara, com mensagens uteis e comportamento previsivel.
- Evitar comentarios redundantes; comentar apenas quando contexto nao estiver obvio no codigo.

# Regras de Teste e Validacao

- Validar mudancas com testes, comandos locais ou verificacoes manuais compativeis com escopo da alteracao.
- Priorizar testes focados no comportamento alterado, evitando cobertura artificial.
- Quando nao for possivel validar algo localmente, deixar essa limitacao explicita.
- Nao considerar tarefa concluida sem verificar fluxo principal afetado pela mudanca.

# Regras de Layout e Design

O padrao visual do projeto esta documentado em `.ai-framework/DESIGN.md`.
Essas diretrizes devem ser seguidas sempre que houver criacao ou alteracao de telas, componentes visuais ou estilos.

- Seguir design system e padroes visuais definidos no projeto antes de propor novas abordagens.
- Manter consistencia entre telas e componentes em layout, tipografia, cores, espacamento, estados visuais e comportamento responsivo.
- Priorizar legibilidade, hierarquia de informacao, contraste adequado e clareza de interacao.
- Reutilizar componentes, estilos e padroes existentes antes de criar novas variacoes.
- Criar nova solucao visual apenas quando houver necessidade real de produto, usabilidade ou escalabilidade.
- Considerar responsividade, acessibilidade basica e previsibilidade de uso em qualquer alteracao visual.

# Regras de Experiencia e Produto

- Pensar primeiro no fluxo do usuario final e no objetivo pratico da funcionalidade.
- Evitar interfaces ou comportamentos que aumentem atrito sem ganho claro.
- Preservar consistencia de texto, feedback de erro, estados de carregamento e confirmacoes importantes.
- Em CLI, API ou automacoes, priorizar mensagens claras, parametros previsiveis e saidas faceis de interpretar.

# Guard Rails

- Nao executar comandos diretamente em ambiente de producao. Quando necessario, informar comando e orientar execucao manual pelo responsavel.
- Nao fazer alteracoes destrutivas ou irreversiveis sem confirmacao explicita e sem deixar claro impacto esperado.
- Nao introduzir dependencias, abstracoes, estilos ou estruturas apenas por preferencia pessoal.
- Nao ignorar impacto em seguranca, desempenho, usabilidade, manutencao ou consistencia visual.
- Nao sobrescrever arquivos, configuracoes ou dados existentes sem verificar risco e comportamento esperado.
- Nao assumir requisitos ausentes quando isso puder causar regressao; explicitar premissas relevantes.
- Nao esconder falhas de validacao, testes ou execucao; reportar de forma objetiva.
