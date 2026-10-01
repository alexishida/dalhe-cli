# TypeScript Standards

Use these rules as defaults and defer to stricter project-local conventions.

## Type system

- Keep `strict` enabled when already enabled. Prefer enabling strict sub-options during planned migrations, not as an unrelated drive-by change.
- Prefer inference for local variables and explicit types for stable public boundaries when useful.
- Use `unknown` for untrusted values and narrow through control flow or runtime schemas.
- Avoid `any`. If an external library forces it, isolate the unsafe edge in the smallest adapter possible.
- Avoid double assertions such as `value as unknown as Target`.
- Avoid non-null assertions unless a proven invariant cannot be expressed more safely.
- Use exhaustive checks for discriminated unions. A `never` helper is appropriate when it improves compile-time coverage.
- Prefer tagged unions over multiple correlated booleans.
- Prefer `satisfies` when validating an expression against a type without widening away useful literal information.

## API design

- Prefer narrow parameter objects when many arguments are optional or easily confused.
- Distinguish absence (`undefined`), explicit emptiness (`null` when part of the domain), and empty collections.
- Use readonly views for data that callers should not mutate.
- Avoid returning mutable internal collections directly when doing so leaks invariants.
- Throw typed/domain errors only where exceptions are the project's established contract; otherwise use the existing result/error pattern.
- Do not expose implementation-specific database or transport types across domain boundaries unless deliberate.

## Async code

- Await promises that affect correctness, lifecycle, or error handling.
- Use `Promise.all` only when operations are independent and concurrency is safe.
- Use bounded concurrency for large or attacker-controlled collections.
- Preserve `AbortSignal`/cancellation when the runtime and API support it.
- Apply explicit timeouts to external I/O where the project has a timeout mechanism.
- Avoid async constructors and hidden background work.

## Errors and logging

- Preserve the original error as `cause` when wrapping if supported.
- Do not log credentials, access tokens, session cookies, secrets, full payment data, or sensitive personal payloads.
- Add context that helps diagnosis without leaking secrets.
- Avoid swallowing errors. If deliberately ignored, document why and whether metrics/logging are needed.
- Prefer structured logs when the project supports them.

## Modules and imports

- Match existing ESM/CJS conventions.
- Prefer type-only imports when required by the compiler/linter and when they improve emitted code clarity.
- Avoid circular dependencies; move shared contracts or invert dependencies where necessary.
- Do not rely on path aliases in environments that do not resolve them at runtime without corresponding tooling.

## Runtime validation

Types disappear at runtime. Validate data from:

- HTTP params/query/body/headers.
- Environment variables.
- Webhooks and third-party APIs.
- Queues/events.
- File contents.
- Database JSON/untyped columns.
- `JSON.parse`.
- Browser storage and postMessage.

Reuse the project's validation library when one exists. Validate as close to the trust boundary as practical.

## Frontend

- Keep state minimal and derive values instead of duplicating them.
- Avoid effects for values that can be computed during render.
- Clean up subscriptions, observers, timers, and event listeners.
- Preserve semantic HTML, keyboard access, labels, and focus behavior.
- Treat user-controlled HTML and URLs as unsafe.
- Avoid unnecessary memoization; use it when profiling or clear referential stability requirements justify it.

## Backend

- Authorize access at the resource/action boundary, not only at routing/UI level.
- Use parameterized queries or ORM query builders; never concatenate untrusted values into executable queries.
- Bound list/page sizes and batch sizes.
- Use transactions where multi-step writes must be atomic.
- Make retries safe through idempotency or clear duplicate handling.
- Avoid returning internal error stacks/details to untrusted clients in production.
