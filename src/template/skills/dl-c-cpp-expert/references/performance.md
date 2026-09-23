# Performance and Optimization Guide

## Evidence hierarchy

Prefer evidence in this order:
1. Production/replay profile representing the real workload.
2. Reproducible end-to-end benchmark.
3. Focused microbenchmark that isolates the suspected hot operation.
4. Compiler optimization/vectorization reports and assembly inspection.
5. Static reasoning when measurement is unavailable.

Always label level 5 as an unmeasured expectation.

## Benchmark hygiene

- Use release-like compiler flags.
- Prevent dead-code elimination when microbenchmarking.
- Warm up when startup effects are not part of the metric.
- Run enough iterations/samples to see variance.
- Pin inputs and seed randomness when reproducibility matters.
- Compare distributions or robust statistics, not a single lucky run.
- Keep I/O out of CPU microbenchmarks unless I/O is the target.
- Document hardware, compiler, flags, dataset, thread count, and build revision for serious comparisons.

## Optimization sequence

### 1. Remove unnecessary work
Avoid recomputation, redundant parsing, repeated lookups, repeated virtual dispatch, excessive logging, unnecessary conversions, and needless synchronization.

### 2. Fix algorithms and data structures
Changing O(n²) to O(n log n) or replacing a cache-hostile structure often dwarfs instruction-level tuning.

### 3. Improve locality
- Prefer contiguous storage for traversal-heavy data.
- Reduce pointer chasing.
- Split hot and cold data.
- Consider SoA for vectorized field-wise processing.
- Pack structures only when alignment/access costs are understood.

### 4. Reduce allocations
- Reserve capacity when size is predictable.
- Reuse buffers.
- Batch objects with compatible lifetimes.
- Consider arenas/pools for allocation-heavy hot paths.
- Do not replace an allocator without measuring allocator cost.

### 5. Reduce copies
Use move semantics, views/spans, in-place construction, and APIs that expose output buffers where appropriate. Do not create dangling views.

### 6. Improve branches and dispatch
Consider lookup tables, data partitioning, devirtualization, or branchless techniques only after profiling. Branchless code can be slower if it adds work.

### 7. Vectorization/SIMD
First make loops vectorizer-friendly:
- simple bounds,
- predictable strides,
- adequate alignment where useful,
- no unsafe alias ambiguity,
- enough work per loop,
- minimal loop-carried dependencies.

Prefer compiler auto-vectorization when sufficient. Use intrinsics only for important hot paths with tests and a scalar/fallback strategy where portability matters.

### 8. Parallelism
Parallelize when work is large enough to amortize scheduling/synchronization. Watch bandwidth saturation, false sharing, NUMA effects, oversubscription, and deterministic requirements.

## Compiler options

Evaluate rather than assume:
- `-O2` is often an excellent baseline.
- `-O3` may help compute-heavy code but can increase code size.
- LTO can improve cross-TU optimization and dead-code elimination.
- PGO can outperform guess-based tuning on stable representative workloads.
- `-march=native` is appropriate for binaries deployed only to compatible hosts, not generic distribution.
- Fast-math style flags change floating-point semantics; require explicit acceptance of that contract.

## Memory details

Look for:
- object size and padding,
- cache line contention,
- alignment requirements,
- TLB pressure,
- working-set size,
- allocator metadata overhead,
- fragmentation,
- prefetch usefulness,
- unnecessary zeroing/copying.

Do not over-align indiscriminately: it can increase footprint and hurt cache density.

## Performance review output

For each proposal, state:
- bottleneck/hypothesis,
- mechanism,
- expected tradeoff,
- measurement method,
- result if measured.
