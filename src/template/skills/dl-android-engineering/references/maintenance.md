# Manutenção, debugging e migração

## Manutenção em base existente

Primeiro descubra:

- como o projeto compila;
- quais módulos são donos da feature;
- convenções de nome;
- arquitetura real;
- debt conhecido;
- testes existentes;
- compatibilidade mínima.

Faça mudanças localizadas. Refatoração deve reduzir risco da feature, não virar projeto paralelo.

## Debugging

Trabalhe por hipótese.

1. reproduza;
2. registre evidências;
3. reduza o escopo;
4. identifique camada responsável;
5. escreva teste que falha quando viável;
6. corrija causa raiz;
7. valide regressões próximas.

Use logs temporários com cuidado e remova antes da entrega. Nunca logue dados sensíveis.

## Crashes

- leia stack trace completa;
- identifique primeira frame de código do app;
- considere obfuscation/mapping;
- confirme versão/build/device;
- procure race/lifecycle;
- evite simplesmente envolver tudo em try/catch.

## ANR

Investigue main thread:

- I/O;
- locks;
- Binder;
- loops;
- inicialização;
- broadcast/service;
- banco;
- JSON;
- bitmap.

Use traces reais.

## Migrações

### Compose

Migração gradual é preferível quando o app é grande. Escolha fronteiras de tela/componente. Preserve testes e comportamento.

### Gradle/AGP/Kotlin

Faça em incrementos quando o salto é grande. Leia release notes e migration assistant. Não misture upgrade de toolchain com refatoração funcional grande sem necessidade.

### SDK target

Revise behavioral changes de todas as versões puladas. Teste permissões, background execution, notifications, exported components, edge-to-edge e storage.

### Bibliotecas

Ao trocar biblioteca:

- mapeie recursos usados;
- identifique mudança de comportamento;
- não replique API antiga por wrappers enormes;
- faça rollback simples;
- remova dependência antiga completamente quando concluir.

## Dívida técnica

Classifique:

- risco de crash/dados;
- segurança;
- performance;
- velocidade de entrega;
- legibilidade;
- estética.

Corrija primeiro o que afeta risco e custo real. Não use "clean architecture" como justificativa automática para reescrita.

## Revisão de código

Priorize:

1. corretude;
2. lifecycle/concurrency;
3. dados e segurança;
4. compatibilidade por dispositivo;
5. regressão;
6. performance;
7. testes;
8. clareza;
9. estilo.

Aponte problema com arquivo/linha quando possível e explique impacto concreto. Diferencie bug, risco e preferência.
