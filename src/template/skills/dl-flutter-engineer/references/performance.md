# Performance

Use this reference for jank, slow frames, startup, memory, network/image overhead, large lists, app size, or Flutter web performance.

## Rule zero: measure

Use Flutter DevTools/profile/release-appropriate tooling when available. Establish a baseline and identify whether the bottleneck is CPU, GPU/raster, layout, build/rebuild frequency, memory/GC, I/O/network, image decoding, shader/rendering, startup work, or download/bundle size.

Do not optimize based only on intuition when profiling is possible.

## Rebuild and widget work

- Keep expensive computation, parsing, sorting, filtering, and I/O out of `build()`.
- Split very large widgets along state-change/ownership boundaries, not merely by line count.
- Narrow reactive subscriptions/selectors so state changes rebuild only what needs them.
- Use `const` constructors where natural.
- Avoid recreating controllers, futures, streams, focus nodes, animations, or expensive objects during rebuilds.
- Keep keys stable and intentional; do not add keys everywhere.

## Lists and scrolling

- Use lazy builders for large or unbounded collections.
- Avoid laying out off-screen content unnecessarily.
- Use item extent/prototype hints when appropriate and correct.
- Paginate or progressively load large remote datasets.
- Keep per-row work small and avoid repeated heavy decoding/transforms.

## Rendering/layout

- Watch for excessive clipping, saveLayer-like effects, blur, opacity layering, shadows, and expensive custom painting in hot paths.
- Prefer simpler composition when it produces the same visual result.
- Isolate frequently repainting custom regions only when profiling shows a benefit.

## Images

- Request images near the displayed dimensions when possible.
- Use appropriate cache dimensions and formats.
- Avoid decoding huge originals for thumbnails.
- Handle placeholders/errors without triggering layout instability.
- Precache only assets with strong evidence of imminent use; indiscriminate precaching increases memory pressure.

## Network/data

- Avoid duplicate requests caused by rebuilds/lifecycle churn.
- Cache according to data freshness semantics, not universally.
- Batch or debounce where user experience and API semantics permit.
- Paginate large responses.
- Parse/transform efficiently and offload truly CPU-heavy work when it blocks the UI isolate.

## Isolates/concurrency

Move CPU-bound work off the UI isolate when profiling shows frame impact and transfer/serialization overhead is justified. Do not use isolates for ordinary async I/O; Dart's async model already handles non-blocking I/O.

## Memory

Look for:

- undisposed controllers/subscriptions/timers;
- caches without bounds/eviction;
- large retained images/byte buffers;
- closures retaining large object graphs;
- long-lived collections that only grow;
- native/plugin resources without lifecycle cleanup.

Confirm leaks using memory tooling/snapshots when available.

## Startup

- Defer non-critical initialization.
- Avoid serializing independent initialization steps unnecessarily.
- Keep synchronous work before first frame minimal.
- Load optional SDKs/features only when needed if platform/package behavior allows it.

## App size

When size matters:

- inspect size output rather than guessing;
- remove unused assets/fonts/dependencies;
- avoid duplicative heavyweight packages;
- use platform-specific split/app bundle mechanisms where appropriate;
- consider deferred loading on web when it fits the architecture.

## Performance acceptance

After a performance change, report the evidence available: before/after trace, frame timing, memory behavior, request count, startup timing, or artifact size. If measurement tooling was unavailable, say that optimization is reasoned but unverified.
