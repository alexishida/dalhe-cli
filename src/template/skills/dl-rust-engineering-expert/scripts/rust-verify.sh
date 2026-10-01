#!/usr/bin/env bash
set -euo pipefail

# Conservative Rust verification helper.
# Usage:
#   scripts/rust-verify.sh [quick|standard] [cargo package name]
#
# This script does not use --all-features and does not install tools.
# It executes the project's Cargo build/test machinery; run only in repositories you trust.

MODE="${1:-quick}"
PACKAGE="${2:-}"

if ! command -v cargo >/dev/null 2>&1; then
  echo 'error: cargo not found in PATH' >&2
  exit 127
fi

pkg_args=()
if [[ -n "$PACKAGE" ]]; then
  pkg_args=(-p "$PACKAGE")
fi

run() {
  printf '\n+ '
  printf '%q ' "$@"
  printf '\n'
  "$@"
}

case "$MODE" in
  quick)
    if command -v rustfmt >/dev/null 2>&1; then
      run cargo fmt --check
    else
      echo 'note: rustfmt not found; skipping format check'
    fi
    run cargo check "${pkg_args[@]}"
    ;;
  standard)
    if command -v rustfmt >/dev/null 2>&1; then
      run cargo fmt --check
    else
      echo 'note: rustfmt not found; skipping format check'
    fi
    run cargo check "${pkg_args[@]}"
    if command -v cargo-clippy >/dev/null 2>&1 || rustup component list --installed 2>/dev/null | grep -q '^clippy'; then
      run cargo clippy "${pkg_args[@]}" --all-targets
    else
      echo 'note: clippy not found; skipping clippy'
    fi
    run cargo test "${pkg_args[@]}"
    ;;
  *)
    echo "usage: $0 [quick|standard] [cargo-package-name]" >&2
    exit 2
    ;;
esac
