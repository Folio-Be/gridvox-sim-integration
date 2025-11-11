"""POC 05 inference helper.

Given a trained checkpoint and one or more input showroom images, predict UV
textures and reconstructed views so the results can be inspected or passed into
follow-on tooling (e.g., the livery editor pipeline).

Example usage:

    python poc_05_inference.py \
        --checkpoint poc_results/poc_05_directsteady_cosine.pt \
        --image path/to/car_view.png \
        --output-dir poc_results/poc_05_inference_run

The script writes a PNG pair per input consisting of the predicted UV texture
and the renderer's reprojection back into a view frame. Use multiple
``--image`` flags to process several pictures in one pass.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable, List

import torch
from PIL import Image

from poc_05_training_multiview import Renderer, UVPredictor, to_tensor
from poc_05_visualize_predictions import tensor_to_image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run UV predictor inference on arbitrary car photos")
    parser.add_argument("--checkpoint", type=Path, required=True, help="Trained checkpoint containing UV/render weights")
    parser.add_argument("--image", type=Path, action="append", required=True, help="Path to an input showroom/view image")
    parser.add_argument("--output-dir", type=Path, default=Path("poc_results/poc_05_inference"), help="Directory for predicted assets")
    parser.add_argument("--image-size", type=int, default=256, help="Resize edge for inputs/outputs")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Device to run inference on")
    return parser.parse_args()


def load_models(checkpoint_path: Path, device: torch.device) -> tuple[UVPredictor, Renderer]:
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    model_uv = UVPredictor().to(device)
    model_renderer = Renderer().to(device)
    model_uv.load_state_dict(checkpoint["uv"])
    model_renderer.load_state_dict(checkpoint["renderer"])
    model_uv.eval()
    model_renderer.eval()
    return model_uv, model_renderer


def run_inference(
    model_uv: UVPredictor,
    model_renderer: Renderer,
    image_paths: Iterable[Path],
    output_dir: Path,
    image_size: int,
    device: torch.device,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    for image_path in image_paths:
        if not image_path.exists():
            print(f"[warn] Skipping missing image: {image_path}")
            continue
        raw_image = Image.open(image_path).convert("RGB")
        tensor = to_tensor(raw_image, image_size).unsqueeze(0).to(device)

        with torch.no_grad():
            uv_pred = model_uv(tensor)
            view_reproj = model_renderer(uv_pred)

        uv_image = tensor_to_image(uv_pred.squeeze(0))
        view_image = tensor_to_image(view_reproj.squeeze(0))

        stem = image_path.stem
        uv_path = output_dir / f"{stem}_uv.png"
        view_path = output_dir / f"{stem}_reproj.png"
        uv_image.save(uv_path)
        view_image.save(view_path)
        print(f"[info] Saved {uv_path} and {view_path}")


def main() -> None:
    args = parse_args()
    device = torch.device(args.device)
    model_uv, model_renderer = load_models(args.checkpoint, device)
    run_inference(model_uv, model_renderer, args.image, args.output_dir, args.image_size, device)


if __name__ == "__main__":
    main()
