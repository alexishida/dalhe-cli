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

`isOperational` distinguishes expected failures (bad input, missing record) from programmer bugs. Operational errors are safe to surface; non-operational ones should crash the process so a supervisor restarts it cleanly.

## Centralized error handling

Throw typed errors from services; do not write per-handler `try/catch` that formats responses. Catch everything in one place.

For **Express**, wrap async handlers so rejections reach the error middleware, then register a single error handler last:

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
  res.status(status).json({ error: { code, message: err.message } });
};
```

For **Fastify**, use the built-in `setErrorHandler` — handlers can be plain `async` functions and rejections are caught automatically, so no wrapper is needed.

Never leak stack traces or internal messages to clients on 5xx — return a generic message and log the detail server-side.

## Process-level safety nets

Every long-running process should install these once at startup:

```ts
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandled rejection');
  throw reason instanceof Error ? reason : new Error(String(reason));
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'uncaught exception — shutting down');
  process.exit(1);
});
```

These are a last resort, not a substitute for handling errors where they occur.

## Graceful shutdown

On `SIGTERM`/`SIGINT`, stop accepting new work, finish in-flight requests, close DB/cache connections, then exit. Add a timeout so a stuck shutdown doesn't hang forever:

```ts
function shutdown(server, deps) {
  return async () => {
    server.close(async () => {
      await deps.db.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
}
process.on('SIGTERM', shutdown(server, deps));
process.on('SIGINT', shutdown(server, deps));
```

## Concurrency

For bounded parallelism over a large list (e.g., calling an API for thousands of items), don't fire them all at once — cap concurrency with a small worker pool or a library like `p-limit`. Unbounded `Promise.all` over a huge array exhausts sockets and memory.
