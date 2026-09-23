# Testes, qualidade, segurança, acessibilidade e release

## Pirâmide pragmática

Teste mais onde a regressão é cara.

### Unit

Use para:

- reducers/state transformations;
- use cases;
- repositories com fakes;
- mappers;
- validação;
- regras de negócio;
- parsing.

Testes devem ser determinísticos. Evite delay real; use test dispatcher/virtual time.

### Integração

Use para:

- Room + migration;
- network serialization;
- repository coordenando local/remoto;
- WorkManager;
- navigation/deep links quando houver infraestrutura.

### UI

Use para fluxos críticos e regressões reais:

- loading/error/content;
- input;
- navegação;
- accessibility semantics;
- adaptive layouts;
- D-pad/focus em TV.

Não escreva teste de UI para lógica que poderia ser coberta de forma barata em unit test.

## Fakes vs mocks

Prefira fakes pequenos e comportamentais para dependências de domínio/dados. Mocks são úteis para interações muito específicas, mas excesso deixa testes acoplados à implementação.

## Acessibilidade

Verifique:

- content descriptions apenas onde necessárias;
- semantics corretas;
- headings;
- labels de campo;
- touch target;
- contraste;
- font scaling;
- TalkBack;
- ordem de foco;
- teclado;
- foco claro em TV;
- estados/erros anunciáveis.

Não use `contentDescription` redundante em texto que já é lido.

## Segurança

### Segredos

Segredos de backend não pertencem ao app cliente. Qualquer valor distribuído no APK/AAB pode ser extraído.

### Componentes Android

Revise:

- `android:exported`;
- intent filters;
- deep links;
- PendingIntent mutability;
- FileProvider;
- BroadcastReceiver;
- Service;
- ContentProvider.

A entrada externa deve ser tratada como não confiável.

### WebView

Se usada:

- habilite JavaScript apenas quando necessário;
- não exponha bridge genérica para conteúdo não confiável;
- restrinja navegação;
- valide URLs;
- bloqueie file access quando não necessário.

### Armazenamento

- internal storage por padrão;
- Keystore para material criptográfico;
- não grave PII em logs;
- revise backup;
- proteja screenshots apenas quando o threat model justificar.

## Release

Antes de release:

- build release real;
- R8/proguard validado;
- crash mapping/symbols;
- migrations de banco;
- upgrade path;
- target SDK/políticas atuais;
- permissões;
- signing;
- Play Console pre-launch report quando disponível;
- staged rollout para mudanças de alto risco;
- observabilidade: crashes, ANR, startup, jank, métricas de produto.

## CI

Uma pipeline típica, adaptada ao projeto:

1. format/check style;
2. compile;
3. unit tests;
4. lint/static analysis;
5. testes de integração selecionados;
6. build artifact;
7. instrumentation/screenshot/benchmark em jobs apropriados;
8. publicação apenas a partir de identidade e secrets seguros.

Não coloque secrets em logs ou artefatos.
