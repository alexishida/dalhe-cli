# Tooling and Build Guide

## Toolchain discovery

Before changing flags or build files, inspect what the repository already uses:
- CMake/Meson/Bazel/Make/etc.
- GCC/Clang/MSVC/embedded compiler.
- C/C++ standard settings.
- CI matrix.
- warning policy.
- sanitizer/static-analysis jobs.

Do not impose a toolchain rewrite for a local coding task.

## Warnings

For GCC/Clang, useful development warnings often include:
- `-Wall`
- `-Wextra`
- `-Wpedantic`
- `-Wconversion`
- `-Wshadow`

Add them incrementally in established projects because older codebases may contain large warning backlogs.

For MSVC, `/W4` is a strong practical baseline; `/permissive-` may improve conformance where the codebase supports it.

## Sanitizers

Typical GCC/Clang debug validation:

Address + UB:
```sh
-fsanitize=address,undefined -fno-omit-frame-pointer
```

ThreadSanitizer (separate build):
```sh
-fsanitize=thread -fno-omit-frame-pointer
```

Do not combine incompatible sanitizers. Account for platform/toolchain limitations.

## Static analysis

Prefer project-integrated tooling. Common choices include clang-tidy, clang static analyzer, compiler diagnostics, and platform-specific analyzers.

Treat analyzer output as evidence to investigate, not automatic proof.

## CMake principles

- Prefer target-based commands (`target_compile_features`, `target_compile_options`, `target_link_libraries`).
- Keep usage requirements scoped `PRIVATE`, `PUBLIC`, or `INTERFACE` correctly.
- Avoid global compiler flags when a target-specific setting is sufficient.
- Express standard requirements through compile features where practical.
- Keep warnings separate from hard platform requirements.
- Use generator expressions when configuration/compiler-specific behavior is needed, but keep them readable.

## Release optimization

Benchmark the actual deployment mode. Evaluate `-O2`/`-O3`, LTO, PGO, ISA targeting, and linker options based on the product's distribution constraints.

Never enable unsafe floating-point transformations silently.
