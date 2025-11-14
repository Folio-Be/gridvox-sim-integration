#!/usr/bin/env python3
import argparse
import glob
import json
import os
from pathlib import Path


def load_metadata(png_path: Path):
    meta_file = png_path.with_suffix(png_path.suffix + ".json")
    if meta_file.exists():
        with open(meta_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def make_task(image_path: Path, metadata):
    data = {
        "image": image_path.as_posix(),
    }
    if metadata:
        data.update({k: v for k, v in metadata.items() if k not in {"framePath"}})
    task = {
        "data": data,
        "predictions": [
            {
                "result": [],
                "score": 0.0,
                "model_version": "placeholder",
            }
        ],
    }
    return task


def main():
    parser = argparse.ArgumentParser(description="Batch pre-annotate captures")
    parser.add_argument("--input", required=True, help="Directory with PNG frames")
    parser.add_argument("--output", required=True, help="Directory to store JSON predictions")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    frames = sorted(glob.glob(str(input_dir / "*.png")))
    for frame in frames:
        frame_path = Path(frame)
        metadata = load_metadata(frame_path)
        task = make_task(frame_path.resolve(), metadata)
        output_file = output_dir / f"{frame_path.stem}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(task, f, indent=2)
    print(f"Generated {len(frames)} pre-annotation files in {output_dir}")


if __name__ == "__main__":
    main()
