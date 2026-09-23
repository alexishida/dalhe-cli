# Arquitetura Android

## Índice

- Princípios
- Camadas
- Estado e UDF
- Coroutines e Flow
- Persistência
- Modularização
- Dependency Injection
- Navegação
- Offline-first
- Anti-padrões

## Princípios

Use arquitetura para reduzir acoplamento e tornar comportamento verificável, não para maximizar quantidade de classes.

Prioridades:

1. fonte única de verdade;
2. fluxo de dados previsível;
3. dependências apontando para abstrações úteis, não abstrações artificiais;
4. I/O isolado;
5. UI derivada de estado;
6. unidades testáveis;
7. módulos com fronteiras coerentes.

## Camadas

### UI

Responsável por renderizar estado e transformar interação do usuário em intents/actions.

Um ViewModel:

- expõe estado observável e preferencialmente imutável;
- coordena casos de uso/repos;
- não referencia `Activity`, `Fragment`, `View` ou composables;
- evita guardar `Context`; quando inevitável, prefira dependência específica ou `Application` apenas com motivo claro.

### Data

Repositórios coordenam fontes locais/remotas e expõem modelos úteis ao restante do app.

Data sources devem representar tecnologias concretas:

- API;
- banco;
- arquivo;
- sensor;
- serviço Android;
- cache.

### Domain

É opcional. Crie use cases quando houver lógica reutilizada, composição de repositórios, regras de negócio significativas ou quando isso simplificar testes/leitura. Não crie um use case trivial para cada método por dogma.

## Estado e UDF

Modele a tela como um estado observável e eventos de entrada.

Exemplo de forma:

```kotlin
data class FeatureUiState(
    val isLoading: Boolean = false,
    val items: List<ItemUi> = emptyList(),
    val error: UiError? = null,
)

sealed interface FeatureAction {
    data object Retry : FeatureAction
    data class Select(val id: String) : FeatureAction
}
```

Evite `Boolean` independentes que permitam combinações impossíveis. Quando o fluxo tiver estados mutuamente exclusivos, considere sealed types.

Eventos consumíveis ("one-shot") devem ser modelados de forma que não dependam de wrappers frágeis de Event. Para navegação ou mensagens, prefira derivar a ação de estado/ação e tornar consumo explícito quando necessário.

## Coroutines e Flow

- Use structured concurrency.
- Evite `GlobalScope`.
- Injete dispatchers quando testes determinísticos ou isolamento de I/O exigirem.
- Não troque de dispatcher sem motivo; bibliotecas suspending modernas frequentemente já fazem isso.
- Use `StateFlow` para estado contínuo.
- Use `SharedFlow` quando houver semântica real de stream compartilhado.
- `suspend` é bom para operação única.
- Preserve cancelamento; não capture `CancellationException` como erro comum.
- Use `supervisorScope` apenas quando falhas irmãs devam ser independentes.
- Não lance coroutine em repository só para esconder lifecycle; exponha suspensão/Flow e deixe o dono do lifecycle decidir.

## Persistência

### Room

- Entidades não precisam ser os modelos da UI.
- Use transações para invariantes multi-operação.
- Crie índices para padrões de consulta medidos.
- Evite consultas N+1.
- Retorne Flow quando atualização reativa é necessária.
- Defina migrações reais; não use destructive migration em produção sem requisito explícito.

### DataStore

Adequado para preferências e configuração pequena. Para estrutura relacional/consultas, use Room.

## Modularização

Modularize por benefício:

- tempo de build;
- ownership;
- isolamento de feature;
- reutilização real;
- separação de plataforma;
- dynamic feature quando requisito.

Evite um módulo por classe/camada em projeto pequeno.

Padrões úteis:

- `app`
- `core:model`
- `core:network`
- `core:database`
- `core:designsystem`
- `feature:<nome>`
- módulos específicos para TV/car apenas se houver divergência real de UI/dependências.

## Dependency Injection

Use DI para controlar criação, escopo e substituição de dependências. Hilt é um default razoável em projetos novos médios/grandes, mas respeite o projeto existente.

Evite service locator global e singletons mutáveis não controlados.

## Navegação

- Centralize rotas/contratos sem acoplar toda a aplicação a strings espalhadas.
- Deep links devem ser validados.
- Não passe objetos grandes entre destinos; passe IDs e recarregue do source of truth.
- Preserve back stack e state restoration.
- Em layouts list-detail adaptativos, navegação deve responder ao espaço disponível sem duplicar regra de negócio.

## Offline-first

Quando o produto requer resiliência offline:

- local pode ser a source of truth;
- rede atualiza local;
- UI observa local;
- sincronização deve ser idempotente;
- registre versão/timestamps apenas quando forem úteis à resolução de conflito;
- use WorkManager para sync persistente;
- defina estratégia explícita para conflitos.

## Anti-padrões

Evite:

- ViewModel gigante;
- repository que vira "god object";
- `Context` atravessando domínio;
- lógica de negócio em composables;
- chamadas Retrofit direto da UI;
- estado duplicado em várias camadas;
- callbacks profundamente aninhados;
- abstrações genéricas prematuras (`BaseRepository`, `BaseUseCase`, `BaseViewModel`) sem valor comprovado;
- exception swallowing;
- `runBlocking` na main thread;
- `MutableStateFlow` exposto publicamente sem necessidade.
