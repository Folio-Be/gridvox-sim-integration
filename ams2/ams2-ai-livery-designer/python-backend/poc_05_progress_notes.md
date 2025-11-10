# POC 05 Progress Notes (2025-11-11)

## Completed
- Added configurable loss-weight CLI flags (`--w-cycle`, `--w-uv`, `--w-direct`, `--w-cross`) with optional end-epoch values to interpolate weights over training.
- Introduced cosine LR scheduler support (`--lr-scheduler cosine`, `--lr-scheduler-tmax`), plus epoch-weight interpolation helper.
- Enabled named checkpoints and periodic snapshots (`--checkpoint-name`, `--checkpoint-every`).
- Ran 1-epoch smoke test to confirm the refactor.
- Re-ran baseline training (40 epochs, default weights) producing `poc_results/poc_05_best_model_orig.pt` with Val metrics: `total=0.285`, `SSIM(UV)=0.234`, `SSIM(View)=0.559`, `LPIPS(View)=0.413`.
- Captured periodic checkpoints at epochs 10/20/30/40 for regression tracking.
- Patched visualization loader (`torch.load(..., weights_only=False)`) and regenerated `poc_results/poc_05_visualizations/sample_000-011.png` from the new baseline checkpoint.

## Outstanding Tasks
1. Push beyond SSIM(UV) ≈ 0.234:
   - Experiment with UV-heavy → balanced weight curves using `--w-*-end`.
   - Optionally combine with cosine LR (`--lr-scheduler cosine`) and document outcomes.
   - Save each run with descriptive `--checkpoint-name` to avoid overwrites.
2. Qualitative analysis:
   - Review latest grids for artifacts (mask bleed, panel seams).
   - Compare against earlier checkpoints to confirm any regression vs. prior 0.257 SSIM(UV) run.
3. Housekeeping:
   - Archive `poc_05_best_model_orig_epoch*.pt` snapshots if useful; otherwise prune to save disk.
   - Consider adding script to batch-compare metrics across checkpoints.

## Notes
- Baseline SSIM(UV) dipped slightly vs. earlier UV-visibility run (0.234 vs. 0.257); investigate whether weight tweaks or longer training can recover the gap.
- Visualization script now requires trusted checkpoints; keep use of `weights_only=False` limited to internal files.
- LPIPS still emits pretrained warnings; benign but note for future dependency updates.
