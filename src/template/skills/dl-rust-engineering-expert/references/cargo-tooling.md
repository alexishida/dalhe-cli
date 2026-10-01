# Cargo, Workspaces, Features, and Tooling

Use this reference for Cargo manifests, workspaces, feature flags, build profiles, dependency graph questions, and optional Rust tooling.

## Workspace awareness

Inspect root and member manifests. Determine whether dependency versions/features are inherited from `[workspace.dependencies]`, whether lints are inherited, and whether profiles are defined only at the workspace root.

Avoid editing a member manifest in a way that conflicts with workspace-level policy.

## Features

Rust features are additive at dependency resolution boundaries, but projects may still define feature combinations that are logically incompatible.

Before using `--all-features`, inspect:

- CI feature matrix;
- `cfg` guards and compile errors;
- default-feature behavior;
- platform-specific dependencies;
- mutually exclusive backend/runtime/TLS choices.

When adding a feature:

- keep its semantics focused and documented;
- avoid surprising default behavior changes;
- avoid leaking optional dependencies into public API unless intended;
- consider semver implications of changing default features.

## Lockfiles

For applications/binaries, `Cargo.lock` is normally part of reproducible builds and commonly committed. For libraries, repository policy may vary. Follow the project rather than applying a blanket rule.

Do not regenerate a lockfile unnecessarily.

## Build profiles

Profiles may be centralized and can affect benchmarks/tests through package overrides. Inspect existing `[profile.*]` settings before suggesting tuning.

For production performance, remember profile settings can trade runtime speed against compile time, binary size, debugability, and portability.

## Build scripts and proc macros

`build.rs` and proc macros execute code during builds. In untrusted repositories, inspect before running Cargo commands that compile them.

For reproducibility, be alert to build scripts that read clocks, random data, network state, or undeclared environment variables.

## Optional tools

Use optional tools only if installed or the user approves installation. Depending on the task, candidates may include:

- `cargo nextest` for test execution;
- `cargo audit` / `cargo deny` for dependency policy/security advisory workflows;
- `cargo semver-checks` for public API compatibility assistance;
- `cargo machete` or similar for dependency cleanup;
- `cargo expand` for macro debugging;
- `cargo bloat` / `cargo llvm-lines` for size/codegen analysis;
- profiling/benchmark tools appropriate to the platform;
- Miri, sanitizers, fuzzers, or concurrency model checkers for specialized validation.

Do not present any optional tool as authoritative. Interpret results in context.
