# Rust Performance Optimization

Use this reference for CPU, latency, throughput, memory, allocation, binary-size, or compile-time optimization.

## Measurement contract

Never optimize without defining the metric and workload. Use release builds for runtime benchmarks unless the user specifically cares about debug performance.

Capture enough baseline context to make comparisons meaningful:

- command and input/workload;
- toolchain and relevant features;
- target/profile settings;
- machine/runtime conditions when material;
- repeated samples or benchmark statistics;
- correctness checks.

Microbenchmarks are useful for isolated mechanisms but may not predict end-to-end behavior. Prefer representative workloads for user-facing conclusions.

## Optimization order

Investigate in this order unless profiling shows otherwise:

1. unnecessary work or poor algorithmic complexity;
2. inappropriate data structures;
3. redundant parsing/formatting/conversion;
4. excessive allocation, reallocation, cloning, or copying;
5. cache-unfriendly layout or traversal;
6. contention, lock granularity, scheduling, or synchronization;
7. I/O syscall frequency and batching;
8. hot-loop details such as bounds checks, branching, vectorization, and tiny-call overhead;
9. allocator, codegen, LTO, PGO, target CPU, or unsafe/SIMD tuning only when justified.

## Allocation and ownership

Useful questions:

- Can capacity be reserved from known sizes?
- Can a buffer be reused safely?
- Is an owned `String`/`Vec` required, or can work stay borrowed?
- Are conversions allocating repeatedly inside a loop?
- Is `collect()` materializing data unnecessarily?
- Are `Arc` clones or refcount updates significant at this scale?
- Would a different representation improve locality more than clever borrowing?

Do not replace clear owned code with lifetime complexity unless the benefit matters.

## Iterators vs loops

Do not assume either is faster. Rust iterators often optimize well, while explicit loops can make control flow or mutation clearer. Inspect generated behavior or benchmark when it matters.

## Bounds checks and indexing

Prefer safe indexing and iteration. The optimizer can eliminate many bounds checks. Restructure loops or use iterators/slices before considering unchecked indexing. `get_unchecked` requires a strong measured justification plus documented safety invariants.

## Concurrency for speed

Parallelism is not automatically an optimization. Include overhead from synchronization, task scheduling, cache contention, NUMA effects, work partitioning, and tail latency.

Prefer bounded concurrency and benchmark realistic contention levels. For CPU-bound parallelism, a thread pool/rayon-style model may be more appropriate than async tasks. For I/O-bound workloads, async may help concurrency but does not make CPU work faster.

## Profiling and optional tools

Use what is already installed and appropriate to the platform. Examples include system profilers (`perf`, Instruments, ETW-based tools), sampling profilers, heap/allocation profilers, `cargo flamegraph`, `samply`, or benchmark frameworks such as Criterion/Divan.

For specialized analysis, optional tools may include `cargo bloat`, `cargo llvm-lines`, `cargo timings`, or callgrind-based tooling. Do not install them silently.

## Compiler/profile tuning

Only tune profiles after code-level bottlenecks are understood. Potential levers include:

- optimization level;
- LTO / thin LTO;
- codegen units;
- panic strategy;
- debug info;
- target CPU/features;
- PGO/BOLT where the deployment pipeline supports them.

Evaluate compile-time, binary-size, portability, reproducibility, and deployment consequences. Avoid setting `target-cpu=native` for distributed binaries unless the target environment is controlled.

## Compile-time performance

For slow builds, distinguish clean build, incremental build, check, test, and link time. Investigate:

- large generic/monomorphized surfaces;
- macro/proc-macro cost;
- feature explosion;
- crate graph structure and invalidation boundaries;
- codegen units/LTO profile choices;
- heavy build scripts;
- duplicate dependency versions.

Do not trade runtime performance or API quality for compile time without user priorities.
