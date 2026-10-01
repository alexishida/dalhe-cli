# Performance Playbook

## Diagnose first

Classify the bottleneck:

- CPU/algorithmic complexity.
- Allocation or memory retention.
- Network latency/chattiness.
- Database/query behavior.
- Disk/filesystem I/O.
- Bundle/startup/loading.
- Rendering/reconciliation/layout.
- Serialization/parsing.
- Concurrency/queueing/contention.

Use profiling, traces, logs, query plans, browser performance tools, bundle analyzers, or benchmarks when available.

## High-value patterns

### Algorithms and collections

- Replace repeated linear scans in nested loops with `Map`/`Set` indexing when data size justifies it.
- Avoid sorting repeatedly when one sort or an indexed structure suffices.
- Stream/process incrementally for large inputs when full materialization is unnecessary.
- Avoid accidental quadratic string/array building in hot loops.

### I/O

- Batch independent database/API operations when supported.
- Remove N+1 queries/requests.
- Fetch only required fields/rows.
- Use pagination and bounded batch sizes.
- Parallelize independent latency-bound work only with safe bounded concurrency.

### Caching

Before caching, define:

- Cache key.
- Source of truth.
- Freshness requirement/TTL.
- Invalidation/update behavior.
- Maximum size/eviction.
- Tenant/user isolation.
- Failure behavior.

Do not cache authorization decisions or sensitive cross-user data without carefully preserving isolation and freshness semantics.

### Node/server

- Avoid synchronous filesystem/crypto/compression work on request hot paths unless bounded and justified.
- Watch event-loop blocking and large JSON parse/stringify operations.
- Reuse expensive safe clients/connections rather than recreating them per request.
- Bound queues and concurrent promises.

### Frontend

- Reduce transferred JavaScript before adding memoization everywhere.
- Split code at meaningful route/feature boundaries when supported.
- Avoid duplicate fetching and request waterfalls.
- Virtualize genuinely large lists.
- Avoid unnecessary state and effects that cause render cascades.
- Stabilize props/callbacks only when it prevents measurable work or is required by an API contract.
- Optimize images/assets and loading priority when they dominate user-visible metrics.

## Benchmark discipline

When benchmarking:

- Warm up if the runtime/JIT makes it relevant.
- Compare equivalent inputs.
- Run enough iterations to reduce noise.
- Report environment and dataset size.
- Prefer p50/p95/p99 latency for request workloads where possible.
- Validate that the optimized result is identical/correct.

If no benchmark is run, say “expected improvement” rather than claiming a measured speedup.
