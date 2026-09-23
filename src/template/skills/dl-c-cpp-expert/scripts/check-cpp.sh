#!/usr/bin/env bash
set -euo pipefail

# Lightweight helper for repositories that already expose compile_commands.json.
# It intentionally does not modify the project or install dependencies.

if command -v clang-tidy >/dev/null 2>&1 && [[ -f compile_commands.json ]]; then
  mapfile -t files < <(find . -type f \( -name '*.c' -o -name '*.cc' -o -name '*.cpp' -o -name '*.cxx' \) -not -path './build/*' | sort)
  if ((${#files[@]})); then
    printf 'Running clang-tidy on %d source file(s)...\n' "${#files[@]}"
    clang-tidy -p . "${files[@]}"
  else
    echo 'No C/C++ source files found.'
  fi
else
  echo 'clang-tidy and/or compile_commands.json not available; skipping static analysis.'
fi
