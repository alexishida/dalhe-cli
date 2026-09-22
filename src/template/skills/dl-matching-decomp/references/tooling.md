# Tooling guide

Choose tools by artifact and task. Prefer tools already installed in the user's environment.

## Generic

- `file` — quick format/architecture identification.
- `strings` — embedded version/toolchain/runtime hints.
- `xxd` / hex viewer — headers and localized bytes.
- `cmp` — exact raw byte comparison.
- `sha256sum` / `shasum -a 256` — whole-file fingerprints.
- `scripts/fingerprint.py` — portable fingerprint summary.
- `scripts/compare_binary.py` — portable mismatch ranges/ratio.

## ELF / Unix-like native binaries

- `readelf -h -S -s -r -n`
- `objdump -d -r -t`
- `nm -an`
- `llvm-readobj`, `llvm-objdump`, `llvm-nm`

Pay attention to `.text`, `.rodata`, `.data`, relocation sections, notes/build IDs, unwind tables, dynamic symbols, and debug sections.

## PE/COFF / Windows

- Visual Studio `dumpbin /headers /imports /exports /symbols`
- LLVM `llvm-readobj --file-headers --sections --coff-*`
- Ghidra/IDA/Binary Ninja for code/data analysis

Check PE timestamps, image base, section alignment, import ordering, PDB/debug directory, resources, load config, and Authenticode/post-link signing separately.

## Mach-O / Apple

- `otool -hv -l -L -tV`
- `nm -nm`
- `dyld_info` / modern equivalents
- LLVM object tools

Watch UUID/load commands, code signatures, deployment target, SDK version, symbol stripping, and linker order.

## ROMs / firmware / console images

Use platform-specific header, checksum, compression, relocation/overlay, and asset tools when available. Distinguish executable code matching from container/header/checksum matching. Preserve region/version identity.

## Decompiler/disassembler tools

Ghidra, IDA, Binary Ninja, radare2/rizin and similar tools are useful for control flow, cross-references, data typing, and function discovery. Their pseudocode should not be copied uncritically into source. Verify against assembly and call sites.

## Comparing compiler output

For small units, compile to assembly/object files and compare before linking. This reduces noise from layout and metadata. Useful outputs:

- compiler-generated assembly (`-S` or equivalent);
- object disassembly with relocations;
- symbol sizes;
- section sizes;
- map files.

If a project has a purpose-built diff tool (for example instruction-aware diffing), prefer it over raw hex diffs for inner-loop work.
