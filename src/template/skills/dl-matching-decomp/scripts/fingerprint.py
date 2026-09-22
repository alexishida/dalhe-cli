#!/usr/bin/env python3
"""Portable binary fingerprint helper for dl-matching-decomp workflows."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

MAGICS = [
    (b"\x7fELF", "ELF"),
    (b"MZ", "PE/DOS-stub (inspect PE header for confirmation)"),
    (b"\xfe\xed\xfa\xce", "Mach-O 32-bit big-endian"),
    (b"\xce\xfa\xed\xfe", "Mach-O 32-bit little-endian"),
    (b"\xfe\xed\xfa\xcf", "Mach-O 64-bit big-endian"),
    (b"\xcf\xfa\xed\xfe", "Mach-O 64-bit little-endian"),
    (b"\xca\xfe\xba\xbe", "Mach-O universal/fat or Java class family magic"),
    (b"PK\x03\x04", "ZIP/container"),
]


def digest(path: Path, name: str) -> str:
    h = hashlib.new(name)
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def detect_magic(head: bytes) -> str:
    for magic, label in MAGICS:
        if head.startswith(magic):
            return label
    return "unknown/raw"


def fingerprint(path: Path) -> dict[str, object]:
    with path.open("rb") as f:
        head = f.read(64)
    return {
        "path": str(path),
        "size": path.stat().st_size,
        "format_hint": detect_magic(head),
        "md5": digest(path, "md5"),
        "sha1": digest(path, "sha1"),
        "sha256": digest(path, "sha256"),
        "first_32_bytes_hex": head[:32].hex(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Print size, hashes, and a basic format hint for binaries.")
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--json", action="store_true", help="emit JSON")
    args = parser.parse_args()

    rows = []
    for p in args.paths:
        if not p.is_file():
            parser.error(f"not a file: {p}")
        rows.append(fingerprint(p))

    if args.json:
        print(json.dumps(rows, indent=2, sort_keys=True))
    else:
        for i, row in enumerate(rows):
            if i:
                print()
            for key, value in row.items():
                print(f"{key}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
