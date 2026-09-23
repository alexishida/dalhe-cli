# Testing and Quality

Use this reference for test design, regression protection, CI gates, and code review.

## Test strategy

Aim for a healthy mix:

- many fast **unit tests** for pure logic, repositories/use cases with controlled dependencies, parsers, validators, mappers, and state transitions;
- many focused **widget tests** for rendering, interaction, validation, navigation triggers, loading/error/empty/content states, and accessibility-relevant behavior;
- a smaller number of **integration tests** for critical end-to-end flows and cross-layer/platform confidence.

Do not chase coverage percentage at the cost of meaningful assertions.

## What to test after a bug fix

Prefer a regression test that fails for the old behavior and passes after the fix. Place it at the lowest layer that faithfully captures the bug. If the defect only emerges through integration/lifecycle behavior, test at that level.

## Testability rules

- Inject time, randomness, network, storage, and platform boundaries when they otherwise make tests flaky.
- Avoid hidden globals.
- Keep business logic out of widgets when it can be tested independently.
- Prefer deterministic fakes/stubs for most app tests; use mocks where interaction verification is actually important.
- Avoid testing private implementation details or exact widget tree structure unless that structure is the behavior under test.

## Async test hygiene

- Await async work deliberately.
- Control timers/clocks where possible.
- Avoid arbitrary sleeps/pump durations when a deterministic completion condition exists.
- Make stream subscriptions and state transitions deterministic.
- Ensure tests fail clearly on uncaught async errors.

## Widget tests

Cover relevant states:

- loading;
- success/content;
- empty;
- recoverable error + retry;
- validation;
- disabled/enabled actions;
- navigation intent;
- responsive/adaptive behavior when material to the feature.

## Golden tests

Use golden tests selectively for visuals where pixel-level regression detection is worth the maintenance cost. Stabilize fonts, dimensions, themes, and platform assumptions. Do not replace behavioral widget tests with goldens.

## Integration tests

Prioritize user-critical flows such as authentication, onboarding, checkout/payment-adjacent UI flows, data creation/editing, deep links, offline-to-online recovery, and important platform integrations.

When native system UI must be controlled, use the project's established tooling rather than forcing standard Flutter integration tests to do what they cannot.

## Quality commands

Prefer repository-defined scripts first. Otherwise, relevant commands often include:

```bash
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
```

Run narrower tests while iterating, then the broader suite when practical.

## Review checklist

Check for:

- correctness and edge cases;
- lifecycle/disposal;
- async races and stale state;
- null-safety/type-contract issues;
- error/loading/empty states;
- accessibility and localization regressions;
- platform differences;
- unnecessary rebuilds/heavy `build()` work;
- test gaps around changed behavior;
- secrets/sensitive logging;
- migration/backward-compatibility concerns.
