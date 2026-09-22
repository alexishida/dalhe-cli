# Platform Notes

Use this file only when the target matches one of these families. These are engineering starting points, not substitutes for the target's ISA and hardware documentation.

## Nintendo 64

Typical concerns:

- MIPS III / VR4300 semantics
- big-endian guest memory
- branch delay slots
- `HI`/`LO`
- COP1 floating point
- RSP microcode or HLE
- libultra-style OS services
- PI/SI/AI/VI behavior
- overlays and code loaded into shared address ranges

A practical architecture often separates:
- MIPS CPU AOT translation
- libultra/runtime HLE
- graphics/RSP layer
- audio layer
- title patches

Symbol information from decompilation projects can accelerate discovery without requiring decompiled source to become the port source.

## PlayStation 1

Typical concerns:

- MIPS R3000A family behavior
- branch delay slots
- scratchpad
- memory-mapped devices
- GTE coprocessor
- executable overlays
- CD-ROM streaming
- GPU command packets
- SPU/audio timing

Overlay identity is frequently more important than raw virtual address identity.

A hybrid compiled/interpreted path can be useful while overlay coverage is incomplete.

## PlayStation 2

Typical concerns:

- Emotion Engine / R5900 semantics
- 128-bit GPR behavior in portions of the ISA
- COP1
- VU0/VU1
- DMA chains
- scratchpad
- GS command/data flow
- IOP interaction
- ELF loading and module behavior

Do not model PS2 as "ordinary MIPS plus graphics." DMA, vector units, and synchronization are architectural concerns.

A sensible milestone order can be:

```text
ELF parse
 -> basic EE integer execution
 -> memory
 -> calls/ABI
 -> core runtime stubs
 -> DMA
 -> vector units
 -> graphics
 -> audio/IOP integration
```

## PSP

Typical concerns:

- Allegrex/MIPS32-derived CPU
- VFPU
- kernel/user APIs
- module imports/exports
- PRX modules
- display lists/GU
- audio and filesystem services

Separate CPU translation from PSP system-call/HLE implementation.

## GameCube / Wii

Typical concerns:

- PowerPC big-endian code
- link register and count register
- condition register
- paired singles / floating point
- TOC/SDA-style data access patterns where applicable
- DOL/REL modules
- relocations
- GX graphics command flow
- DSP/audio
- interrupts and timing

REL modules make module identity and relocation handling first-class concerns.

For incomplete static coverage, a trusted interpreter backend can be used as a temporary fallback.

## Xbox 360

Typical concerns:

- PowerPC-derived Xenon CPU
- big-endian guest behavior
- multiple hardware threads
- condition and link registers
- XEX executable metadata
- imports and kernel APIs
- Xenos GPU command/shader translation
- synchronization and endian-sensitive data structures

Treat CPU code translation and GPU/shader translation as separate pipelines.

A practical project split is:

```text
XEX parser
PPC translator
generated game code
kernel/runtime shim
graphics command handling
shader translation
audio/input/filesystem
validation
```

Do not assume that recompiling PPC code alone creates a usable native port.
