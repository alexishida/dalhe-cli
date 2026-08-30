# API and Validation

Setting up an HTTP API with validation and a security baseline.

## Table of contents
- Framework choice
- Routing
- Input validation
- Security middleware
- Responses

## Framework choice

**Fastify** is the default recommendation for new services: faster, schema-first validation built in, native async handlers, good TypeScript support. **Express** remains fine when the team knows it or an ecosystem dependency requires it. Match whatever an existing project already uses.

Either way, keep route files thin: validate, call a service, return. No business logic in routes.

## Routing

Group routes by resource (`users.routes.ts`, `orders.routes.ts`) and mount them under a versioned prefix (`/api/v1`). Register routes from the wiring layer, passing in the services they need rather than importing singletons.

Express:

```ts
export function userRoutes(userService: UserService): Router {
  const r = Router();
  r.get('/:id', asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    res.json(user);
  }));
  return r;
}
```

Fastify (schema doubles as validation and docs):

```ts
app.get('/users/:id', {
  schema: {
    params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
}, async (req) => userService.getById(req.params.id));
```

## Input validation

Validate every external input — params, query, body, headers — at the boundary, before it reaches a service. Never trust client data.

- **Fastify**: use JSON Schema in the route `schema`; it validates and strips unknown fields automatically.
- **Express**: validate with `zod` (or similar) and reject on failure with a `ValidationError`:

```ts
const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

r.post('/', asyncHandler(async (req, res) => {
  const data = CreateUser.parse(req.body); // throws on invalid → caught centrally
  res.status(201).json(await userService.create(data));
}));
```

Validate types AND business constraints (lengths, ranges, allowed values), not just presence.

## Security middleware

Baseline for any public API:

- **Helmet** (Express) or `@fastify/helmet` — sets secure headers.
- **CORS** — configure an explicit allowlist; never reflect arbitrary origins in production.
- **Rate limiting** — `express-rate-limit` or `@fastify/rate-limit` on public/auth endpoints.
- **Body size limits** — cap JSON/body size to prevent memory-exhaustion payloads.
- **Auth** — verify tokens in middleware; never trust a client-supplied user id.

Always use parameterized queries in repositories — never concatenate input into SQL. Never log full request bodies, tokens, or PII.

## Responses

Be consistent. Use a single error envelope (`{ "error": { "code", "message" } }`) and appropriate status codes (201 for creation, 204 for empty success, 4xx for client errors, 5xx for server errors). Don't return 200 with an error body. Include a request id (correlation id) on errors to aid debugging.
