"""POC Experiment 3: Data Augmentation Pipeline
=============================================
Convert the limited Ginetta GT4 livery examples into a large training set.
This script synthesises multiple camera viewpoints, lighting variations,
and texture perturbations for both UV textures and 3D views.

Usage
-----
python poc_03_augmentation.py \
    --examples-dir "../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN" \
    --output-dir poc_results/augmented_dataset \
    --augmentations-per-pair 64
"""

from __future__ import annotations

import argparse
import json
import math
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import numpy as np
from PIL import Image, ImageEnhance
from tqdm import tqdm

# NOTE: Stick to PIL/Numpy so the script runs inside the lightweight POC env.


@dataclass
class LiveryPair:
    """Represents a UV texture and associated 3D showroom/preview image."""

    uv_path: Path
    view_path: Path


def list_livery_pairs(examples_dir: Path) -> List[LiveryPair]:
    """Collect UV ↔ view pairs from the provided directory."""

    pairs: List[LiveryPair] = []

    # Preferred multi-view screenshots
    body2 = examples_dir / "body2.png"
    showroom_a = examples_dir / "showroom 2a.JPG"
    showroom_b = examples_dir / "showroom 2b.JPG"

    if body2.exists() and showroom_a.exists():
        pairs.append(LiveryPair(body2, showroom_a))
    if body2.exists() and showroom_b.exists():
        pairs.append(LiveryPair(body2, showroom_b))

    # Fallback to preview renders for other liveries
    for idx in range(1, 6):
        body_path = examples_dir / f"body{idx}.png"
        preview_path = examples_dir / f"preview{idx}.png"
        if body_path.exists() and preview_path.exists():
            pairs.append(LiveryPair(body_path, preview_path))

    if not pairs:
        raise FileNotFoundError(
            f"No UV/view pairs located in {examples_dir}. Please verify the path."
        )

    return pairs


# ---------------------------------------------------------------------------
# Image augmentation helpers
# ---------------------------------------------------------------------------


def _to_numpy(image: Image.Image) -> np.ndarray:
    return np.asarray(image).astype(np.float32) / 255.0


