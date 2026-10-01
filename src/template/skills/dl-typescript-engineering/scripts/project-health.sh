#!/usr/bin/env sh
set -eu

# Provider-neutral helper for TypeScript repositories.
# It does not install packages or change dependencies. It only runs scripts already
# declared by the project and an optional package-manager audit command.

ROOT="${1:-.}"
cd "$ROOT"

if [ ! -f package.json ]; then
  echo "error: package.json not found in $ROOT" >&2
  exit 2
fi

if [ -f pnpm-lock.yaml ]; then
  PM="pnpm"
elif [ -f yarn.lock ]; then
  PM="yarn"
elif [ -f bun.lockb ] || [ -f bun.lock ]; then
  PM="bun"
elif [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then
  PM="npm"
else
  PM="npm"
fi

echo "package-manager: $PM"

has_script() {
  node -e 'const p=require("./package.json"); process.exit(p.scripts && Object.prototype.hasOwnProperty.call(p.scripts, process.argv[1]) ? 0 : 1)' "$1"
}

run_script() {
  name="$1"
  if has_script "$name"; then
    echo "\n==> $name"
    case "$PM" in
      pnpm) pnpm run "$name" ;;
      yarn) yarn run "$name" ;;
      bun) bun run "$name" ;;
      npm) npm run "$name" ;;
    esac
  fi
}

# Common non-mutating project checks, only when defined by the repository.
run_script typecheck
run_script check:types
run_script lint
run_script test
run_script build

if [ "${TS_SKILL_AUDIT:-0}" = "1" ]; then
  echo "\n==> dependency audit"
  case "$PM" in
    pnpm) pnpm audit || true ;;
    yarn) yarn audit || true ;;
    bun) bun audit || true ;;
    npm) npm audit --omit=dev || true ;;
  esac
fi
