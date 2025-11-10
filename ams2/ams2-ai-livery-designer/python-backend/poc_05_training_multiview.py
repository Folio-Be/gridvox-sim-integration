"""POC Experiment 5: Multi-View Visibility-Aware Training
=========================================================
Cycle-consistency training that leverages paired showroom views of the same
UV texture. We estimate a coarse visibility mask per view so that cycle losses
focus on pixels that actually belong to the car body.
"""

from __future__ import annotations

import argparse
import json
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as T
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm

try:
    from pytorch_msssim import ssim as ms_ssim
except ImportError:  # pragma: no cover
    ms_ssim = None

try:
    import lpips
except ImportError:  # pragma: no cover
    lpips = None


# ---------------------------------------------------------------------------
# Utility functions
# ---------------------------------------------------------------------------


def to_tensor(image: Image.Image, size: int) -> torch.Tensor:
    transform = T.Compose(
        [
            T.Resize((size, size), interpolation=T.InterpolationMode.BICUBIC),
            T.ToTensor(),
            T.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
        ]
    )
    return transform(image)


def compute_visibility_mask(image: Image.Image, size: int) -> torch.Tensor:
    """Segment car body from showroom background using HSV heuristics."""

    array = np.array(image.resize((size, size), Image.BICUBIC))
    hsv = cv2.cvtColor(array, cv2.COLOR_RGB2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]

    # High saturation or darker value tends to belong to the car body
    mask = ((s > 32) | (v < 200)).astype(np.uint8)

    # Remove tiny speckles and fill holes
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    mask = mask.astype(np.float32)
    mask /= mask.max() + 1e-6
    mask = torch.from_numpy(mask).unsqueeze(0)  # 1 x H x W
    return mask


def masked_l1(pred: torch.Tensor, target: torch.Tensor, mask: Optional[torch.Tensor]) -> torch.Tensor:
    diff = torch.abs(pred - target)
    if mask is not None:
        diff = diff * mask
        denom = mask.sum() * pred.shape[1]
        return diff.sum() / (denom + 1e-6)
    return diff.mean()


def compute_ssim(img1: torch.Tensor, img2: torch.Tensor) -> float:
    if ms_ssim is None:
        return float("nan")
    return float(ms_ssim(img1, img2, data_range=2, size_average=True).item())


def compute_lpips(img1: torch.Tensor, img2: torch.Tensor, net) -> float:
    if net is None:
        return float("nan")
    return float(net(img1, img2).mean().item())


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------


@dataclass
class AugRecord:
    uv_path: Path
    view_path: Path
    source_uv: Path


class MultiViewDataset(Dataset):
    """Yield paired augmented views sharing the same underlying UV texture."""

    def __init__(self, metadata_path: Path, image_size: int = 256, seed: int = 1337):
        if metadata_path.is_dir():
            metadata_path = metadata_path / "metadata.json"
        with metadata_path.open("r", encoding="utf-8") as f:
            records: List[Dict] = json.load(f)

        grouped: Dict[str, List[AugRecord]] = {}
        for rec in records:
            key = rec["source_uv"]
            grouped.setdefault(key, []).append(
                AugRecord(Path(rec["uv_aug"]), Path(rec["view_aug"]), Path(rec["source_uv"]))
            )

        # Flatten into sample indices but keep grouping info for pairing
        self.groups: List[Tuple[str, List[AugRecord]]] = sorted(grouped.items())
        self.image_size = image_size
        self.rng = random.Random(seed)

    def __len__(self) -> int:
        return sum(len(group[1]) for group in self.groups)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        # Locate group and local index
        cumulative = 0
        for _, records in self.groups:
            if idx < cumulative + len(records):
                primary = records[idx - cumulative]
                if len(records) > 1:
                    partner = primary
                    # Reselect until we pick a different augmented view when possible.
                    while partner is primary:
                        partner = self.rng.choice(records)
                else:
                    partner = primary
                return self._build_sample(primary, partner)
            cumulative += len(records)

        # Fallback (shouldn't happen)
        key, records = self.groups[-1]
        primary = records[idx % len(records)]
        if len(records) > 1:
            partner = primary
            while partner is primary:
                partner = self.rng.choice(records)
        else:
            partner = primary
        return self._build_sample(primary, partner)

    def _build_sample(self, primary: AugRecord, partner: AugRecord) -> Dict[str, torch.Tensor]:
        size = self.image_size

        uv_gt = Image.open(primary.source_uv).convert("RGB")
        view_primary = Image.open(primary.view_path).convert("RGB")
        view_partner = Image.open(partner.view_path).convert("RGB")

        data = {
            "uv_gt": to_tensor(uv_gt, size),
            "view_a": to_tensor(view_primary, size),
            "view_b": to_tensor(view_partner, size),
            "mask_a": compute_visibility_mask(view_primary, size),
            "mask_b": compute_visibility_mask(view_partner, size),
        }
        return data


