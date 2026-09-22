# Methodology: matching decompilation

## What this technique is

“Matching decompilation” is an iterative reverse-engineering method in which reconstructed source is compiled with a historically compatible or otherwise pinned toolchain and compared against a reference binary. The loop is:

`inspect target -> hypothesize source/toolchain -> compile -> diff -> refine`

A byte-identical result proves that the produced artifact matches the reference under the tested build conditions. It does **not** prove that the reconstructed text is the exact original source: many distinct source programs can compile to the same machine code, and comments/macros/identifier names are often erased.

## Evidence ladder

Use the strongest available evidence without overclaiming:

1. Source/debug artifacts actually present.
2. Symbols, map files, RTTI/type metadata, imports/exports.
3. Relocations and section structure.
4. Disassembly and control-flow/data-flow analysis.
5. Decompiler pseudocode.
6. Runtime observations from authorized tests.
7. Compiler-output experiments.

Decompiler pseudocode is a hypothesis generator. Machine code and format metadata are primary evidence.

## Phase A — provenance and target lock

- Copy the reference artifact read-only.
- Record filename, size, SHA-256, acquisition source, and expected platform/version.
- If multiple regional/release/debug builds exist, keep them separate.
- Avoid comparing a patched, compressed, signed, packed, encrypted, or loader-transformed image against an unpacked build without first identifying the transformation.

## Phase B — format and toolchain inference

Determine:

- CPU/ISA and ISA extensions;
- 32/64-bit mode;
- endianness;
- executable/object format;
- ABI/calling convention;
- compiler family/version clues;
- standard library/runtime version;
- assembler/linker family;
- optimization/LTO/debug settings;
- linker script or memory map clues.

Useful compiler fingerprints can come from startup code, exception tables, runtime helper names, instruction-selection patterns, stack-protector sequences, standard-library symbols, metadata sections, and version strings. Treat any single fingerprint as probabilistic unless confirmed by multiple signals.

## Phase C — reproducibility before matching

Build the candidate twice with no source changes and compare outputs. If different, diagnose nondeterminism before target matching.

Useful controls:

- fixed timezone and locale;
- reproducible archive flags;
- source path remapping;
- deterministic linker/build-id options where appropriate;
- pinned compiler, linker, SDK, and dependencies;
- stable input ordering;
- disabled wall-clock macros or generated timestamps;
- consistent strip/debug packaging steps.

Do not delete legitimate target metadata just to make the hash match unless evidence shows the original build omitted it too.

## Phase D — partition the problem

Whole-image mismatch gives poor feedback. Build a map of:

- headers;
- executable code sections;
- read-only data;
- writable data/BSS description;
- relocations;
- symbol/debug tables;
- resources/assets;
- signatures/checksums;
- padding/alignment.

Then subdivide code by symbol/function or stable address ranges.

## Phase E — function reconstruction

For each function:

1. Identify callers/callees and ABI.
2. Infer parameters and return values from register/stack use.
3. Track stack locals and lifetime overlap.
4. Identify globals, literal pools, vtables, jump tables, string references.
5. Reconstruct control flow conservatively.
6. Assign types only when evidence supports them.
7. Compile and compare the function/object.
8. Change one source/codegen hypothesis per iteration.

Keep a note of “semantic confidence” separately from “binary match status.” A function can match bytes while names/types remain partly inferred.

## Phase F — codegen matching

If generated assembly is semantically equivalent but not identical, compare:

- instruction selection;
- basic-block order;
- branch polarity;
- register allocation;
- stack slot order;
- constant materialization;
- inlining boundaries;
- tail calls;
- switch lowering;
- sign/zero extension;
- strength reduction;
- floating-point contraction/reassociation;
- exception-unwind metadata.

Before contorting source, verify compiler and flags. Source shaping should be the last local lever, not the first.

## Phase G — link/layout matching

Once individual objects/functions are close, fix image-level differences:

- object order;
- section order;
- alignment/padding;
- COMDAT/weak symbol resolution;
- linker relaxation;
- dead-section elimination;
- symbol visibility;
- import/export ordering;
- resource ordering;
- relocation handling;
- build IDs/UUIDs/checksums;
- signing or post-link transformations.

A one-byte function-size difference early in a tightly packed image can shift many later addresses, producing a misleadingly large raw diff.

## Phase H — final verification

Only declare byte-for-byte matching when:

- candidate file size equals target;
- raw comparison shows zero differing bytes;
- cryptographic hash (prefer SHA-256) equals target;
- the exact build invocation and toolchain are recorded;
- a clean rebuild reproduces the same matching artifact.

If the target project historically publishes MD5/SHA-1, record those too for compatibility, but retain SHA-256 as the modern integrity fingerprint.
