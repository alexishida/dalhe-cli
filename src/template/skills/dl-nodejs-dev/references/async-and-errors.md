# Async and Error Handling

Patterns for writing async Node.js code that fails loudly, predictably, and in one place.

## Table of contents
- Async style
- Typed error classes
- Centralized error handling
- Process-level safety nets
- Graceful shutdown
- Concurrency

## Async style

Use `async/await` consistently. Don't mix `await` and `.then()` in the same function. Prefer promise-based APIs (`node:fs/promises`, `node:timers/promises`) and the built-in global `fetch` over callback or library HTTP clients unless a project already standardized on one.

Run independent async work concurrently with `Promise.all`; reserve sequential `await` for when one step depends on the previous:

```ts
// independent → parallel
const [user, orders] = await Promise.all([
  userRepo.findById(id),
  orderRepo.findByUser(id),
]);
```

Use `Promise.allSettled` when partial failure is acceptable and you need every result regardless of individual rejections.

## Typed error classes

Define domain errors so the handler can map them to responses without string-matching messages:

```ts
// errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode = 500,
    readonly code = 'INTERNAL_ERROR',
    readonly isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

`isOperational` distinguishes expected failures (bad input, missing record) from programmer bugs. Only explicitly public error fields are safe to surface. Request-scoped bugs should produce a generic server error and a diagnostic log. A fatal uncaught exception requires termination; do not deliberately crash a healthy process for every request error.

## Centralized error handling

Throw typed errors from services; do not write per-handler `try/catch` that formats responses. Catch everything in one place.

For **Express 4**, wrap async handlers so rejections reach the error middleware. Express 5 propagates returned rejected promises automatically. In both cases register a single error handler last:

```ts
// middleware/async-handler.ts
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

```ts
// middleware/error-handler.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  if (status >= 500) logger.error({ err, reqId: req.id }, 'request failed');
  if (res.headersSent) return _next(err);
  const message = status >= 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: { code, message } });
};
```

For **Fastify**, use the built-in `setErrorHandler` — handlers can be plain `async` functions and rejections are caught automatically, so no wrapper is needed.

Never leak stack traces or internal messages to clients on 5xx — return a generic message and log the detail server-side.

## Process-level safety nets

Keep process-wide failure policy in the executable, not a library. Prefer the runtime's fatal-error behavior plus a supervisor; use `uncaughtExceptionMonitor` for diagnostics when appropriate. Installing an `uncaughtException` handler changes default termination behavior and must never resume normal operation after an unknown failure. Handle expected rejections at their operation boundary instead of relying on process events.

## Graceful shutdown

On `SIGTERM`/`SIGINT`, stop accepting new work, finish in-flight requests, close DB/cache connections, then exit. Add a timeout so a stuck shutdown doesn't hang forever:

Make shutdown idempotent: repeated signals share one in-flight shutdown promise. Stop queue consumers and new requests, drain tracked work, close clients, then set the exit status. Catch failures from asynchronous cleanup explicitly; an async callback passed to `server.close` is not awaited by the server. Keep a deadline that forces termination if draining stalls, and clear it on completion. Test shutdown with an open connection and a failing database close.

## Concurrency

For bounded parallelism over a large list (e.g., calling an API for thousands of items), don't fire them all at once — cap concurrency with a small worker pool or a library like `p-limit`. Unbounded `Promise.all` over a huge array exhausts sockets and memory.

## Cancellation and cleanup

Pass an abort signal through the whole HTTP operation, including `response.json()` or stream consumption. A timeout that is cleared as soon as `fetch` returns leaves a stalled body unbounded. With a manual timer, clear it in `finally` only after consumption finishes.

`Promise.all` does not cancel tasks on rejection. When tasks mutate a temporary workspace, collect `Promise.allSettled` results before cleanup, then propagate the first failure or a useful aggregate. Do not continue installing partial downloads after a failure.
