# Rust Verification and Quality Gates

Use this reference to select tests and checks proportional to the change.

## Verification strategy

Start narrow for fast feedback, then broaden. Prefer repository commands over generic commands when they exist.

Possible layers:

- focused unit tests;
- integration tests;
- doctests;
- compile-fail/UI tests;
- property tests;
- fuzz targets;
- Miri;
- sanitizer runs;
- cross-target checks;
- feature-matrix checks;
- benchmarks;
- examples/smoke tests;
- semver/API compatibility checks.

## Typical Cargo checks

Use only what matches the project:

```bash
cargo fmt --check
cargo check -p <package>
cargo test -p <package> <focused-test>
cargo clippy -p <package> --all-targets
cargo test -p <package>
```

For a workspace, widen to workspace-level checks only when appropriate. Do not assume all features are compatible.

If CI uses `-D warnings`, replicate it. Otherwise do not invent a warnings-as-errors policy for the project.

## Tests that add the most value

Prefer tests around observable contracts and edge cases:

- boundary values and empty inputs;
- malformed/untrusted input;
- repeated calls and state transitions;
- error propagation;
- cancellation/timeouts;
- concurrency ordering;
- feature-gated behavior;
- serialization round-trips and compatibility;
- regression reproductions.

Avoid tests that only mirror the implementation line by line without protecting behavior.

## Property and fuzz testing

Property tests are especially useful for parsers, encoders/decoders, numeric transforms, collections, state machines, and round-trip invariants.

Fuzzing is especially valuable at hostile-input boundaries. Seed with real formats and known regressions where useful.

Do not add a new testing framework solely for one trivial case when ordinary tests suffice.

## Documentation tests

For public library APIs, doctests can verify examples and improve user experience. Keep examples minimal, deterministic, and aligned with supported features.

## Final validation report

Report:

- commands actually run;
- pass/fail result;
- failures caused by environment vs patch;
- checks not run and why;
- benchmark baseline and post-change numbers when performance was part of the task.