def _from_numpy(array: np.ndarray) -> Image.Image:
    array = np.clip(array * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(array)


def random_hsv_jitter(image: Image.Image, rng: random.Random) -> Image.Image:
    """Randomly perturb hue, saturation, and value using PIL enhancers."""

    # Hue shift by converting to numpy HSV
    hsv = np.array(image.convert("HSV"), dtype=np.uint8)
    hue_shift = rng.randint(-10, 10)
    if hue_shift:
        hsv[..., 0] = (hsv[..., 0].astype(int) + hue_shift) % 256

    sat_enhancer = ImageEnhance.Color(Image.fromarray(hsv, mode="HSV"))
    sat_factor = rng.uniform(0.85, 1.15)
    hsv_img = sat_enhancer.enhance(sat_factor)

    brightness_enhancer = ImageEnhance.Brightness(hsv_img)
    bright_factor = rng.uniform(0.85, 1.15)
    hsv_img = brightness_enhancer.enhance(bright_factor)

    contrast_enhancer = ImageEnhance.Contrast(hsv_img)
    contrast_factor = rng.uniform(0.85, 1.15)
    hsv_img = contrast_enhancer.enhance(contrast_factor)

    return hsv_img.convert("RGB")


def random_affine(image: Image.Image, rng: random.Random) -> Image.Image:
    """Apply a mild affine transform (rotation + shear + translate)."""

    w, h = image.size
    max_rotate = 5.0  # degrees
    max_shear = 0.05  # ratio
    max_translate = 0.05  # fraction of image size

    angle = rng.uniform(-max_rotate, max_rotate)
    shear_x = rng.uniform(-max_shear, max_shear)
    shear_y = rng.uniform(-max_shear, max_shear)
    translate_x = rng.uniform(-max_translate, max_translate) * w
    translate_y = rng.uniform(-max_translate, max_translate) * h

    return image.transform(
        (w, h),
        Image.AFFINE,
        (
            math.cos(math.radians(angle)), -math.sin(math.radians(angle + shear_x)), translate_x,
            math.sin(math.radians(angle + shear_y)), math.cos(math.radians(angle)), translate_y,
        ),
        resample=Image.BICUBIC,
        fillcolor=(0, 0, 0),
    )


def random_perspective(image: Image.Image, rng: random.Random) -> Image.Image:
    """Apply subtle perspective warp to mimic viewpoint changes."""

    w, h = image.size
    margin = 0.08  # 8% inset/outset
    src_pts = [
        (0, 0),
        (w, 0),
        (w, h),
        (0, h),
    ]
    dst_pts = []
    for x, y in src_pts:
        offset_x = rng.uniform(-margin, margin) * w
        offset_y = rng.uniform(-margin, margin) * h
        dst_pts.append((x + offset_x, y + offset_y))

    coeffs = _find_perspective_coeffs(src_pts, dst_pts)
    return image.transform((w, h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)


def gaussian_noise(image: Image.Image, rng: random.Random, sigma: float = 0.02) -> Image.Image:
    arr = _to_numpy(image)
    noise = rng.normalvariate(0.0, sigma)
    arr = arr + rng.normalvariate(0.0, sigma) * np.random.standard_normal(arr.shape)
    return _from_numpy(arr)


def blur_or_sharpen(image: Image.Image, rng: random.Random) -> Image.Image:
    choice = rng.choice(["blur", "sharpen", "none", "none"])  # bias to none
    if choice == "none":
        return image
    kernel = np.array(
        [[1, 2, 1], [2, 4, 2], [1, 2, 1]], dtype=np.float32
    ) if choice == "blur" else np.array(
        [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32
    )

    arr = _to_numpy(image)
    arr = _convolve(arr, kernel)
    return _from_numpy(arr)


def _convolve(arr: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    pad = kernel.shape[0] // 2
    kernel = kernel / kernel.sum() if kernel.sum() != 0 else kernel
    arr_padded = np.pad(arr, ((pad, pad), (pad, pad), (0, 0)), mode="reflect")
    out = np.zeros_like(arr)
    for y in range(arr.shape[0]):
        for x in range(arr.shape[1]):
            region = arr_padded[y : y + kernel.shape[0], x : x + kernel.shape[1]]
            out[y, x] = (region * kernel[..., None]).sum(axis=(0, 1))
    return np.clip(out, 0.0, 1.0)


def _find_perspective_coeffs(src_pts: Iterable[Tuple[float, float]], dst_pts: Iterable[Tuple[float, float]]):
    """Solve coefficients for PIL perspective transform."""

    matrix = []
    vector = []
    for (src_x, src_y), (dst_x, dst_y) in zip(src_pts, dst_pts):
        matrix.append([src_x, src_y, 1, 0, 0, 0, -dst_x * src_x, -dst_x * src_y])
        matrix.append([0, 0, 0, src_x, src_y, 1, -dst_y * src_x, -dst_y * src_y])
        vector.append(dst_x)
        vector.append(dst_y)

    matrix = np.asarray(matrix, dtype=np.float64)
    vector = np.asarray(vector, dtype=np.float64)
    coeffs = np.linalg.solve(matrix, vector)
    return coeffs.tolist()


# ---------------------------------------------------------------------------
# Augmentation pipeline
# ---------------------------------------------------------------------------


def augment_pair(pair: LiveryPair, output_dir: Path, idx: int, count: int, rng: random.Random,
                 target_size: int = 512) -> List[Dict]:
    """Generate augmented samples for a single UV/view pair."""

    uv_image = Image.open(pair.uv_path).convert("RGB").resize((target_size, target_size), Image.LANCZOS)
    view_image = Image.open(pair.view_path).convert("RGB").resize((target_size, target_size), Image.LANCZOS)

    metadata_records: List[Dict] = []

    for aug_idx in range(count):
        seed = rng.randint(0, 2**31 - 1)
        local_rng = random.Random(seed)

        uv_aug = uv_image.copy()
        view_aug = view_image.copy()

        transforms_applied = []

        if local_rng.random() < 0.9:
            uv_aug = random_hsv_jitter(uv_aug, local_rng)
            view_aug = random_hsv_jitter(view_aug, local_rng)
            transforms_applied.append("hsv_jitter")

        if local_rng.random() < 0.8:
            uv_aug = random_affine(uv_aug, local_rng)
            view_aug = random_affine(view_aug, local_rng)
            transforms_applied.append("affine")

        if local_rng.random() < 0.7:
            uv_aug = random_perspective(uv_aug, local_rng)
            view_aug = random_perspective(view_aug, local_rng)
            transforms_applied.append("perspective")

        if local_rng.random() < 0.3:
            uv_aug = blur_or_sharpen(uv_aug, local_rng)
            view_aug = blur_or_sharpen(view_aug, local_rng)
            transforms_applied.append("filter")

        if local_rng.random() < 0.4:
            uv_aug = gaussian_noise(uv_aug, local_rng)
            view_aug = gaussian_noise(view_aug, local_rng)
            transforms_applied.append("noise")

        uv_aug_path = output_dir / f"uv_pair{idx:02d}_{aug_idx:03d}.png"
        view_aug_path = output_dir / f"view_pair{idx:02d}_{aug_idx:03d}.png"

        uv_aug.save(uv_aug_path, format="PNG")
        view_aug.save(view_aug_path, format="PNG")

        metadata_records.append(
            {
                "source_uv": str(pair.uv_path.resolve()),
                "source_view": str(pair.view_path.resolve()),
                "uv_aug": str(uv_aug_path.resolve()),
                "view_aug": str(view_aug_path.resolve()),
                "seed": seed,
                "transforms": transforms_applied,
            }
        )

    return metadata_records


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate augmented UV/view sample pairs.")
    parser.add_argument(
        "--examples-dir",
        type=Path,
        default=Path("../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN"),
        help="Directory containing body*.png and showroom/preview images.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("poc_results/augmented_dataset"),
        help="Directory to store generated samples.",
    )
    parser.add_argument(
        "--augmentations-per-pair",
        type=int,
        default=64,
        help="Number of augmented samples to create per UV/view pair.",
    )
    parser.add_argument(
        "--target-size",
        type=int,
        default=512,
        help="Resize UV and view images to this square dimension before augmentation.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=1337,
        help="Base random seed for reproducibility.",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    rng = random.Random(args.seed)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    print("\n=============================================")
    print("POC EXPERIMENT 3: Data Augmentation Pipeline")
    print("=============================================")
    print(f"Examples directory : {args.examples_dir}")
    print(f"Output directory   : {args.output_dir}")
    print(f"Augmentations/pair : {args.augmentations_per_pair}")
    print(f"Target size        : {args.target_size}")
    print(f"Base seed          : {args.seed}\n")

    pairs = list_livery_pairs(args.examples_dir)
    print(f"Located {len(pairs)} source pairs. Generating augmented dataset...\n")

    metadata: List[Dict] = []
    for pair_idx, pair in enumerate(tqdm(pairs, desc="Pairs")):
        records = augment_pair(
            pair=pair,
            output_dir=args.output_dir,
            idx=pair_idx,
            count=args.augmentations_per_pair,
            rng=rng,
            target_size=args.target_size,
        )
        metadata.extend(records)

    metadata_path = args.output_dir / "metadata.json"
    with metadata_path.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\n---------------------------------------------")
    print("Augmentation complete!")
    print(f"Total augmented samples: {len(metadata)}")
    print(f"Metadata written to   : {metadata_path}")
    print("---------------------------------------------\n")


if __name__ == "__main__":
    main()
