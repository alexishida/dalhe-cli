---
name: nodejs-dev
description: Build, structure, and refactor Node.js applications following modern production-grade conventions. Use this skill whenever the user is writing Node.js code, starting a new Node project, setting up an Express/Fastify API, structuring a backend service, configuring TypeScript for Node, choosing dependencies, writing tests for Node code, handling async/error patterns, or asks anything about "Node", "Node.js", "npm", "package.json", "Express", "Fastify", or server-side JavaScript. Trigger it even when the user doesn't explicitly say "follow the standards" — any non-trivial Node.js task should follow these conventions by default.
---

# Node.js Development

This skill encodes a consistent, production-grade set of conventions for Node.js projects so that generated code is predictable, maintainable, and safe by default. Apply these conventions automatically — do not wait for the user to ask for "best practices."

## When to load the reference files

The SKILL body below covers the defaults that apply to almost every task. For deeper work, load the matching reference:

- `references/project-structure.md` — folder layout, layering (routes → controllers → services → repositories), config and dependency-injection patterns. Read when scaffolding a new project or restructuring an existing one.
- `references/async-and-errors.md` — async/await patterns, error classes, centralized error handling, graceful shutdown. Read when writing request handlers, background jobs, or anything that can fail.
- `references/api-and-validation.md` — Express/Fastify setup, routing, input validation, security middleware. Read when building an HTTP API.
- `references/testing.md` — test layout, mocking, fixtures, coverage. Read when writing or fixing tests.
- `references/tooling.md` — package.json, scripts, TypeScript config, linting/formatting, env handling. Read when configuring the toolchain.

## Core defaults

Apply these unless the user's existing project clearly does otherwise. When an existing codebase has its own conventions, match the codebase first — consistency beats any individual rule here.

### Language and modules

Prefer **ESM** (`"type": "module"` in package.json, `import`/`export`) for new projects, since it's the standard going forward. Match the existing module system in established projects rather than mixing both.

Default to **TypeScript** for anything beyond a throwaway script. The type safety pays for itself the moment a project has more than one contributor or lives longer than a sprint. If the user insists on plain JS, still add `// @ts-check` and JSDoc types where it helps.

Target the **active LTS** Node version and pin it in `engines` and a `.nvmrc`. Don't use APIs newer than the targeted version.

### Async and errors

Use `async/await` everywhere; never mix it with raw `.then()` chains in the same flow. Avoid callback-style APIs — wrap them with `util.promisify` or use the promise-based variant (`fs/promises`, etc.).

Every `await` that can reject must be reachable by a handler. Don't scatter `try/catch` in every handler; instead throw typed errors and catch them in one centralized place (see `references/async-and-errors.md`). Never swallow an error silently — at minimum log it with context.

Never leave an unhandled promise rejection. For top-level scripts, attach `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers that log and exit non-zero.

### Project shape

Even small services benefit from layering: keep transport (HTTP routes) thin, put business logic in services, and isolate data access behind repositories or a data module. This keeps logic testable without spinning up a server. Don't put database queries directly in route handlers.

Keep `index.ts`/`server.ts` (process startup) separate from `app.ts` (the wired-up application). This makes the app importable in tests without binding a port.

### Configuration and secrets

Read configuration from environment variables, validated once at startup into a typed config object. Never read `process.env` scattered throughout the code, and never commit secrets — provide a `.env.example` instead. Fail fast at boot if a required variable is missing.

### Dependencies

Prefer the standard library and a small set of well-maintained dependencies over many micro-packages. Before adding a dependency, check whether Node already provides it (e.g., `fetch`, `crypto`, `test` runner are now built in). Pin versions with a lockfile committed to the repo.

### Security baseline

Validate and sanitize all external input at the boundary. Use parameterized queries — never string-concatenate SQL or shell commands. Set security headers on HTTP servers, and never log secrets, tokens, or full request bodies that may contain PII.

### Style

Use `const` by default, `let` only when reassigning, never `var`. Favor small pure functions, early returns over deep nesting, and descriptive names over comments. Let a formatter own whitespace decisions (see `references/tooling.md`) — don't hand-format.

## Workflow for a new project

1. Confirm the runtime target (Node LTS), language (TS vs JS), and whether it's a CLI, library, or HTTP service.
2. Scaffold the structure from `references/project-structure.md`.
3. Set up the toolchain from `references/tooling.md` (package.json, tsconfig, linter, formatter, scripts).
4. Wire config validation and the centralized error handler before writing features.
5. Write a thin vertical slice (one route → service → repository) plus a test, so the patterns are established before the project grows.

## Workflow for existing code

Read enough of the surrounding code to learn its conventions before changing anything. Match its module system, error style, and folder layout. Introduce the conventions here incrementally and only where they don't clash with what's already there — a consistent codebase is more valuable than a "correct" but inconsistent one.
