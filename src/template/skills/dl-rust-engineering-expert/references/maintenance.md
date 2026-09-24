# Rust Maintenance

Use this reference for bug fixes, dependency upgrades, MSRV/toolchain work, deprecations, migrations, and production maintenance.

## Bug-fix loop

1. Reproduce the bug or isolate the failing invariant.
2. Reduce to the smallest responsible boundary.
3. Add a regression test when practical.
4. Fix the cause rather than the symptom.
5. Verify nearby edge cases and error paths.
6. Run the relevant repository checks and inspect the diff.

For intermittent failures, distinguish deterministic logic defects from timing, ordering, environment, filesystem, clock, randomness, or race-sensitive behavior.

## Dependency changes

Before changing a dependency:

- check whether the workspace centralizes versions/features;
- understand default features and transitive impact;
- preserve MSRV and target support;
- review feature unification effects;
- avoid widening dependency features casually;
- update the lockfile only when appropriate for the repository type and task;
- read upstream changelogs/migration notes when behavior may have changed.

Do not add a crate for functionality already provided cleanly by the standard library or existing dependencies unless the tradeoff is justified.

## MSRV and toolchain policy

Discover MSRV from `rust-version`, documentation, CI matrices, or repository policy. Do not infer it from the local compiler alone.

When maintaining MSRV compatibility:

- avoid newer syntax/APIs unless the project allows an MSRV bump;
- consider dependency MSRV drift;
- validate with the declared minimum toolchain when feasible;
- treat an MSRV bump as a user-visible compatibility change.

## Semver-sensitive changes

Potentially breaking changes include more than deleting public items. Review:

- signature, generic, and trait-bound changes;
- struct/enum construction and pattern matching;
- trait implementations and coherence interactions;
- auto-trait changes (`Send`/`Sync`/`Unpin`);
- feature/default-feature behavior;
- panic/error behavior relied on by callers;
- serialization formats and configuration schema;
- re-export/module path changes.

Use a semver checking tool only if already available or approved; still reason about semantic compatibility manually.

## Deprecation and migration

Prefer staged migration when compatibility matters:

1. add the replacement;
2. deprecate the old API with actionable guidance;
3. migrate internal call sites;
4. preserve compatibility for the agreed window;
5. remove only in an appropriate breaking release.

## Production hardening

Check for:

- unbounded queues, retries, buffers, recursion, or memory growth;
- untrusted input driving expensive work;
- timeout/cancellation behavior;
- partial writes and retries around I/O;
- clock/time-zone assumptions;
- shutdown/drain behavior;
- observability on failure paths;
- panic boundaries and process-wide failure;
- graceful handling of corrupted or incompatible persisted state.
