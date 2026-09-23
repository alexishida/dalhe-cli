# Performance e otimização Android

## Regra de ouro

Medir -> localizar gargalo -> mudar -> medir novamente.

Não faça "performance theater": micro-otimizações sem perfil, benchmark ou problema observável.

## Startup

Investigue:

- inicialização síncrona em `Application`;
- ContentProviders automáticos;
- DI inicializado cedo demais;
- I/O na main thread;
- parsing/configuração pesada;
- bibliotecas inicializadas antes de serem usadas.

Use App Startup ou lazy initialization quando trouxer controle real.

Para fluxos críticos de release, considere Baseline Profiles e Macrobenchmark.

## Compose

Procure:

- estado observado em escopo maior do que necessário;
- objetos instáveis criados a cada recomposição;
- lambdas/coleções recriadas em hot paths relevantes;
- leitura de estado no nível errado;
- efeitos reiniciando por keys erradas;
- listas sem keys;
- cálculos caros em composição;
- imagens grandes;
- layouts excessivamente profundos ou medições intrínsecas caras.

Não aplique `remember` mecanicamente. Meça recomposição/traces quando o ganho não for óbvio.

## Main thread

Nunca execute deliberadamente na main thread:

- banco pesado;
- leitura/escrita grande de arquivo;
- parsing pesado;
- compressão;
- criptografia cara;
- loops CPU-bound relevantes;
- rede.

Use coroutines e dispatchers corretos. CPU-bound -> Default; blocking I/O não suspending -> IO.

## Listas

- Paging para coleções remotas/grandes quando necessário.
- Keys estáveis.
- Evite carregar tudo na memória.
- Dimensione imagens para o display.
- Cancele requests quando item deixa de ser relevante.
- Evite nested scrolling desnecessário.

## Imagens

- peça tamanho próximo ao renderizado;
- use cache de imagem maduro já adotado pelo projeto;
- evite bitmap full-resolution para thumbnails;
- trate imagens animadas/vídeo com orçamento de memória;
- não mantenha bitmaps grandes referenciados sem necessidade.

## Banco

Use explain/query inspection quando necessário.

- índices para filtros/joins reais;
- transações;
- paginação;
- batch;
- evitar N+1;
- projeções com colunas necessárias;
- cuidado com invalidation ampla.

## Rede

- comprima payload quando protocolo/servidor suportar;
- paginação;
- cache HTTP coerente;
- evitar polling agressivo;
- retries com backoff;
- não repetir requests por recomposição;
- timeout explícito e adequado;
- serialização eficiente sem sacrificar clareza.

## Memória

Procure:

- Activity/Fragment/Context retidos;
- listeners não removidos;
- coroutines com lifecycle errado;
- caches sem limite;
- bitmaps;
- players;
- WebViews;
- static references;
- grandes grafos em singleton.

Use profiler/leak detector disponível no projeto.

## Bateria

- WorkManager para trabalho deferível persistente;
- respeite constraints;
- agrupe trabalho;
- evite wake locks manuais quando API mais segura existir;
- evite sensores/GPS em frequência maior do que o produto precisa;
- pause listeners quando lifecycle não exigir.

## Build e tamanho

- R8/minify em release;
- resource shrinking quando seguro;
- Android App Bundle;
- remova dependências grandes não usadas;
- revise native libs/ABIs;
- evite recursos duplicados;
- use dynamic delivery somente com necessidade de produto.

## Benchmarks

Para regressões relevantes:

- Macrobenchmark para startup e jornadas de usuário;
- Baseline Profile gerado a partir de critical user journeys;
- benchmark em device físico quando precisão importa;
- múltiplas iterações;
- compare distribuição, não apenas melhor execução.

## Fontes oficiais

- Performance: https://developer.android.com/topic/performance
- Baseline Profiles: https://developer.android.com/topic/performance/baselineprofiles
- Macrobenchmark: https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview
