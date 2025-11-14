"""POC Experiment 4: Cycle-Consistency Training with Augmented Dataset
=======================================================================
Train the UV predictor + learned renderer on the augmented sample set
generated in POC_03. This script reports SSIM/LPIPS improvements so we
can validate that augmentation plus cycle consistency clears the 0.5-0.6
SSIM target.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as T
from tqdm import tqdm
from PIL import Image
from torch.utils.data import DataLoader, Dataset, random_split

try:
    from pytorch_msssim import ssim as ms_ssim
except ImportError:
    ms_ssim = None

try:
    import lpips
except ImportError:  # pragma: no cover - LPIPS optional for quick runs
    lpips = None


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------


@dataclass
class AugmentedSample:
    uv_path: Path
    view_path: Path


class AugmentedLiveryDataset(Dataset):
    """Loads augmented UV/view image pairs."""

    def __init__(self, metadata_path: Path, image_size: int = 256):
        metadata = metadata_path
        if metadata.is_dir():
            metadata = metadata / "metadata.json"
        self.metadata_path = metadata
        self.image_size = image_size

        with metadata.open("r", encoding="utf-8") as f:
            records: List[Dict] = json.load(f)

        self.samples = [
            AugmentedSample(Path(rec["uv_aug"]), Path(rec["view_aug"]))
            for rec in records
        ]

        self.transform = T.Compose(
            [
                T.Resize((image_size, image_size), interpolation=Image.BICUBIC),
                T.ToTensor(),
                T.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ]
        )

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        sample = self.samples[idx]
        uv = Image.open(sample.uv_path).convert("RGB")
        view = Image.open(sample.view_path).convert("RGB")
        return {"uv": self.transform(uv), "view": self.transform(view)}


# ---------------------------------------------------------------------------
# Models (reuse simple architectures from POC_02)
# ---------------------------------------------------------------------------


class UVPredictor(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc1 = nn.Sequential(nn.Conv2d(3, 64, 4, 2, 1), nn.ReLU())
        self.enc2 = nn.Sequential(nn.Conv2d(64, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU())
        self.enc3 = nn.Sequential(nn.Conv2d(128, 256, 4, 2, 1), nn.BatchNorm2d(256), nn.ReLU())
        self.enc4 = nn.Sequential(nn.Conv2d(256, 512, 4, 2, 1), nn.BatchNorm2d(512), nn.ReLU())

        self.dec1 = nn.Sequential(nn.ConvTranspose2d(512, 256, 4, 2, 1), nn.BatchNorm2d(256), nn.ReLU())
        self.dec2 = nn.Sequential(nn.ConvTranspose2d(256 + 256, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU())
        self.dec3 = nn.Sequential(nn.ConvTranspose2d(128 + 128, 64, 4, 2, 1), nn.BatchNorm2d(64), nn.ReLU())
        self.dec4 = nn.Sequential(nn.ConvTranspose2d(64 + 64, 3, 4, 2, 1), nn.Tanh())

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
# Training utilities
# ---------------------------------------------------------------------------


def compute_ssim(img1: torch.Tensor, img2: torch.Tensor) -> float:
    if ms_ssim is None:
        return float("nan")
    return float(ms_ssim(img1, img2, data_range=2, size_average=True).item())


def compute_lpips(img1: torch.Tensor, img2: torch.Tensor, net) -> float:
    if net is None:
        return float("nan")
    return float(net(img1, img2).mean().item())


def train_epoch(model_uv: UVPredictor, model_renderer: Renderer, loader: DataLoader,
                optim_uv: torch.optim.Optimizer, optim_renderer: torch.optim.Optimizer,
                device: torch.device) -> Dict[str, float]:
    model_uv.train()
    model_renderer.train()

    epoch_loss = {"cycle": 0.0, "uv_recon": 0.0, "direct": 0.0, "total": 0.0}

    for batch in tqdm(loader, desc="Train", leave=False):
        uv_real = batch["uv"].to(device)
        view_real = batch["view"].to(device)

        uv_pred = model_uv(view_real)
        view_recon = model_renderer(uv_pred)
        L_cycle = F.l1_loss(view_recon, view_real)

        view_from_uv = model_renderer(uv_real)
        uv_recon = model_uv(view_from_uv)
        L_uv_recon = F.l1_loss(uv_recon, uv_real)

        L_direct = F.l1_loss(uv_pred, uv_real)

        loss = 0.3 * L_cycle + 0.3 * L_uv_recon + 0.4 * L_direct

        optim_uv.zero_grad()
        optim_renderer.zero_grad()
        loss.backward()
        optim_uv.step()
        optim_renderer.step()

        epoch_loss["cycle"] += L_cycle.item()
        epoch_loss["uv_recon"] += L_uv_recon.item()
        epoch_loss["direct"] += L_direct.item()
        epoch_loss["total"] += loss.item()

    for key in epoch_loss:
        epoch_loss[key] /= len(loader)
    return epoch_loss


@torch.no_grad()
def evaluate(model_uv: UVPredictor, model_renderer: Renderer, loader: DataLoader,
             device: torch.device, lpips_net=None) -> Dict[str, float]:
    model_uv.eval()
    model_renderer.eval()

    totals = {"cycle": 0.0, "uv_recon": 0.0, "direct": 0.0, "ssim_view": 0.0, "ssim_uv": 0.0, "lpips_view": 0.0}
    count = 0

    for batch in tqdm(loader, desc="Eval", leave=False):
        uv_real = batch["uv"].to(device)
        view_real = batch["view"].to(device)

        uv_pred = model_uv(view_real)
        view_recon = model_renderer(uv_pred)
        view_from_uv = model_renderer(uv_real)
        uv_recon = model_uv(view_from_uv)

        totals["cycle"] += F.l1_loss(view_recon, view_real).item()
        totals["uv_recon"] += F.l1_loss(uv_recon, uv_real).item()
        totals["direct"] += F.l1_loss(uv_pred, uv_real).item()

        totals["ssim_view"] += compute_ssim(view_recon, view_real)
        totals["ssim_uv"] += compute_ssim(uv_pred, uv_real)
        totals["lpips_view"] += compute_lpips(view_recon, view_real, lpips_net)

        count += 1

    return {key: val / count for key, val in totals.items()}


# ---------------------------------------------------------------------------
# Main entry
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Cycle-consistency training on augmented dataset")
    parser.add_argument("--dataset", type=Path, default=Path("poc_results/augmented_dataset_ginetta"),
                        help="Path to augmented dataset directory or metadata.json file")
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--image-size", type=int, default=256)
    parser.add_argument("--val-split", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=1337)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    torch.manual_seed(args.seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    dataset = AugmentedLiveryDataset(args.dataset, image_size=args.image_size)
    val_size = max(1, int(len(dataset) * args.val_split))
    train_size = len(dataset) - val_size
    train_set, val_set = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_set, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_set, batch_size=args.batch_size, shuffle=False, num_workers=0)

    model_uv = UVPredictor().to(device)
    model_renderer = Renderer().to(device)

    optim_uv = torch.optim.Adam(model_uv.parameters(), lr=args.lr, betas=(0.5, 0.999))
    optim_renderer = torch.optim.Adam(model_renderer.parameters(), lr=args.lr, betas=(0.5, 0.999))

    lpips_net = lpips.LPIPS(net='alex').to(device) if lpips is not None else None

    history = {"train": [], "val": []}

    best_val = float("inf")
    best_state = None

    for epoch in range(1, args.epochs + 1):
        train_metrics = train_epoch(model_uv, model_renderer, train_loader, optim_uv, optim_renderer, device)
        val_metrics = evaluate(model_uv, model_renderer, val_loader, device, lpips_net)

        history["train"].append(train_metrics)
        history["val"].append(val_metrics)

        print(f"Epoch {epoch:03d}/{args.epochs} | "
              f"Train L_total: {train_metrics['total']:.4f} | "
              f"Val L_total: {val_metrics['cycle'] * 0.3 + val_metrics['uv_recon'] * 0.3 + val_metrics['direct'] * 0.4:.4f} | "
              f"Val SSIM(UV): {val_metrics['ssim_uv']:.3f} | Val SSIM(View): {val_metrics['ssim_view']:.3f}")

        val_total = val_metrics['cycle'] * 0.3 + val_metrics['uv_recon'] * 0.3 + val_metrics['direct'] * 0.4
        if val_total < best_val:
            best_val = val_total
            best_state = {
                "uv": model_uv.state_dict(),
                "renderer": model_renderer.state_dict(),
                "metrics": val_metrics,
            }

    if best_state is not None:
        output_dir = Path("poc_results")
        output_dir.mkdir(exist_ok=True)
        torch.save(best_state, output_dir / "poc_04_best_model.pt")
        print(f"\nSaved best checkpoint to {output_dir / 'poc_04_best_model.pt'}")
        print(f"Best Val Metrics: {best_state['metrics']}")


if __name__ == "__main__":
    main()