# ---------------------------------------------------------------------------
# Models (reuse from previous POCs)
# ---------------------------------------------------------------------------


class UVPredictor(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc1 = nn.Sequential(nn.Conv2d(3, 64, 4, 2, 1), nn.ReLU())
        self.enc2 = nn.Sequential(nn.Conv2d(64, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU())
        self.enc3 = nn.Sequential(nn.Conv2d(128, 256, 4, 2, 1), nn.BatchNorm2d(256), nn.ReLU())
        self.enc4 = nn.Sequential(nn.Conv2d(256, 512, 4, 2, 1), nn.BatchNorm2d(512), nn.ReLU())

        self.dec1 = nn.Sequential(nn.ConvTranspose2d(512, 256, 4, 2, 1), nn.BatchNorm2d(256), nn.ReLU())
        self.dec2 = nn.Sequential(nn.ConvTranspose2d(512, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU())
        self.dec3 = nn.Sequential(nn.ConvTranspose2d(256, 64, 4, 2, 1), nn.BatchNorm2d(64), nn.ReLU())
        self.dec4 = nn.Sequential(nn.ConvTranspose2d(128, 3, 4, 2, 1), nn.Tanh())

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        e1 = self.enc1(x)
        e2 = self.enc2(e1)
        e3 = self.enc3(e2)
        e4 = self.enc4(e3)

        d1 = self.dec1(e4)
        d1 = torch.cat([d1, e3], dim=1)
        d2 = self.dec2(d1)
        d2 = torch.cat([d2, e2], dim=1)
        d3 = self.dec3(d2)
        d3 = torch.cat([d3, e1], dim=1)
        d4 = self.dec4(d3)
        return d4


class Renderer(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(3, 64, 7, 1, 3),
            nn.ReLU(),
            nn.Conv2d(64, 64, 5, 1, 2),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, 1, 1),
            nn.ReLU(),
            nn.Conv2d(128, 128, 3, 1, 1),
            nn.ReLU(),
            nn.Conv2d(128, 64, 3, 1, 1),
            nn.ReLU(),
            nn.Conv2d(64, 3, 3, 1, 1),
            nn.Tanh(),
        )

    def forward(self, uv: torch.Tensor) -> torch.Tensor:
        return self.net(uv)


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------


def train_epoch(loader, model_uv, model_renderer, optim_uv, optim_renderer, device, weights):
    model_uv.train()
    model_renderer.train()

    totals = {"cycle": 0.0, "uv_recon": 0.0, "direct": 0.0, "cross": 0.0, "total": 0.0}

    for batch in tqdm(loader, desc="Train", leave=False):
        uv_gt = batch["uv_gt"].to(device)
        view_a = batch["view_a"].to(device)
        view_b = batch["view_b"].to(device)
        mask_a = batch["mask_a"].to(device)
        mask_b = batch["mask_b"].to(device)

        uv_pred_a = model_uv(view_a)
        uv_pred_b = model_uv(view_b)

        view_recon_a = model_renderer(uv_pred_a)
        view_recon_b = model_renderer(uv_pred_b)

        view_from_uv = model_renderer(uv_gt)
        uv_recon = model_uv(view_from_uv)

        L_cycle = masked_l1(view_recon_a, view_a, mask_a) + masked_l1(view_recon_b, view_b, mask_b)
        L_cycle /= 2.0

        L_uv_recon = masked_l1(uv_recon, uv_gt, None)

        L_direct = (masked_l1(uv_pred_a, uv_gt, None) + masked_l1(uv_pred_b, uv_gt, None)) / 2.0

        L_cross = masked_l1(uv_pred_a, uv_pred_b, None)

        loss = (
            weights["cycle"] * L_cycle
            + weights["uv_recon"] * L_uv_recon
            + weights["direct"] * L_direct
            + weights["cross"] * L_cross
        )

        optim_uv.zero_grad()
        optim_renderer.zero_grad()
        loss.backward()
        optim_uv.step()
        optim_renderer.step()

        totals["cycle"] += float(L_cycle.item())
        totals["uv_recon"] += float(L_uv_recon.item())
        totals["direct"] += float(L_direct.item())
        totals["cross"] += float(L_cross.item())
        totals["total"] += float(loss.item())

    for key in totals:
        totals[key] /= len(loader)
    return totals


@torch.no_grad()
def evaluate(loader, model_uv, model_renderer, device, lpips_net=None, weights=None):
    model_uv.eval()
    model_renderer.eval()

    totals = {
        "cycle": 0.0,
        "uv_recon": 0.0,
        "direct": 0.0,
        "cross": 0.0,
        "ssim_view": 0.0,
        "ssim_uv": 0.0,
        "lpips_view": 0.0,
    }
    count = 0

    for batch in tqdm(loader, desc="Eval", leave=False):
        uv_gt = batch["uv_gt"].to(device)
        view_a = batch["view_a"].to(device)
        view_b = batch["view_b"].to(device)
        mask_a = batch["mask_a"].to(device)
        mask_b = batch["mask_b"].to(device)

        uv_pred_a = model_uv(view_a)
        uv_pred_b = model_uv(view_b)

        view_recon_a = model_renderer(uv_pred_a)
        view_recon_b = model_renderer(uv_pred_b)

        view_from_uv = model_renderer(uv_gt)
        uv_recon = model_uv(view_from_uv)

        L_cycle = masked_l1(view_recon_a, view_a, mask_a) + masked_l1(view_recon_b, view_b, mask_b)
        L_cycle /= 2.0

        L_uv_recon = masked_l1(uv_recon, uv_gt, None)
        L_direct = (masked_l1(uv_pred_a, uv_gt, None) + masked_l1(uv_pred_b, uv_gt, None)) / 2.0
        L_cross = masked_l1(uv_pred_a, uv_pred_b, None)

        totals["cycle"] += float(L_cycle.item())
        totals["uv_recon"] += float(L_uv_recon.item())
        totals["direct"] += float(L_direct.item())
        totals["cross"] += float(L_cross.item())

        totals["ssim_view"] += (compute_ssim(view_recon_a, view_a) + compute_ssim(view_recon_b, view_b)) / 2.0
        totals["ssim_uv"] += compute_ssim(uv_pred_a, uv_gt)
        totals["lpips_view"] += (
            compute_lpips(view_recon_a, view_a, lpips_net) + compute_lpips(view_recon_b, view_b, lpips_net)
        ) / 2.0

        count += 1

    for key in totals:
        totals[key] /= count

    if weights is not None:
        totals["total"] = (
            weights["cycle"] * totals["cycle"]
            + weights["uv_recon"] * totals["uv_recon"]
            + weights["direct"] * totals["direct"]
            + weights["cross"] * totals["cross"]
        )
    else:
        totals["total"] = float("nan")
    return totals


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Multi-view cycle consistency training")
    parser.add_argument("--dataset", type=Path, default=Path("poc_results/augmented_dataset_ginetta"))
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch-size", type=int, default=6)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--image-size", type=int, default=256)
    parser.add_argument("--val-split", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=1337)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--w-cycle", type=float, default=0.30)
    parser.add_argument("--w-uv", type=float, default=0.25)
    parser.add_argument("--w-direct", type=float, default=0.30)
    parser.add_argument("--w-cross", type=float, default=0.15)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    torch.manual_seed(args.seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    dataset = MultiViewDataset(args.dataset, image_size=args.image_size, seed=args.seed)
    val_size = max(1, int(len(dataset) * args.val_split))
    train_size = len(dataset) - val_size
    train_set, val_set = torch.utils.data.random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(
        train_set,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        drop_last=False,
    )
    val_loader = DataLoader(
        val_set,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        drop_last=False,
    )

    model_uv = UVPredictor().to(device)
    model_renderer = Renderer().to(device)

    optim_uv = torch.optim.Adam(model_uv.parameters(), lr=args.lr, betas=(0.5, 0.999))
    optim_renderer = torch.optim.Adam(model_renderer.parameters(), lr=args.lr, betas=(0.5, 0.999))

    lpips_net = lpips.LPIPS(net="alex").to(device) if lpips is not None else None

    best_val = float("inf")
    best_state = None

    weights = {
        "cycle": args.w_cycle,
        "uv_recon": args.w_uv,
        "direct": args.w_direct,
        "cross": args.w_cross,
    }

    for epoch in range(1, args.epochs + 1):
        metrics_train = train_epoch(train_loader, model_uv, model_renderer, optim_uv, optim_renderer, device, weights)
        metrics_val = evaluate(val_loader, model_uv, model_renderer, device, lpips_net, weights)

        val_score = metrics_val["total"]

        print(
            f"Epoch {epoch:03d}/{args.epochs} | "
            f"Train L_total: {metrics_train['total']:.4f} | "
            f"Val L_total: {val_score:.4f} | "
            f"Val SSIM(View): {metrics_val['ssim_view']:.3f} | "
            f"Val SSIM(UV): {metrics_val['ssim_uv']:.3f} | "
            f"Val LPIPS(View): {metrics_val['lpips_view']:.3f}"
        )

        if val_score < best_val:
            best_val = val_score
            best_state = {
                "uv": model_uv.state_dict(),
                "renderer": model_renderer.state_dict(),
                "metrics": metrics_val,
            }

    if best_state is not None:
        output_dir = Path("poc_results")
        output_dir.mkdir(exist_ok=True)
        torch.save(best_state, output_dir / "poc_05_best_model.pt")
        print(f"Saved best checkpoint to {output_dir / 'poc_05_best_model.pt'}")
        print(f"Best Val Metrics: {best_state['metrics']}")


if __name__ == "__main__":
    main()
