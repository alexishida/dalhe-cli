# Project Structure

Conventions for laying out a Node.js project so logic stays testable and the codebase scales.

## Table of contents
- Folder layout
- Layering
- App vs server separation
- Config module
- Dependency wiring

## Folder layout

A typical HTTP service:

```
project/
├── src/
│   ├── app.ts              # builds and wires the app (no port binding)
│   ├── server.ts           # process entry: load config, start server, handle signals
│   ├── config/
│   │   └── index.ts        # validated, typed config object
│   ├── routes/             # transport layer — thin, maps HTTP <-> services
│   │   └── users.routes.ts
│   ├── controllers/        # request/response shaping (optional for small apps)
│   ├── services/           # business logic — framework-agnostic, unit-testable
│   │   └── user.service.ts
│   ├── repositories/       # data access — the only layer that touches the DB
│   │   └── user.repository.ts
│   ├── middleware/         # auth, error handler, request logging
│   ├── errors/             # typed error classes
│   ├── lib/                # shared infra clients (db, cache, http)
│   └── types/              # shared type declarations
├── tests/
├── .env.example
├── .nvmrc
├── package.json
├── tsconfig.json
└── README.md
```

For a **library**, drop `routes/controllers/server` and expose a clean public API from `src/index.ts`, keeping internals in subfolders. For a **CLI**, add a `bin/` entry and a `commands/` folder; keep command files thin and delegate to services.

## Layering

Dependencies flow in one direction: `routes → controllers → services → repositories`. A service must not import a route; a repository must not import a service. This keeps business logic free of HTTP and DB framework details, so it can be tested with plain function calls.

- **Routes/controllers**: parse and validate input, call a service, format the response. No business rules, no DB queries.
- **Services**: the actual logic and orchestration. Throw typed domain errors. Receive their dependencies (repositories, clients) rather than importing singletons directly, so they can be tested with fakes.
- **Repositories**: encapsulate persistence. Return domain objects, not raw DB rows leaking everywhere.

## App vs server separation

Keep wiring (`app.ts`) separate from process startup (`server.ts`):

```ts
// app.ts
export function buildApp(deps: Deps) {
  const app = express();
  // ... middleware, routes wired from deps
  return app;
}
```

```ts
// server.ts
import { buildApp } from './app.js';
import { config } from './config/index.js';
import { createDeps } from './lib/deps.js';

const app = buildApp(createDeps(config));
const server = app.listen(config.port, () =>
  console.log(`listening on ${config.port}`),
);
// graceful shutdown lives here (see async-and-errors.md)
```

This lets tests call `buildApp` with fake dependencies and make requests without binding a port or hitting a real database.

## Config module

Validate environment once at startup into a frozen, typed object. Fail fast if anything required is missing:

```ts
// config/index.ts
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = Object.freeze({
  env: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
});
```

Import `config` everywhere instead of reading `process.env` ad hoc.

## Dependency wiring

Construct shared clients (DB pool, cache, HTTP clients) once and pass them down. A small `createDeps(config)` factory that returns an object of constructed dependencies is enough — you don't need a heavyweight DI container for most services. This keeps singletons out of business logic and makes everything mockable.
