#!/usr/bin/env python3
"""Best-effort checker for the dl-tabler-ui CDN policy.

Usage:
    python scripts/check_cdn_policy.py [project_root]

This intentionally reports suspicious patterns instead of rewriting files.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()

TEXT_EXTENSIONS = {
    ".html", ".htm", ".erb", ".haml", ".slim", ".php", ".twig", ".njk",
    ".ejs", ".jinja", ".jinja2", ".cshtml", ".js", ".mjs", ".cjs", ".ts",
    ".tsx", ".jsx", ".css", ".scss", ".sass", ".md", ".json", ".yml", ".yaml",
}

SKIP_PARTS = {
    ".git", "node_modules", "vendor", "tmp", "log", "coverage", "dist", "build",
    ".next", ".nuxt", ".cache",
}

RULES = [
    (
        "Tabler instalado/importado via package manager",
        re.compile(r"(?:npm|yarn|pnpm|bun)\s+(?:install|add)\s+[^\n]*@tabler/(?:core|icons)", re.I),
    ),
    (
        "Import de @tabler/core no bundle",
        re.compile(r"(?:import|require\s*\()[^\n]*@tabler/core", re.I),
    ),
    (
        "Referência a node_modules de Tabler",
        re.compile(r"node_modules[/\\]@tabler[/\\]", re.I),
    ),
    (
        "Possível asset local do Tabler core",
        re.compile(r"(?:src|href)\s*=\s*[\"'][^\"']*(?:tabler(?:\.min)?\.(?:css|js))", re.I),
    ),
]

CDN_OK = re.compile(r"https?://[^\s\"']+/(?:@tabler|npm/@tabler)/", re.I)


def iter_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if any(part in SKIP_PARTS for part in path.parts):
            continue
        yield path


def main() -> int:
    findings: list[tuple[Path, int, str, str]] = []

    for path in iter_files(ROOT):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        for lineno, line in enumerate(text.splitlines(), 1):
            for label, pattern in RULES:
                if pattern.search(line):
                    if label == "Possível asset local do Tabler core" and CDN_OK.search(line):
                        continue
                    findings.append((path, lineno, label, line.strip()))

    if not findings:
        print("OK: nenhum padrão óbvio contra a política CDN foi encontrado.")
        return 0

    print("Possíveis violações da política CDN:\n")
    for path, lineno, label, line in findings:
        try:
            rel = path.relative_to(ROOT)
        except ValueError:
            rel = path
        print(f"- {rel}:{lineno}: {label}")
        print(f"  {line[:220]}")

    print("\nRevise manualmente os achados; este script é heurístico.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
