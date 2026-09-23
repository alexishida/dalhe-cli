# C/C++ Review Checklist

Use this as a deep-review checklist, not as a requirement to comment on every item.

## Correctness
- Boundary conditions and empty input.
- Integer overflow/underflow and signedness.
- Size calculations before allocations/copies.
- Initialization of every read value.
- Error propagation and cleanup.
- Partial initialization/destruction.
- Iterator/index validity.

## Memory and lifetime
- Ownership unambiguous.
- No dangling pointer/reference/view/span/iterator.
- No double-free/leak on failure paths.
- Reallocation invalidation handled.
- Correct allocator/deallocator pairing.
- Alignment and storage lifetime correct.

## Undefined behavior
- Bounds.
- Shifts.
- Aliasing/type punning.
- Signed overflow assumptions.
- Invalid pointer arithmetic.
- Format strings.
- Object lifetime/reuse.

## API/ABI
- Public contract preserved unless change is intentional.
- C ABI uses suitable stable types and ownership conventions.
- C++ ABI-sensitive changes identified when relevant.
- Exception/noexcept behavior consistent.
- Thread-safety contract clear.

## Concurrency
- Shared mutable state identified.
- Correct synchronization.
- No races in lazy initialization or teardown.
- Lock ordering consistent.
- Atomic ordering defensible.
- Callback/reentrancy risk considered.

## Performance
- No accidental algorithmic regression.
- Hot-path allocation/copying considered.
- Data layout/locality reasonable.
- Logging/I/O not accidentally in tight loops.
- Synchronization not broadened unnecessarily.
- Optimization claims measured or labeled hypothetical.

## Maintainability
- Invariants visible.
- Functions/types focused.
- Pattern/abstraction earns its complexity.
- Comments explain why/invariants rather than restating code.
- Tests cover the changed behavior and likely regression path.
