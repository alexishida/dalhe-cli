# Unsafe Rust, FFI, and Security

Use this reference whenever `unsafe`, raw pointers, unions, FFI, manual pinning, custom allocators, intrinsics/SIMD, or unsafe concurrency primitives are involved.

## Unsafe policy

`unsafe` is not a performance flag. Use it only when required for an operation the safe language cannot express efficiently or at all, and when the invariants can be stated and reviewed.

Keep unsafe blocks small and place safe validation outside them.

Every meaningful unsafe block or unsafe impl should have a clear `SAFETY:` explanation covering the invariants relied upon.

## Soundness checklist

Review:

- pointer provenance and validity;
- alignment;
- initialized vs uninitialized memory;
- aliasing and exclusive access rules;
- lifetime validity and dangling references;
- layout/ABI assumptions;
- integer overflow in sizes/offsets;
- slice construction lengths;
- ownership/double-free/leak behavior;
- panic/unwind behavior across FFI;
- thread safety and synchronization;
- pinning guarantees and structural pinning;
- drop order and partial initialization;
- validity invariants of referenced types.

Do not create references (`&T`/`&mut T`) to memory that does not satisfy full reference validity requirements merely for temporary access; raw pointers may be necessary until validity is established.

## FFI

For FFI boundaries:

- use explicit ABI declarations;
- validate nullability, lengths, encodings, and ownership contracts;
- make allocation/free ownership unambiguous;
- prevent Rust panics from unwinding across an FFI boundary unless the ABI explicitly supports it;
- preserve struct layout only with appropriate representation guarantees;
- be explicit about thread-affinity and callback lifetime;
- convert external error conventions into Rust types at the boundary.

## Unsafe traits and auto traits

For `unsafe impl`, write down why all implementors/instances satisfy the trait contract. For manual `Send`/`Sync`, audit every field and any hidden aliasing or thread-affinity invariant.

## Validation tools

When applicable and available:

- Miri for undefined-behavior classes detectable in interpreter execution;
- sanitizers for address/thread/memory issues on supported targets;
- fuzzing for parsers/protocol/input boundaries;
- property tests for invariant-heavy logic;
- loom-style concurrency model testing for supported synchronization code.

These tools do not prove soundness; combine them with invariant reasoning.

## Security review

For hostile input and security-sensitive code, inspect:

- integer truncation/overflow in sizes and offsets;
- decompression or allocation bombs;
- unbounded recursion/loops/retries;
- path traversal and filesystem races;
- parsing ambiguity and canonicalization;
- timing-sensitive comparisons where secrets are involved;
- secret leakage through logs/errors/debug output;
- unsafe deserialization assumptions;
- denial-of-service via locks, queues, regexes, hashing, or expensive validation.
