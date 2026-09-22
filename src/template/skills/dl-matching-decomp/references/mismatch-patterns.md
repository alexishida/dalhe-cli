# Mismatch patterns and likely causes

Use this as a hypothesis checklist, not as proof.

| Symptom | Likely classes | Small next experiment |
|---|---|---|
| Same file size; 1–32 bytes differ near header | timestamp, checksum, build ID, flags | inspect header fields and compare two candidate rebuilds |
| Same size; repeated 4/8-byte differences | addresses/relocations/pointers | inspect relocation table and link base/options |
| First mismatch in one function, everything after shifted | function size/codegen changed | isolate that function/object; compare assembly before touching later code |
| Code section matches; final hash does not | metadata/debug/resources/signature/padding | hash/compare sections individually |
| Every function differs similarly | wrong compiler/version/optimization/ABI | compile a tiny fingerprint corpus with candidate toolchains |
| Only prologues/epilogues differ | ABI, stack protector, frame-pointer, unwind settings | inspect compile flags and target ABI |
| Branches inverted/block order differs | optimizer/source control-flow shape | test equivalent `if`/early-return/source-order variants after toolchain is confirmed |
| Sign/zero extension differs | signedness or integer width | verify parameter/local types and promotions |
| Loads/stores at nearby offsets differ | struct packing/layout/member types | reconstruct layout and alignment from all access sites |
| One call is direct vs indirect/PLT | visibility/PIC/linkage | check `static`, hidden/default visibility, PIC/PIE and linker model |
| Constants differ slightly | floating-point mode, literal type, generated constants | verify `float` vs `double`, rounding, fast-math/FMA settings |
| Switch body matches but jump table differs | case ordering, density heuristic, alignment | inspect compiler version/flags and exact case set/order |
| Debug-only mismatch | source paths, compiler flags, timestamps | compare stripped artifacts; use path remapping for deterministic debug builds |
| ROM/image checksum differs but payload matches | platform checksum/post-link patcher | identify documented post-link checksum/signature stage |
| Candidate rebuilds differ from each other | nondeterministic build | fix reproducibility before target matching |

## Compiler mismatch warning

A wrong compiler patch release can make almost every function look “nearly right” while never converging. If many independent functions differ in similar instruction-selection or scheduling patterns, stop source tweaking and validate the toolchain first.

## Hash-only trap

A whole-file hash gives a binary yes/no result. It cannot tell whether the mismatch is one timestamp bit or thousands of instructions. Use hash equality as the gate and byte/section/function diffs as the steering signal.
