# Rust Async and Concurrency

Use this reference for async runtimes, threads, locks, atomics, channels, cancellation, backpressure, and parallelism.

## First identify the model

Determine whether the code is:

- single-threaded async;
- multi-threaded async;
- blocking threaded;
- CPU-parallel;
- mixed async + blocking;
- lock-free/atomic;
- FFI-concurrent.

Do not assume Tokio. Follow the runtime already used by the project.

## Async correctness

Review for:

- blocking I/O or CPU-heavy work on async executor threads;
- locks held across `.await`;
- tasks that are spawned and forgotten unintentionally;
- unbounded spawning or unbounded channels;
- cancellation leaving partial state updates;
- `select!` branches with surprising cancellation/fairness semantics;
- timeouts that drop work without cleanup;
- lost wakeups or custom `Future`/`Waker` mistakes;
- resource lifetime tied incorrectly to task lifetime.

When using blocking work in an async application, use the runtime's intended blocking boundary or a dedicated pool when appropriate.

## Shared state

Prefer ownership/message passing when it naturally models the workflow. Use shared locks when shared mutable state is truly the simpler model.

For mutex/RwLock use, inspect:

- critical-section size;
- lock ordering;
- possible reentrancy;
- poison semantics for standard locks;
- fairness/starvation requirements;
- read/write ratio;
- lock acquisition inside callbacks;
- guards crossing `.await` or external calls.

`RwLock` is not automatically faster than `Mutex`; benchmark under realistic contention.

## Channels and backpressure

Choose bounded channels by default for production pipelines unless unbounded growth is explicitly safe. Define what happens when consumers are slow:

- wait/backpressure;
- drop newest/oldest;
- coalesce;
- reject;
- spill to durable storage.

Document shutdown behavior: sender closure, drain policy, task joins, and in-flight work.

## Atomics

Use the weakest ordering that is demonstrably correct, not the weakest ordering you can guess. If the synchronization proof is not obvious, prefer a lock or established primitive.

For atomics, document:

- the invariant protected;
- which operation establishes happens-before;
- why the chosen ordering is sufficient;
- overflow/wraparound behavior;
- ABA or reclamation concerns where applicable.

## Deadlocks and races

For deadlock analysis, enumerate locks/resources and acquisition ordering. Check await points, callbacks, destructors, and cross-task/channel cycles.

For race-like logical bugs in safe Rust, inspect ordering assumptions, check-then-act sequences, stale snapshots, retries, idempotency, and cancellation—not only memory data races.

## `Send` / `Sync`

Do not force `Send`/`Sync` bounds without understanding why they are required. For public async APIs, unnecessary `Send` bounds can make otherwise valid single-threaded use cases impossible.

For unsafe implementations of `Send` or `Sync`, load `unsafe-security.md` and treat the implementation as a soundness proof.
