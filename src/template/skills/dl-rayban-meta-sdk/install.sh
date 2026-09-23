#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-all}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$ROOT/plugins/rayban-meta-sdk"

install_claude() {
  if ! command -v claude >/dev/null 2>&1; then
    echo "Claude CLI não encontrado; pulando." >&2
    return 0
  fi
  claude plugin install "$PLUGIN_DIR"
  echo "Ray-Ban Meta SDK instalado no Claude Code."
}

install_codex() {
  if ! command -v codex >/dev/null 2>&1; then
    echo "Codex CLI não encontrado; pulando." >&2
    return 0
  fi
  codex plugin install "$PLUGIN_DIR"
  echo "Ray-Ban Meta SDK instalado no Codex."
}

case "$MODE" in
  claude) install_claude ;;
  codex) install_codex ;;
  all) install_claude; install_codex ;;
  *)
    echo "Uso: $0 [claude|codex|all]" >&2
    exit 2
    ;;
esac
