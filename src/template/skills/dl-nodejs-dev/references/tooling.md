# Tooling

Toolchain conventions: package.json, TypeScript, linting, formatting, env.

## Table of contents
- package.json
- Scripts
- TypeScript config
- Linting and formatting
- Environment
- Logging

## package.json

```json
{
  "name": "my-service",
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "tsc --watch -p tsconfig.json",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "test": "node --test",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

Pin Node in `engines` and commit a `.nvmrc` matching it. Commit the lockfile (`package-lock.json` / `pnpm-lock.yaml`). Prefer exact or caret ranges deliberately — don't leave everything on wildcard.

The example compiles TypeScript before running `dist/server.js`; its watch script rebuilds but does not restart the server. Keep the existing development runner if it already handles both. Node 20.6 introduced `--env-file`, not native TypeScript execution. Native type stripping arrived in Node 22.6 and its flags/defaults vary by release; it does not type-check or honor all `tsconfig` transformations. Check the [Node TypeScript documentation](https://nodejs.org/api/typescript.html) for the deployed runtime. Run `tsc --noEmit` separately when using a stripping runner.

## Scripts

Keep scripts minimal and named conventionally (`dev`, `build`, `start`, `test`, `lint`, `format`). Anything multi-step goes in a script file under `scripts/`, not inline shell soup in package.json.

## TypeScript config

Strict by default:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

With ESM + NodeNext, relative imports in source must include the `.js` extension (they resolve to the compiled output). Don't disable `strict` to silence errors — fix the types.

## Linting and formatting

Use **ESLint** (flat config, `eslint.config.js`) for correctness rules and **Prettier** for formatting; let Prettier own all whitespace so the team never argues about style. Enable `@typescript-eslint` for TS projects. Run both in CI and ideally a pre-commit hook. Don't hand-format code that a formatter will rewrite.

## Environment

Never commit secrets. Provide a `.env.example` listing every variable with placeholder values, and add `.env` to `.gitignore`. Load and validate env once into the typed config object (see `project-structure.md`) — fail fast at boot if anything required is missing.

## Logging

Use a structured logger (**pino** is the common choice) emitting JSON, not `console.log`, in services. Log levels meaningfully (`error`/`warn`/`info`/`debug`), include a correlation/request id, and never log secrets, tokens, or PII. `console.log` is fine for CLI tools and throwaway scripts.
