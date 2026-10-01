# Debugging Playbook

## Evidence hierarchy

Prefer evidence in this order:

1. Reproducible failing test or minimal reproduction.
2. Runtime stack trace/log with surrounding code.
3. Type/compiler/linter error with actual configuration.
4. Deterministic code-path reasoning from inspected source.
5. Hypothesis based on symptoms only.

Clearly label hypotheses until verified.

## Common TypeScript/JavaScript failure classes

### Undefined/null/state errors

Trace where the value is created, transformed, cached, serialized, and consumed. Fix the invariant or boundary validation rather than scattering optional chaining when the value should exist.

### Async races

Look for:

- Missing `await`.
- Competing writes.
- Stale closures/state.
- Requests resolving out of order.
- Shared mutable module/global state.
- Detached promises.
- Missing cancellation on replaced work.
- Retry duplication.

### ESM/CJS issues

Check:

- `package.json` `type`.
- `module` and `moduleResolution`.
- File extensions and emitted extensions.
- Default/named export interop.
- Runtime loader versus compiler assumptions.

### Build succeeds, runtime fails

Inspect paths, aliases, environment variables, dynamic imports, filesystem assumptions, server/client boundaries, edge/runtime restrictions, and bundler transforms.

### Intermittent tests

Check clocks, random IDs, test ordering, shared globals, open handles, race conditions, ports, network calls, database cleanup, fake timers, and eventual consistency.

## Root-cause note

For a non-trivial fix, be able to state:

- Symptom.
- Root cause.
- Why the old code fails.
- Why the fix addresses the cause.
- Regression coverage.
