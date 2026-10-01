# Rust Development and Refactoring

Use this reference for implementation, API design, refactoring, compiler diagnostics, and general Rust coding.

## Understand the local design first

Before adding abstractions, inspect adjacent modules and call sites. Prefer existing project concepts, error types, tracing/logging conventions, feature gates, and dependency choices.

Map the change across:

- ownership boundary and lifetime of data;
- sync vs async execution;
- public vs crate-private API;
- allocation and copying behavior;
- error propagation and recovery;
- generic/trait surface;
- target/feature-specific behavior.

## Ownership and borrowing

Prefer borrowing when the callee only needs temporary access and ownership would cause unnecessary transfer or cloning. Prefer owned values when data must outlive the caller, cross threads/tasks, be stored, or ownership materially simplifies correctness.

Do not force lifetime-heavy APIs merely to avoid an inexpensive clone. Conversely, do not hide repeated large clones behind ergonomics. Evaluate actual object size, frequency, lifetime, and hot-path relevance.

Useful patterns include:

- `&str` / `&[T]` inputs for read-only transient data when appropriate;
- `Cow<'a, T>` only when mixed borrowed/owned behavior is a real requirement;
- iterators for composable lazy transforms, without assuming they are automatically faster;
- newtypes for units, identifiers, validated data, and semantic distinctions;
- enums for closed state machines and explicit protocol states;
- RAII guards for cleanup and scoped state changes.

## Error design

For libraries, expose errors callers can act on. For applications, preserve useful context through boundaries. Match repository conventions before adding a new error crate or pattern.

Avoid:

- swallowing root causes;
- converting all errors to strings too early;
- panicking on user-controlled or environmental failure;
- huge public error enums that freeze implementation details into the API.

When a failure is impossible only because of a local invariant, keep the invariant close to the assertion and make the reasoning visible.

## Traits and generics

Keep bounds as narrow as the implementation needs. Be mindful that adding bounds can be a breaking change even when signatures look similar.

Before adding a trait:

- confirm multiple implementations or a meaningful test/extension boundary exist;
- decide whether static dispatch, dynamic dispatch, or an enum is the better fit;
- check object safety if trait objects matter;
- consider coherence/orphan rules and future blanket impl conflicts;
- avoid exposing associated types or generic parameters without a real need.

## Public API ergonomics

For public crates, examine:

- semver compatibility;
- inference at existing call sites;
- re-exports and module paths;
- `#[non_exhaustive]` where evolution requires it;
- builders for complex optional configuration;
- ownership choices that downstream users cannot easily change later;
- `Send`, `Sync`, `Unpin`, panic behavior, and thread-safety promises;
- serde/wire compatibility if serialized types are public contracts.

## Compiler and Clippy errors

Do not patch around diagnostics mechanically. Identify the ownership, lifetime, trait-resolution, or API mismatch that caused the diagnostic.

For borrow-checker errors, ask in this order:

1. Can the operation be restructured so borrows do not overlap?
2. Can data flow be split into smaller scopes or helper functions?
3. Should ownership move to a different layer?
4. Is interior mutability genuinely part of the model?
5. Only then consider cloning, `Rc`/`Arc`, `RefCell`, `Mutex`, or other indirection.

For trait errors, reduce the type to the smallest failing expression and inspect inferred types, auto traits, blanket impls, and feature-dependent implementations.

## Refactoring

Separate behavior-preserving refactors from behavior changes when practical. This makes review and regression isolation easier.

Good refactors generally reduce one or more of:

- duplicated invariants;
- repeated parsing/validation;
- overly broad mutable state;
- modules with mixed responsibilities;
- hidden control flow;
- error conversion at many layers;
- test setup complexity.

Avoid speculative abstractions created only to make code look more generic.
