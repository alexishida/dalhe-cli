# Validation Checklist

## Instruction semantics

- [ ] integer widths explicit
- [ ] signed/unsigned behavior explicit
- [ ] overflow/wrap behavior verified
- [ ] shifts tested at boundary counts
- [ ] multiply/divide edge cases tested
- [ ] special registers verified
- [ ] branch targets verified
- [ ] delay slots verified where applicable
- [ ] unaligned memory behavior tested
- [ ] endianness tested
- [ ] FPU rounding mode considered
- [ ] NaN behavior considered
- [ ] vector/SIMD saturation and lane ordering tested where applicable

## Function and CFG recovery

- [ ] every seed has provenance
- [ ] code/data overlap reviewed
- [ ] jump tables recognized or safely deferred
- [ ] indirect calls have fallback
- [ ] tail calls handled
- [ ] thunk/import stubs recognized
- [ ] false-positive heuristic functions can be rejected

## Relocations/modules

- [ ] relocation type semantics tested
- [ ] addends handled correctly
- [ ] module load address separated from link address
- [ ] overlay/module identity included in dispatch where needed
- [ ] version-specific addresses isolated

## Memory

- [ ] guest addresses distinct from host pointers
- [ ] RAM bounds behavior defined
- [ ] ROM behavior defined
- [ ] MMIO routed correctly
- [ ] scratchpad handled where applicable
- [ ] endian conversions centralized
- [ ] executable writes detected if relevant

## ABI

- [ ] argument registers documented
- [ ] result registers documented
- [ ] saved registers documented
- [ ] stack alignment documented
- [ ] floating arguments documented
- [ ] special TOC/GP/SDA behavior documented
- [ ] call bridges preserve guest state

## Runtime/HLE

- [ ] thread creation semantics verified
- [ ] synchronization ordering verified
- [ ] timer units verified
- [ ] input state timing verified
- [ ] DMA completion ordering verified
- [ ] interrupt behavior verified
- [ ] filesystem path assumptions verified
- [ ] audio buffer timing verified

## Differential validation

- [ ] instruction oracle exists
- [ ] block/function comparison exists
- [ ] first-divergence reporting exists
- [ ] deterministic replay exists for key failures
- [ ] regression tests cover fixed divergences

## Build/reproducibility

- [ ] generated files have stable order
- [ ] one command regenerates output
- [ ] generated files clearly marked
- [ ] source binary version/hash recorded
- [ ] build does not depend on undeclared local state
