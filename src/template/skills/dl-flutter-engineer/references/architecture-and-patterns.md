# Architecture and Patterns

Use this reference when designing a new app/feature or changing structural boundaries.

## Start from the existing system

Before selecting an architecture, identify what already exists: feature-first vs layer-first folders, state-management package, repository/service conventions, DI, router, serialization, and testing seams. Prefer a compatible evolution path.

## Default architecture for a non-trivial app

Use a pragmatic layered model:

- **UI layer**: screens/pages, widgets, presentation state, user actions.
- **Data layer**: repositories as application-facing data boundaries; services/data sources for APIs, databases, plugins, files, sensors, and platform interfaces.
- **Domain layer (optional)**: use cases/interactors and domain rules only when business logic is sufficiently complex or reused across multiple presentation flows.

Key principles:

- separation of concerns;
- one clear source of truth per piece of mutable state;
- predictable/unidirectional state transitions where useful;
- explicit dependencies;
- testable boundaries;
- small cohesive classes/functions/widgets.

Do not add a domain layer to a CRUD-sized feature merely for symmetry.

## Feature organization

For medium/large applications, prefer discoverability by feature. A reasonable shape is:

```text
lib/
  app/
    app.dart
    routing/
    theme/
  core/
    networking/
    persistence/
    platform/
  features/
    account/
      data/
      domain/        # only if justified
      presentation/
    catalog/
      data/
      presentation/
```

Treat this as a starting point, not a mandatory template.

## State management selection

First keep the library already used by the project when it is functioning well.

For a new project, choose based on requirements rather than popularity:

- Built-in Flutter primitives (`setState`, `ValueNotifier`, `ChangeNotifier`) can be enough for local/simple state.
- Provider-style dependency/state exposure is suitable when the project is already structured around it and complexity is moderate.
- Riverpod-style providers are useful when explicit dependency graphs, test overrides, async state composition, and reduced `BuildContext` coupling are valuable.
- BLoC/Cubit-style event/state boundaries are useful when the team benefits from explicit transitions and strongly structured feature state.

Do not mix several global state-management paradigms without a clear boundary.

Keep ephemeral UI state local unless it must outlive the widget or be shared. Keep server/cache/domain state behind appropriate application boundaries.

## Dependency injection

Prefer explicit constructor injection for domain/application objects. Add a DI/service-locator package only when object-graph complexity justifies it or the repository already uses one.

Avoid hidden global mutable dependencies. Make test substitution straightforward.

## Routing

Preserve the existing routing approach. For complex navigation, ensure:

- deep links are modeled intentionally;
- authentication/authorization redirects do not create loops;
- nested navigation and back behavior are tested;
- route arguments are typed/validated where practical;
- URL state is considered for Flutter web.

## Design patterns: use intentionally

Useful patterns in Flutter/Dart include:

- **Repository** — stable data boundary and source-of-truth abstraction.
- **Adapter** — isolate third-party SDK/plugin models from app-facing interfaces.
- **Strategy** — switch algorithms/policies without branching throughout the codebase.
- **Factory** — centralize construction when creation logic is non-trivial.
- **Facade** — simplify a complex subsystem behind a focused API.
- **Observer/Publisher** — reactive updates; use existing framework/state primitives rather than reinventing them.
- **Command/Use case** — package a meaningful application action when it improves reuse, testing, or orchestration.
- **Decorator/Wrapper** — add logging, caching, retry, metrics, or policy around an interface without coupling callers.

Avoid pattern stacking. A pattern must remove a real source of coupling, duplication, branching, or testing friction.

## SOLID, pragmatically

- **S**: keep responsibilities cohesive; do not split every method into a class.
- **O**: create extension seams where change is expected, not everywhere.
- **L**: subtype contracts must stay substitutable.
- **I**: prefer narrow interfaces when consumers need different capabilities.
- **D**: depend on stable abstractions at boundaries where substitution/testing matters.

## Data models

- Separate transport/DTO models from domain models when API/storage concerns would otherwise leak into the app.
- Keep serialization explicit and testable.
- Use immutable models when they reduce accidental state mutation.
- Treat generated model code according to the project's generator conventions.

## Error model

Avoid scattering raw exceptions through presentation code. At meaningful boundaries, map infrastructure failures to app-level error/failure types or states that preserve useful context without leaking sensitive details.

Distinguish at least when relevant:

- validation/domain rejection;
- authentication/authorization;
- connectivity/timeout;
- remote service failure;
- persistence corruption/unavailable state;
- cancellation;
- unexpected programming defects.

## Architecture red flags

Investigate when you see:

- network/database/plugin calls directly in large widgets;
- business rules embedded in `build()`;
- global mutable singletons with hidden lifecycle;
- circular imports/dependencies;
- one giant state object causing app-wide rebuilds;
- UI classes owning caching/retry/serialization;
- broad `dynamic` usage around stable contracts;
- duplicated API models and conversion logic without ownership;
- feature modules reaching across each other's internals.
