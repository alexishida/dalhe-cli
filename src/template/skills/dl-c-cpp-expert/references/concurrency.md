# Concurrency Guide

## Start with the invariant

Before choosing mutexes or atomics, define:
- which state is shared,
- who may mutate it,
- what must appear atomic to observers,
- what ordering/visibility is required,
- what progress guarantee is actually needed.

## Preferred simplifications

In rough order of preference:
1. No sharing.
2. Immutable shared data.
3. Ownership transfer/message passing.
4. Partitioned state with independent owners.
5. Mutex-protected shared state.
6. Fine-grained locks/read-write schemes after measurement.
7. Lock-free/wait-free algorithms only when justified.

## Mutexes

- Associate each protected invariant with a lock.
- Document lock ordering if more than one lock may be acquired.
- Avoid invoking unknown/user callbacks while holding internal locks unless explicitly designed for it.
- Be careful with condition variables: predicates belong in loops.
- Do not assume a reader-writer lock is faster than a mutex.

## Atomics

Use an atomic only when you can explain:
- the atomic object,
- the invariant it participates in,
- which operations synchronize with which,
- why the chosen memory order is sufficient.

Default to sequential consistency for maintainability. Weaken ordering only with a specific performance need and a defensible happens-before argument.

Common hazards:
- publishing a pointer before the pointee is fully visible,
- using relaxed counters as if they synchronize data,
- ABA in lock-free structures,
- unsafe reclamation,
- mixed atomic/non-atomic access to the same object,
- false sharing between independent atomics.

## C++ guidance

Prefer standard facilities such as `std::mutex`, `std::lock_guard`, `std::unique_lock`, `std::scoped_lock`, `std::condition_variable`, `std::atomic`, `std::jthread`, latches/barriers/semaphores when supported by the project.

Use `std::jthread` and stop tokens when structured cancellation fits the toolchain and design.

## Testing

Concurrency bugs require multiple layers:
- deterministic tests for state-machine logic,
- stress tests,
- ThreadSanitizer in a compatible build,
- targeted fault/delay injection when useful,
- long-running tests for rare races only when practical.

A passing stress test does not prove race freedom.
