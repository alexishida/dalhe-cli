# Maintenance and Debugging

Use this reference for defects, legacy code, flaky behavior, SDK/package migrations, and build failures.

## Bug-fix workflow

1. Reproduce or precisely characterize the failure.
2. Capture the failing path with a targeted test when feasible.
3. Trace state/data/lifecycle from symptom to the earliest incorrect assumption.
4. Fix the root cause at the narrowest correct boundary.
5. Run the regression test plus adjacent tests.
6. Check for the same defect pattern in nearby code only when evidence suggests recurrence.

Do not rewrite a subsystem before proving the rewrite is necessary.

## Flutter lifecycle and async checks

For UI bugs/crashes, inspect:

- controller/focus/animation/stream subscription disposal;
- timers and callbacks firing after disposal;
- `BuildContext` use after `await`;
- overlapping requests and stale responses;
- double submission;
- cancellation behavior;
- `FutureBuilder`/`StreamBuilder` futures or streams recreated unintentionally in `build()`;
- keys/identity errors in reorderable or dynamic lists;
- state reset caused by widget identity/navigation changes;
- app lifecycle transitions (background/resume) when relevant.

## Dependency/build failures

Classify the problem before changing versions:

- Dart/Flutter SDK constraint mismatch;
- direct or transitive package constraint conflict;
- generated code stale or generator mismatch;
- Android Gradle/Kotlin/Java/AGP issue;
- iOS CocoaPods/Xcode/deployment target issue;
- web API/browser compatibility issue;
- desktop toolchain issue;
- plugin native setup/permission/manifest issue.

Read the actual solver/compiler error. Avoid random version pinning.

## Migration workflow

For Flutter/Dart/package upgrades:

1. Record current SDK and dependency constraints.
2. Identify breaking changes and deprecations affecting this repository.
3. Upgrade in coherent, reviewable steps.
4. Run dependency resolution and code generation.
5. Resolve analyzer/compiler errors before broad refactors.
6. Run tests and platform builds.
7. Review behavior changes that compile successfully but alter runtime semantics.

Avoid combining an SDK migration, architecture rewrite, design refresh, and large dependency swap in one change unless the user explicitly asks for it.

## Legacy refactoring

Use a strangler/incremental approach when possible:

- add characterization tests around risky behavior;
- introduce a boundary/interface around the legacy dependency;
- move one responsibility at a time;
- keep public contracts stable during migration;
- delete old paths only after callers are migrated and tests pass.

## Logging and diagnostics

Use structured, actionable diagnostics. Do not log secrets, access tokens, authorization headers, full sensitive payloads, or unnecessary personal data.

When adding logs, include enough context to correlate the operation while keeping identifiers safe.

## Common anti-fixes

Reject these unless explicitly justified:

- adding arbitrary delays to hide races;
- swallowing exceptions;
- `try/catch` around large regions without recovery semantics;
- `dynamic`/casts used to silence type errors;
- disabling lints globally to make CI green;
- bumping every dependency simultaneously;
- forcing synchronous work onto the UI isolate;
- replacing deterministic state flow with global mutable flags.
