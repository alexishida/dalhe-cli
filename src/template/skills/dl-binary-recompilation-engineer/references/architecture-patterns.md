# Recompilation Architecture Patterns

## Pattern: Generated semantic helpers

Keep tricky semantics in tested helpers rather than duplicating them in generated code.

```cpp
inline uint32_t add32(uint32_t a, uint32_t b) {
    return a + b;
}
```

Use richer helpers for:
- unaligned loads/stores
- floating-point conversions
- saturating/vector operations
- condition register updates
- exceptions

## Pattern: Two-level function dispatch

For sparse guest addresses:

```text
guest PC
 -> page index
 -> page dispatch table
 -> function/block
```

This avoids giant sparse tables.

## Pattern: Module-aware dispatch

```text
module identity + guest PC
 -> compiled target
```

Use for overlays, REL/PRX-like modules, or any reused virtual address space.

## Pattern: Reference backend

Keep a slow, obviously correct backend.

It can be:
- an interpreter you own
- a trusted emulator core
- a trace captured from hardware

Use it as an oracle during development.

## Pattern: Semantic IR

An IR node should represent guest meaning, not guest spelling.

Example:

```text
guest: ADDIU r4, r4, -16
IR:    r4 = add_wrap_i32(r4, -16)
```

The host backend decides how to implement the operation.

## Pattern: Event boundary

Keep asynchronous platform behavior behind an event interface.

```text
CPU/runtime
  -> schedule DMA completion
  -> schedule interrupt
  -> schedule audio event
```

This is easier to reason about than ad-hoc host callbacks.

## Pattern: Patch layer

Title-specific behavior:

```text
patches/<title>/<version>/
```

Core translator must not acquire title addresses or special cases unless they are genuinely architectural.

## Anti-pattern: host pointer equals guest pointer

This may initially look fast but makes:
- bounds checks
- MMIO
- overlays
- 32/64-bit differences
- debugging
- alternate mappings

much harder.

Use an explicit guest-address abstraction first.

## Anti-pattern: decode everything as code

Embedded data, jump tables, literals, and alignment gaps can decode into valid-looking instructions.

Code discovery must have provenance and confidence.

## Anti-pattern: optimizing before differential tests

A fast wrong recompiler is much harder to debug than a slow correct one.
