# Testing

How to structure and write tests for Node.js code.

## Table of contents
- Test runner
- Layout
- What to test at each layer
- Mocking and fixtures
- Coverage

## Test runner

Default to the **built-in `node:test`** runner with `node:assert` for new projects with no existing setup — zero dependencies, fast, runs with `node --test`. Use **Vitest** when the project is TypeScript-heavy and wants fast watch mode and rich assertions, or **Jest** when a project already standardized on it. Match the existing project's runner.

## Layout

Mirror the source tree. Co-locate unit tests next to code (`user.service.test.ts`) or place them under `tests/` mirroring `src/` — pick one and be consistent. Keep integration/e2e tests in a separate folder (`tests/integration/`) so they can be run separately from fast unit tests.

## What to test at each layer

- **Services** — the bulk of unit tests. Pure logic with fake repositories injected; no network, no DB. Cover happy paths, edge cases, and each error branch.
- **Repositories** — integration tests against a real (or containerized/in-memory) database, not mocks, since their whole job is the DB interaction.
- **Routes/API** — integration tests that call `buildApp(fakeDeps)` with a request client (e.g., `supertest` for Express, Fastify's `.inject()`), asserting status codes and response shape. No need to bind a port.

Test behavior and contracts, not implementation details — tests shouldn't break when you refactor internals that don't change outputs.

## Mocking and fixtures

Inject fakes via the dependency-wiring pattern rather than module-level mocking where possible — it's clearer and less brittle. Use the runner's mocking only for things you can't inject (timers, `fetch`, the clock). Build small fixture factories that return valid domain objects with overridable fields, so each test states only what it cares about:

```ts
const makeUser = (over = {}) => ({ id: '1', email: 'a@b.com', name: 'A', ...over });
```

Each test must be independent and order-agnostic: set up and tear down its own state, never rely on a previous test's side effects.

## Coverage

Use `node --test --experimental-test-coverage` or the runner's coverage flag. Treat coverage as a smoke detector, not a target — high coverage of trivial code is worthless, and a meaningful test of a tricky branch is worth more than chasing a percentage. Prioritize covering error paths and edge cases, which are the ones that actually break in production.

## Regression scenarios by boundary

| Boundary | Exercise | Observable assertion |
|---|---|---|
| CLI | help, invalid flags, piped output, failing command | stdout/stderr and exit code, including spawn errors rather than only status |
| Filesystem | existing file, nested path, symlink, missing source, failure after staging | existing content is preserved; no writes escape the target; temporary files are removed |
| Network | HTTP error, malformed JSON, body that stalls after headers | deadline aborts the whole read; no silent stale fallback unless part of the contract |
| Concurrency | one worker fails while siblings are writing | cleanup waits for all workers; bounded number of operations is active |
| Persistence | duplicate request, rollback, retry | constraints hold and external effects are not duplicated |
| Package | install packed tarball into a temporary prefix | executable and referenced assets work outside the source checkout |

Use a temporary directory per test with runner cleanup hooks. Restore mocks, environment changes, and listeners even after an assertion fails. Fake home directories and package prefixes protect the user's actual configuration. Unit tests should not install global packages into the real home or contact live services.

Drive races with deferred promises or barriers rather than arbitrary sleeps. Advance a fake clock only if the operation actually uses that clock. For real timeout tests, assert cancellation and completion with a generous outer test deadline, not an exact elapsed millisecond count.

A failing subprocess can expose `result.error` even when the status is absent or misleading. Include both streams and that error in failure diagnostics. Avoid shell commands when an argument array can exercise the same contract on Linux and Windows.
