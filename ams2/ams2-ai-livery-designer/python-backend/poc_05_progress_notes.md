# POC 05 Progress Notes (2025-11-10)

## Completed Today
- Added configurable loss-weight CLI flags (`--w-cycle`, `--w-uv`, `--w-direct`, `--w-cross`) with optional end-epoch values to interpolate weights over training.
- Introduced cosine LR scheduler support (`--lr-scheduler cosine`, `--lr-scheduler-tmax`), plus epoch-weight interpolation helper.
- Enabled named checkpoints and periodic snapshots (`--checkpoint-name`, `--checkpoint-every`).
- Verified script integrity with a 1-epoch smoke test after the changes.

## Outstanding Tasks
1. Re-run the 40-epoch baseline using original weights:
   - Command suggestion: `./venv/Scripts/python.exe poc_05_training_multiview.py --dataset poc_results/augmented_dataset_ginetta --epochs 40 --batch-size 4 --image-size 256 --val-split 0.1 --checkpoint-name poc_05_best_model_orig.pt --checkpoint-every 10`
   - Goal: restore the strong UV checkpoint (target SSIM(UV) ≈ 0.257) without overwriting other runs.
2. Explore training schedules to push SSIM(UV) ≥ 0.30:
   - Sweep UV-heavy → balanced weight curves using the new `--w-*-end` flags (e.g., start UV-heavy, fade toward original mix).
   - Optional: pair with cosine LR (`--lr-scheduler cosine`) and capture runs with descriptive checkpoint names.
3. After promising runs:
   - Regenerate visual grids via `poc_05_visualize_predictions.py` for each checkpoint.
   - Compare metrics/visuals and archive notable checkpoints (consider separate folder).

## Notes
- Latest checkpoint from the 1-epoch smoke test now lives at `poc_results/poc_05_best_model.pt` (metrics: SSIM(UV) ≈ 0.042). Re-run baseline ASAP to replace with a meaningful model.
- Periodic checkpoints land alongside the named best model (`poc_results/`). Use the stem + `_epochXXX.pt` convention for clarity.
- Remember to keep CUDA context warm and ensure LPIPS weights are cached before long runs to avoid first-epoch hiccups.
