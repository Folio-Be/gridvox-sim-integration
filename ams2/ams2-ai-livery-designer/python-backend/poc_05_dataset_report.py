"""Utility script to summarize multi-view augmentation coverage."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Dict, List


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize augmentation coverage per source UV")
    parser.add_argument("--dataset", type=Path, default=Path("poc_results/augmented_dataset_ginetta"))
    parser.add_argument("--top-missing", type=int, default=10, help="Number of lowest-coverage UVs to print")
    parser.add_argument("--output", type=Path, default=Path("poc_results/poc_05_dataset_report.json"))
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    metadata_path = args.dataset / "metadata.json" if args.dataset.is_dir() else args.dataset
    with metadata_path.open("r", encoding="utf-8") as f:
        records: List[Dict] = json.load(f)

    counts = Counter(rec["source_uv"] for rec in records)
    total_uv = len(counts)
    total_samples = sum(counts.values())
    min_count = min(counts.values()) if counts else 0
    max_count = max(counts.values()) if counts else 0
    avg_count = total_samples / total_uv if total_uv else 0.0

    singletons = {uv for uv, cnt in counts.items() if cnt == 1}
    few_samples = sorted(counts.items(), key=lambda kv: kv[1])[: args.top_missing]

    report = {
        "dataset": str(args.dataset),
        "unique_uv_textures": total_uv,
        "total_augmented_pairs": total_samples,
        "min_pairs_per_uv": min_count,
        "max_pairs_per_uv": max_count,
        "avg_pairs_per_uv": round(avg_count, 2),
        "num_singleton_uvs": len(singletons),
        "singleton_examples": sorted(list(singletons))[: args.top_missing],
        "lowest_coverage": [{"source_uv": uv, "pairs": cnt} for uv, cnt in few_samples],
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
