# Model Playbook (Tiered Bundles)

The automation mode swaps between voice services and the vision agent based on available GPU VRAM and CPU headroom. This document mirrors the presets declared in `src/config/modelPresets.ts`.

| Tier | Hardware Example | Vision Stack | Voice Stack | Notes |
| --- | --- | --- | --- | --- |
| Tier‑3 | RTX 4090 / 24 GB VRAM | OmniParser v2 detector + Qwen3‑VL‑32B (fp16) | Neural TTS Large + Whisper Large-V3 | Multiple services stay resident; minimal swapping needed. |
| Tier‑2 | RTX 3060 / 12 GB VRAM | PaddleOCR + YOLOv8‑n + Qwen3‑VL‑8B (4-bit) | Whisper Medium + Bark-small | Voice services unload automatically while automation is active. |
| Tier‑1 | GTX 1060 / 6 GB VRAM or APU | PaddleOCR CPU + template matching | Whisper Small + VITS-light | Only deterministic automation, no heavy VLM; prompts user for manual confirmation. |

The planner also considers RAM and CPU threads. If the GPU meets a higher tier but RAM is below 16 GB, it downgrades to the next tier to avoid swapping during gameplay.

## Customizing Bundles
- Override via `SIMVOX_AUTOMATION_TIER` environment variable or CLI flag when running `npm run probe`.
- Each `ModelDescriptor` includes `downloadUri` and `expectedSha256` so the onboarding experience can fetch the correct files without manual intervention.
- Keep weights under `C:\Users\Public\SimVox\models` to enable sharing between SimVox modules; this project only references the manifest and never hard-codes absolute paths.
