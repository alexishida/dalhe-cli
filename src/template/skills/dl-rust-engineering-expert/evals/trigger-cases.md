# Trigger and Behavior Evals

Use these prompts to sanity-check routing and behavior after modifying the skill.

## Should trigger

1. "Refactor this Rust parser to remove unnecessary allocations without changing its public API."
2. "Why does this borrow checker error happen and what is the idiomatic fix?"
3. "Review this Tokio worker pool for deadlocks, cancellation bugs, and backpressure problems."
4. "Optimize the p99 latency of this Axum endpoint; benchmark before and after."
5. "Audit this unsafe FFI wrapper for soundness."
6. "Upgrade this workspace dependency while preserving MSRV 1.xx and public API compatibility."
7. "Fix the failing Rust tests and run the appropriate Cargo checks."
8. "Reduce the binary size of this Rust CLI and show measured tradeoffs."

## Should not trigger

1. "Write a Java Spring controller."
2. "Explain Python list comprehensions."
3. "Design a PostgreSQL schema with no Rust implementation context."
4. "Summarize this marketing document."

## Behavior expectations

- Reads repository policy/manifests before broad edits.
- Does not blindly use `--all-features`.
- Does not introduce `unsafe` for convenience.
- Does not claim performance gains without measurements.
- Distinguishes checks actually run from recommended checks.
- Preserves MSRV/public API/target constraints when discovered.
- Uses focused references rather than loading all supporting files.
