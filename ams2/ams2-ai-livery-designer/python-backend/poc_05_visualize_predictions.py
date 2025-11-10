"""POC 5 Visualization: Inspect multi-view checkpoint predictions."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFont

from poc_05_training_multiview import MultiViewDataset, Renderer, UVPredictor


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Visualize POC 5 predictions.")
    parser.add_argument("--checkpoint", type=Path, default=Path("poc_results/poc_05_best_model.pt"))
    parser.add_argument("--dataset", type=Path, default=Path("poc_results/augmented_dataset_ginetta"))
    parser.add_argument("--output", type=Path, default=Path("poc_results/poc_05_visualizations"))
    parser.add_argument("--num-samples", type=int, default=8)
    parser.add_argument("--image-size", type=int, default=256)
    parser.add_argument("--seed", type=int, default=1337)
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu")
    return parser.parse_args()


def tensor_to_image(tensor: torch.Tensor) -> Image.Image:
    array = tensor.detach().cpu().numpy()
    array = (array * 0.5) + 0.5
    array = np.clip(array, 0.0, 1.0)
    array = np.transpose(array, (1, 2, 0))
    array = (array * 255.0).astype(np.uint8)
    return Image.fromarray(array)


def prepare_labeled_tile(image: Image.Image, label: str, size: int, label_height: int = 28) -> Image.Image:
    tile = Image.new("RGB", (size, size + label_height), color=(24, 24, 24))
    draw = ImageDraw.Draw(tile)
    draw.rectangle((0, 0, size, label_height), fill=(32, 32, 32))
    font = ImageFont.load_default()
    draw.text((6, (label_height - 10) // 2), label, fill=(230, 230, 230), font=font)
    tile.paste(image.resize((size, size), Image.BICUBIC), (0, label_height))
    return tile


def build_grid(images: List[Image.Image], labels: List[str], size: int) -> Image.Image:
    assert len(images) == len(labels)
    cols = 3
    rows = (len(images) + cols - 1) // cols
    label_height = 28
    canvas = Image.new("RGB", (cols * size, rows * (size + label_height)), color=(12, 12, 12))
    for idx, (img, label) in enumerate(zip(images, labels)):
        row = idx // cols
        col = idx % cols
        tile = prepare_labeled_tile(img, label, size, label_height)
        canvas.paste(tile, (col * size, row * (size + label_height)))
    return canvas


def main() -> None:
    args = parse_args()

    checkpoint = torch.load(args.checkpoint, map_location=args.device)

    model_uv = UVPredictor().to(args.device)
    model_renderer = Renderer().to(args.device)
    model_uv.load_state_dict(checkpoint["uv"])
    model_renderer.load_state_dict(checkpoint["renderer"])
    model_uv.eval()
    model_renderer.eval()

    dataset = MultiViewDataset(args.dataset, image_size=args.image_size, seed=args.seed)
    dataset.rng.seed(args.seed)

    args.output.mkdir(parents=True, exist_ok=True)

    labels = [
        "Input View",
        "Reproj (Pred)",
        "Reproj (GT)",
        "Pred UV",
        "GT UV",
        "Partner View",
    ]

    max_idx = min(args.num_samples, len(dataset))

    with torch.no_grad():
        for index in range(max_idx):
            sample = dataset[index]
            view_a = sample["view_a"].unsqueeze(0).to(args.device)
            uv_gt = sample["uv_gt"].unsqueeze(0).to(args.device)
            view_b = sample["view_b"]

            uv_pred = model_uv(view_a)
            view_pred = model_renderer(uv_pred)
            view_from_gt = model_renderer(uv_gt)

            images = [
                tensor_to_image(view_a.squeeze(0)),
                tensor_to_image(view_pred.squeeze(0)),
                tensor_to_image(view_from_gt.squeeze(0)),
                tensor_to_image(uv_pred.squeeze(0)),
                tensor_to_image(uv_gt.squeeze(0)),
                tensor_to_image(view_b),
            ]

            grid = build_grid(images, labels, args.image_size)
            output_path = args.output / f"sample_{index:03d}.png"
            grid.save(output_path)
            print(f"Saved visualization to {output_path}")


if __name__ == "__main__":
    main()
