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

### Ghidra

Preferred for this workflow when it supports the target format:

- import with the loader that matches the container (check whether a community loader/plugin is needed for console ROMs or obscure formats);
- run auto-analysis, then export symbols, functions, xrefs, comments, and decompiler output as metadata;
- use `analyzeHeadless` for reproducible exports:

```text
analyzeHeadless proj name -import target.bin -scriptPath scripts/ -postScript ExportProject.java
```

- record loader, processor settings, analyzer set, and script versions with exports.

### REA (MCP/CLI)

REA (https://github.com/morluto/rea) provides reverse-engineering tools to the agent through MCP and a CLI, using Ghidra, Hopper, or IDA as its native-analysis backend.

Setup:

```text
npx rea-agents setup                      # register REA with your agent
npm install -g rea-agents && rea --help   # CLI alternative
```

Useful tools for matching decompilation:

- `open_binary`, `binary_overview`, `list_segments`, `list_procedures`, `list_names`, `list_strings`;
- `procedure_info`, `procedure_assembly`, `procedure_pseudo_code`, `procedure_callers`, `procedure_callees`, `procedure_references`;
- `find_xrefs_to_name`, `xrefs`, `inspect_address_context`, `read_bytes`;
- `compare_functions` (instruction-level unit comparison);
- `evaluate_reconstruction_coverage`, `verify_reconstruction`;
- `export_evidence_bundle` / `import_evidence_bundle`.

Tool results carry inline evidence and coverage/limitation notes; keep them with the progress table. If REA is not configured, use the REA CLI or fall back to the tools above.

## Comparing compiler output

For small units, compile to assembly/object files and compare before linking. This reduces noise from layout and metadata. Useful outputs:

- compiler-generated assembly (`-S` or equivalent);
- object disassembly with relocations;
- symbol sizes;
- section sizes;
- map files.

If a project has a purpose-built diff tool (for example instruction-aware diffing), prefer it over raw hex diffs for inner-loop work.
