#!/usr/bin/env bash
set -euo pipefail

# Read-only repository reconnaissance for Rust projects.
# It intentionally does not build, test, install dependencies, or execute project code.

ROOT="${1:-.}"
cd "$ROOT"

printf '== Rust project snapshot ==\n'
printf 'pwd: %s\n\n' "$PWD"

printf '%s\n' '-- repository instructions --'
for f in AGENTS.md CLAUDE.md README.md README CONTRIBUTING.md CONTRIBUTING rust-toolchain.toml rust-toolchain; do
  if [[ -f "$f" ]]; then
    printf '%s\n' "$f"
  fi
done
printf '\n'

printf '%s\n' '-- toolchain (if installed) --'
if command -v rustc >/dev/null 2>&1; then rustc --version; else echo 'rustc: not found'; fi
if command -v cargo >/dev/null 2>&1; then cargo --version; else echo 'cargo: not found'; fi
printf '\n'

printf '%s\n' '-- manifests --'
find . -name target -prune -o -name .git -prune -o -name Cargo.toml -print 2>/dev/null | sort | head -200
printf '\n'

if [[ -f Cargo.toml ]]; then
  printf '%s\n' '-- root Cargo.toml key lines --'
  grep -nE '^\s*(\[workspace\]|\[package\]|name\s*=|version\s*=|edition\s*=|rust-version\s*=|resolver\s*=|default\s*=|members\s*=|default-members\s*=)' Cargo.toml || true
  printf '\n'
fi

printf '%s\n' '-- source overview --'
find . \
  -path './.git' -prune -o \
  -path './target' -prune -o \
  -type f \( -name '*.rs' -o -name 'Cargo.toml' -o -name 'Cargo.lock' \) -print 2>/dev/null \
  | sort | head -300
