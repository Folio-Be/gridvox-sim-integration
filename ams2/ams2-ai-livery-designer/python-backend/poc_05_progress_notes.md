# POC 05 Progress Notes (2025-11-11)

## Completed
- Added configurable loss-weight CLI flags (`--w-cycle`, `--w-uv`, `--w-direct`, `--w-cross`) with optional end-epoch values to interpolate weights over training.
- Introduced cosine LR scheduler support (`--lr-scheduler cosine`, `--lr-scheduler-tmax`), plus epoch-weight interpolation helper.
- Enabled named checkpoints and periodic snapshots (`--checkpoint-name`, `--checkpoint-every`).
- Ran 1-epoch smoke test to confirm the refactor.
- Re-ran baseline training (40 epochs, default weights) producing `poc_results/poc_05_best_model_orig.pt` with Val metrics: `total=0.285`, `SSIM(UV)=0.234`, `SSIM(View)=0.559`, `LPIPS(View)=0.413`.
- Captured periodic checkpoints at epochs 10/20/30/40 for regression tracking.
- Patched visualization loader (`torch.load(..., weights_only=False)`) and regenerated `poc_results/poc_05_visualizations/sample_000-011.png` from the new baseline checkpoint.
- Ran UV-heavy cosine schedule (`w_uv: 0.45→0.25`, `w_cycle: 0.20→0.30`, `w_direct: 0.20→0.30`, `w_cross: 0.10→0.15`, cosine LR T_max=40) saved as `poc_results/poc_05_uvheavy_cosine.pt`; best Val metrics: `total=0.310`, `SSIM(UV)=0.209`, `SSIM(View)=0.499`, `LPIPS(View)=0.504` (UV score regressed).
- Ran direct-steady schedule (`w_direct: 0.30→0.30`, `w_uv: 0.35→0.25`, `w_cycle: 0.25→0.30`, `w_cross: 0.12→0.15`, cosine LR T_max=40) saved as `poc_results/poc_05_directsteady_cosine.pt`; best Val metrics: `total=0.319`, `SSIM(UV)=0.233`, `SSIM(View)=0.492`, `LPIPS(View)=0.547` (roughly on par with baseline UV, slightly worse view/LPIPS).
- UV-lean probe (20 epochs, cosine T_max=20, `w_cycle 0.22→0.30`, `w_uv 0.42→0.26`, `w_direct 0.24→0.30`, `w_cross 0.12→0.15`) saved as `poc_results/poc_05_probe_uvlean.pt`; best Val metrics: `total=0.352`, `SSIM(UV)=0.076`, `SSIM(View)=0.458`, `LPIPS(View)=0.592` (collapsed UV, discard).
- Direct-boost probe (20 epochs, cosine T_max=20, `w_cycle 0.26→0.30`, `w_uv 0.32→0.25`, `w_direct 0.32→0.32`, `w_cross 0.10→0.14`) saved as `poc_results/poc_05_probe_directboost.pt`; best Val metrics: `total=0.384`, `SSIM(UV)=0.224`, `SSIM(View)=0.512`, `LPIPS(View)=0.556` (SSIM close to baseline but LPIPS high; no 40e promotion).
- Hybrid probe (20 epochs, cosine T_max=20, `w_cycle 0.24→0.30`, `w_uv 0.36→0.25`, `w_direct 0.28→0.31`, `w_cross 0.10→0.15`) saved as `poc_results/poc_05_probe_hybrid.pt`; best Val metrics: `total=0.343`, `SSIM(UV)=0.136`, `SSIM(View)=0.472`, `LPIPS(View)=0.557` (underperforms baseline).
- Authored `poc_05_autorunner.py` to queue probe/full runs with promotion thresholds, runtime budget awareness, and automatic visualization for successful schedules.
- Added `poc_05_inference.py` to convert arbitrary showroom photos into predicted UV textures and renderer reprojections for manual QA or editor integration tests.

## Outstanding Tasks
1. Push beyond SSIM(UV) ≈ 0.234:
   - Experiment with UV-heavy → balanced weight curves using `--w-*-end`.
   - Optionally combine with cosine LR (`--lr-scheduler cosine`) and document outcomes.
   - Save each run with descriptive `--checkpoint-name` to avoid overwrites.
    - Compare checkpoints from UV-heavy vs. direct-steady runs to understand LPIPS degradation and SSIM(UV) plateau; consider mixed schedules (e.g., keep `w_direct` high but reduce `w_cross` annealing).
    - Sweep matrix (PROGRESS): UV-lean, Direct-boost, and Hybrid probes completed—none beat the promotion threshold (`SSIM(UV) ≥ 0.245` & `LPIPS(View) ≤ 0.52`). Iterate on direct-first ideas (e.g., stronger cross decay or longer cosine cycle) before launching new probes.
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
