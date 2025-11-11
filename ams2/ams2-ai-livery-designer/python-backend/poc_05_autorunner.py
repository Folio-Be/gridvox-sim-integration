"""Automate POC 05 training sweeps with simple decision logic.

This script chains training runs (and optional visualizations) to explore
multiple loss-weight schedules without manual intervention. It keeps track of
elapsed wall-clock time, bails out before exceeding a configurable time budget,
and promotes promising probe runs into full-length trainings.

Usage example (run from repository root):

    python poc_05_autorunner.py --max-hours 5 --run-tag overnight_20251111

Key ideas:
- Start with short 20-epoch probe runs.
- Promote to a longer 40-epoch schedule only when SSIM(UV) and LPIPS(View)
  metrics meet configured thresholds.
- Update the remaining-time estimate using the measured runtime of each
  completed training.
- Stop early if the remaining time cannot accommodate the next queued run.

The script expects the existing virtual environment dependencies to be
installed and will invoke `poc_05_training_multiview.py` directly.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import torch

TRAIN_SCRIPT = Path(__file__).with_name("poc_05_training_multiview.py")
VIS_SCRIPT = Path(__file__).with_name("poc_05_visualize_predictions.py")
POC_RESULTS = Path("poc_results")


@dataclass
class Threshold:
    metric: str
    comparison: str  # "ge" or "le"
    value: float

    def satisfied(self, metrics: Dict[str, float]) -> bool:
        actual = float(metrics.get(self.metric, float("nan")))
        if self.comparison == "ge":
            return actual >= self.value
        if self.comparison == "le":
            return actual <= self.value
        raise ValueError(f"Unsupported comparison {self.comparison}")


@dataclass
class ExperimentTemplate:
    name: str
    epochs: int
    train_args: List[str]
    checkpoint_stem: str
    success_thresholds: List[Threshold] = field(default_factory=list)
    success_next: Optional[str] = None
    failure_next: Optional[str] = None
    checkpoint_every: int = 0
    run_visuals: bool = False

    def build_command(self, run_tag: str) -> Tuple[List[str], Path]:
        checkpoint_name = f"{run_tag}_{self.checkpoint_stem}.pt"
        checkpoint_path = POC_RESULTS / checkpoint_name
        args = [
            sys.executable,
            str(TRAIN_SCRIPT),
            "--dataset",
            "poc_results/augmented_dataset_ginetta",
            "--epochs",
            str(self.epochs),
            "--batch-size",
            "6",
            "--lr",
            "0.0002",
            "--lr-scheduler",
            "cosine",
            "--lr-scheduler-tmax",
            str(self.epochs),
            "--checkpoint-name",
            checkpoint_name,
        ]
        if self.checkpoint_every:
            args.extend(["--checkpoint-every", str(self.checkpoint_every)])
        args.extend(self.train_args)
        return args, checkpoint_path

    def decide_next(self, metrics: Dict[str, float]) -> Optional[str]:
        if self.success_thresholds:
            all_met = all(th.satisfied(metrics) for th in self.success_thresholds)
            if all_met:
                return self.success_next
            return self.failure_next
        return self.success_next


def run_subprocess(cmd: List[str]) -> Tuple[int, float]:
    start = time.time()
    print(f"\n[autorunner] Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, check=False)
    duration = time.time() - start
    return result.returncode, duration


def load_metrics(checkpoint_path: Path) -> Dict[str, float]:
    state = torch.load(checkpoint_path, map_location="cpu", weights_only=False)
    metrics = state.get("metrics", {})
    # Normalize key casing
    normalized = {k.replace("lpips_view", "lpips_view"): float(v) for k, v in metrics.items()}
    return normalized


def maybe_move_checkpoint(checkpoint_path: Path, run_dir: Path) -> Path:
    run_dir.mkdir(parents=True, exist_ok=True)
    target = run_dir / checkpoint_path.name
    if checkpoint_path.exists():
        shutil.move(str(checkpoint_path), target)
    return target


def visualize_checkpoint(checkpoint: Path, output_dir: Path) -> None:
    if not VIS_SCRIPT.exists():
        print("[autorunner] Visualization script missing, skipping.")
        return
    output_dir.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable,
        str(VIS_SCRIPT),
        "--checkpoint",
        str(checkpoint),
        "--dataset",
        "poc_results/augmented_dataset_ginetta",
        "--output",
        str(output_dir),
        "--num-samples",
        "12",
    ]
    print(f"[autorunner] Rendering samples for {checkpoint.name}")
    subprocess.run(cmd, check=False)


def build_templates() -> Dict[str, ExperimentTemplate]:
    return {
        "direct_decay_probe": ExperimentTemplate(
            name="direct_decay_probe",
            epochs=20,
            train_args=[
                "--w-cycle",
                "0.26",
                "--w-cycle-end",
                "0.30",
                "--w-uv",
                "0.32",
                "--w-uv-end",
                "0.25",
                "--w-direct",
                "0.32",
                "--w-direct-end",
                "0.32",
                "--w-cross",
                "0.08",
                "--w-cross-end",
                "0.12",
            ],
            checkpoint_stem="direct_decay_probe",
            success_thresholds=[
                Threshold("ssim_uv", "ge", 0.245),
                Threshold("lpips_view", "le", 0.52),
            ],
            success_next="direct_decay_full",
            failure_next="directsteady_full",
        ),
        "direct_decay_full": ExperimentTemplate(
            name="direct_decay_full",
            epochs=40,
            train_args=[
                "--w-cycle",
                "0.26",
                "--w-cycle-end",
                "0.30",
                "--w-uv",
                "0.32",
                "--w-uv-end",
                "0.25",
                "--w-direct",
                "0.32",
                "--w-direct-end",
                "0.32",
                "--w-cross",
                "0.08",
                "--w-cross-end",
                "0.12",
            ],
            checkpoint_stem="direct_decay_full",
            checkpoint_every=10,
            run_visuals=True,
        ),
        "directsteady_full": ExperimentTemplate(
            name="directsteady_full",
            epochs=40,
            train_args=[
                "--w-cycle",
                "0.25",
                "--w-cycle-end",
                "0.30",
                "--w-uv",
                "0.35",
                "--w-uv-end",
                "0.25",
                "--w-direct",
                "0.30",
                "--w-direct-end",
                "0.30",
                "--w-cross",
                "0.12",
                "--w-cross-end",
                "0.15",
            ],
            checkpoint_stem="directsteady_full",
            checkpoint_every=10,
            run_visuals=True,
        ),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Automate POC 05 training sweeps")
    parser.add_argument("--max-hours", type=float, default=5.0, help="Stop when wall-clock budget (hours) would be exceeded")
    parser.add_argument("--run-tag", type=str, default=time.strftime("autorun_%Y%m%d_%H%M"), help="Unique label for checkpoints/outputs")
    parser.add_argument(
        "--initial-seconds-per-epoch",
        type=float,
        default=180.0,
        help="Initial runtime estimate per epoch before measurements are available",
    )
    parser.add_argument("--start", type=str, default="direct_decay_probe", help="Template name to launch first")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    templates = build_templates()
    if args.start not in templates:
        raise SystemExit(f"Unknown start template: {args.start}")

    run_dir = POC_RESULTS / args.run_tag
    summary: List[Dict[str, object]] = []
    queue: List[str] = [args.start]
    start_time = time.time()
    elapsed = 0.0
    est_seconds_per_epoch = args.initial_seconds_per_epoch
    remaining_budget = args.max_hours * 3600.0

    while queue:
        template_name = queue.pop(0)
        template = templates[template_name]
        predicted = est_seconds_per_epoch * template.epochs
        elapsed = time.time() - start_time
        remaining_budget = args.max_hours * 3600.0 - elapsed

        if predicted > remaining_budget:
            print(
                f"[autorunner] Skipping {template.name}: predicted {predicted/3600:.2f}h exceeds remaining budget {remaining_budget/3600:.2f}h"
            )
            continue

        cmd, checkpoint_path = template.build_command(args.run_tag)
        returncode, duration = run_subprocess(cmd)
        elapsed = time.time() - start_time
        est_seconds_per_epoch = 0.5 * est_seconds_per_epoch + 0.5 * (duration / template.epochs)

        if returncode != 0:
            print(f"[autorunner] Run {template.name} failed with code {returncode}")
            summary.append(
                {
                    "experiment": template.name,
                    "status": "failed",
                    "duration_seconds": duration,
                    "returncode": returncode,
                }
            )
            continue

        relocated = maybe_move_checkpoint(checkpoint_path, run_dir)
        metrics = load_metrics(relocated)
        summary.append(
            {
                "experiment": template.name,
                "status": "completed",
                "duration_seconds": duration,
                "metrics": metrics,
                "checkpoint": str(relocated),
            }
        )
        print(f"[autorunner] Completed {template.name} in {duration/60:.1f} min | metrics: {metrics}")

        next_template = template.decide_next(metrics)
        if next_template:
            if next_template not in templates:
                print(f"[autorunner] Unknown follow-up template: {next_template}")
            else:
                queue.append(next_template)

        if template.run_visuals:
            viz_dir = run_dir / f"visuals_{template.name}"
            visualize_checkpoint(relocated, viz_dir)

    summary_path = run_dir / "summary.json"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    with summary_path.open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"[autorunner] Finished. Summary written to {summary_path}")


if __name__ == "__main__":
    main()
