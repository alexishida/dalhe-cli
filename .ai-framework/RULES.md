# Regras para IA

Este arquivo define as diretrizes principais para a IA dentro do projeto.
As instrucoes abaixo devem orientar analise, implementacao, alteracoes visuais e tomada de decisao.

# Contexto do Projeto

- Este projeto e o `dalhe-cli`, um CLI em Node.js com modulos ESM (`"type": "module"` em `package.json`).
- A versao minima suportada de runtime e Node.js `>=20.0.0`.
- O ponto de entrada do executavel e `bin/dalhe.js`, exposto pelo binario `dalhe`.
- O repositorio oficial do projeto e `https://github.com/alexishida/dalhe-cli`.
- Os comandos atuais da ferramenta sao `init`, `skill` e `update`.
- A arquitetura atual separa comandos em `src/commands`, servicos em `src/services`, infraestrutura base em `src/core` e templates em `src/template`.
- As skills atualmente distribuidas pelo CLI sao `rails8`, `code-review` e `security-audit`.
- Os testes automatizados usam `node:test` e ficam na pasta `test`.

# Regras Gerais

- Ler contexto local antes de propor ou executar mudancas.
- Priorizar entendimento do objetivo de produto, fluxo do usuario e restricoes tecnicas antes de implementar.
- Respeitar arquitetura, convencoes, nomenclaturas e organizacao ja adotadas no projeto.
- Fazer mudancas pequenas, objetivas e faceis de revisar, evitando refatoracoes paralelas sem necessidade.
- Explicitar riscos, impactos e premissas quando puderem afetar comportamento, dados ou experiencia do usuario.
- Preferir solucoes simples, previsiveis e de facil manutencao.
- Toda alteracao feita no projeto deve obrigatoriamente atualizar o README.md quando houver impacto em comportamento, uso, comandos, fluxo, estrutura, requisitos ou qualquer contexto relevante para quem consulta a documentacao.

# Regras de Codigo

- Escrever codigo claro, organizado e de facil manutencao.
- Respeitar arquitetura, convencoes e estrutura do projeto.
- Em novas funcionalidades do CLI, preferir manter a separacao atual: parse/UX do comando em `src/commands` e regra de negocio/IO em `src/services`.
- Separar responsabilidades por modulo, classe, servico ou componente quando isso melhorar legibilidade e evolucao.
- Reutilizar funcoes, componentes e utilitarios existentes antes de criar novas abstracoes.
- Priorizar APIs nativas do Node.js antes de adicionar dependencias externas.
- Nao introduzir dependencias, camadas extras ou padroes complexos sem beneficio concreto.
- Preservar nomes expressivos, contratos estaveis e fluxo facil de entender.
- Tratar erros de forma clara, com mensagens uteis e comportamento previsivel.
- Manter mensagens do CLI em portugues clara e objetiva, consistentes com os comandos existentes.
- Quando a funcionalidade tocar caminhos globais, comandos de shell ou instalacao, considerar compatibilidade entre Linux e Windows.
- Evitar comentarios redundantes; comentar apenas quando contexto nao estiver obvio no codigo.
- Mudancas em comandos existentes devem atualizar, quando aplicavel, o help text do comando, a ajuda global do CLI, testes e README.

# Regras Especificas do dalhe-cli

- O comando `init` deve continuar copiando arquivos de `src/template/init` para o diretorio alvo sem sobrescrever conflitos existentes.
- O comando `skill` deve continuar tratando skills a partir de `src/template/skills`, com comportamento previsivel para listar, instalar e desinstalar globalmente.
- Skills oficiais mantidas em `src/template/skills` nao devem usar prefixos.
- A pasta da skill e o campo `name` do front matter em `SKILL.md` devem manter o mesmo nome.
- O comando `update` deve continuar apontando para o repositorio oficial do `dalhe-cli`, sem criar fluxos paralelos de atualizacao sem necessidade clara.
- Alteracoes em templates de `src/template` devem considerar impacto direto no comportamento entregue aos usuarios do CLI.

# Regras de Teste e Validacao

- Validar mudancas com testes, comandos locais ou verificacoes manuais compativeis com escopo da alteracao.
- Priorizar testes focados no comportamento alterado, evitando cobertura artificial.
- Quando nao for possivel validar algo localmente, deixar essa limitacao explicita.
- Nao considerar tarefa concluida sem verificar fluxo principal afetado pela mudanca.
- Sempre que comandos, servicos ou templates mudarem, avaliar se testes em `test/*.test.js` precisam ser criados ou ajustados.


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
