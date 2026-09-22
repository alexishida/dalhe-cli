#!/usr/bin/env python3
"""Raw byte comparison with compact mismatch ranges for matching builds."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import BinaryIO


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def flush_range(ranges: list[dict[str, int]], start: int | None, end: int | None, max_ranges: int) -> None:
    if start is not None and end is not None and len(ranges) < max_ranges:
        ranges.append({"start": start, "end_exclusive": end, "length": end - start})


def compare_streams(a: BinaryIO, b: BinaryIO, common_size: int, chunk_size: int, max_ranges: int) -> tuple[int, int | None, list[dict[str, int]]]:
    equal = 0
    first_mismatch: int | None = None
    ranges: list[dict[str, int]] = []
    mismatch_start: int | None = None
    pos = 0

    while pos < common_size:
        n = min(chunk_size, common_size - pos)
        ca = a.read(n)
        cb = b.read(n)
        if len(ca) != n or len(cb) != n:
            raise IOError("short read while comparing files")

        if ca == cb:
            equal += n
            if mismatch_start is not None:
                flush_range(ranges, mismatch_start, pos, max_ranges)
                mismatch_start = None
            pos += n
            continue

        for i, (ba, bb) in enumerate(zip(ca, cb)):
            absolute = pos + i
            if ba == bb:
                equal += 1
                if mismatch_start is not None:
                    flush_range(ranges, mismatch_start, absolute, max_ranges)
                    mismatch_start = None
            else:
                if first_mismatch is None:
                    first_mismatch = absolute
                if mismatch_start is None:
                    mismatch_start = absolute
        pos += n

    if mismatch_start is not None:
        flush_range(ranges, mismatch_start, common_size, max_ranges)

    return equal, first_mismatch, ranges


def compare(a_path: Path, b_path: Path, chunk_size: int, max_ranges: int) -> dict[str, object]:
    a_size = a_path.stat().st_size
    b_size = b_path.stat().st_size
    common = min(a_size, b_size)

    with a_path.open("rb") as a, b_path.open("rb") as b:
        equal_common, first_mismatch, ranges = compare_streams(a, b, common, chunk_size, max_ranges)

    if a_size != b_size and first_mismatch is None:
        first_mismatch = common

    total_span = max(a_size, b_size)
    equal_ratio = 1.0 if total_span == 0 else equal_common / total_span
    differing_common = common - equal_common
    extra_bytes = abs(a_size - b_size)

    return {
        "a": str(a_path),
        "b": str(b_path),
        "a_size": a_size,
        "b_size": b_size,
        "same_size": a_size == b_size,
        "a_sha256": sha256(a_path),
        "b_sha256": sha256(b_path),
        "hash_match": sha256(a_path) == sha256(b_path),
        "common_bytes": common,
        "equal_common_bytes": equal_common,
        "different_common_bytes": differing_common,
        "extra_bytes_due_to_size_difference": extra_bytes,
        "equal_ratio_over_larger_file": equal_ratio,
        "first_mismatch_offset": first_mismatch,
        "mismatch_ranges_shown": ranges,
        "mismatch_ranges_truncated": len(ranges) >= max_ranges,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare two binaries and summarize byte-level differences.")
    parser.add_argument("reference", type=Path)
    parser.add_argument("candidate", type=Path)
    parser.add_argument("--chunk-size", type=int, default=1024 * 1024)
    parser.add_argument("--max-ranges", type=int, default=20)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    for p in (args.reference, args.candidate):
        if not p.is_file():
            parser.error(f"not a file: {p}")
    if args.chunk_size <= 0:
        parser.error("--chunk-size must be positive")
    if args.max_ranges <= 0:
        parser.error("--max-ranges must be positive")

    result = compare(args.reference, args.candidate, args.chunk_size, args.max_ranges)

    if args.json:
        print(json.dumps(result, indent=2, sort_keys=True))
    else:
        print(f"reference: {result['a']}")
        print(f"candidate: {result['b']}")
        print(f"size: {result['a_size']} vs {result['b_size']}")
        print(f"sha256 match: {result['hash_match']}")
        print(f"equal bytes / larger file: {result['equal_ratio_over_larger_file']:.6%}")
        print(f"first mismatch offset: {result['first_mismatch_offset']}")
        print("mismatch ranges:")
        for r in result["mismatch_ranges_shown"]:
            print(f"  0x{r['start']:X}..0x{r['end_exclusive'] - 1:X} ({r['length']} bytes)")
        if result["extra_bytes_due_to_size_difference"]:
            print(f"extra bytes from size difference: {result['extra_bytes_due_to_size_difference']}")
        if result["mismatch_ranges_truncated"]:
            print("note: range list may be truncated")
    return 0 if result["hash_match"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
