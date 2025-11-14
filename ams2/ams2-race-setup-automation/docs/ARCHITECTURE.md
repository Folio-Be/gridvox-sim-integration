# AMS2 Automation Architecture (v0.1)

This standalone project mirrors the structure we will later plug into the SimVox MVP. The MVP needs a deterministic agent that can translate a “story race” request into actual game actions while running **entirely on the user’s PC**.

## High-Level Flow

```
Story Race Request (from SimVox desktop)
        │
        ▼
Race DSL Normalizer ──► Canonical car/track/weather payloads
        │
        ▼
Vision Layout Parser ──► UI element graph (from AMS2 screen captures)
        │
        ▼
Decision Layer (local LLM) ──► Intent stream (`SetCar`, `SetTrack`, ...)
        │
        ▼
Action Executor (AutoHotkey/Rust) ──► Mouse/keyboard events
        │
        ▼
State Validator ──► Compare AMS2 UI to canonical payloads, retry if needed
```

### Modules in this repository

| Module | Responsibility | Notes |
| --- | --- | --- |
| `probe/` | Inspect the user’s hardware and choose the smallest viable model bundle. | Prevents the automation mode from starving AMS2 on mid-range GPUs. |
| `config/modelPresets.ts` | Declarative tier definitions for LLM/STT/TTS/VLM. | Used by onboarding and runtime swapping. |
| `automation/pipeline.ts` | Life-cycle manager (init vision model, load scripts, run plan). | Entry point for future integration tests. |
| `automation/vision/*` | Abstractions for screenshot capture + layout parsing. | Real implementations will wrap OmniParser/Qwen/PaddleOCR combos. |
| `scripts/automation-driver.ahk` | Shell for deterministic input playback. | Keep AutoHotkey logic inside this repo to stay self-contained. |
| `data/` | Sample story definitions, future labeled screenshots. | Used for offline evaluation. |

## Resource Management Strategy

1. **Hardware probe** collects GPU VRAM, CPU threads, RAM and storage throughput.
2. **Model planner** selects a tier (e.g., RTX 3060 ⇒ “Tier‑2”) and persists the chosen bundle (vision model quantization, voice models, LLM).
3. **Automation mode** temporarily unloads voice services and spins up the VLM only while AMS2 menus are active.
4. **Telemetry** from every run (RAM/VRAM usage, frame latency) feeds back into the planner so SimVox can suggest lighter bundles if OOMs occur.

## Race Setup DSL

We define a simulator-agnostic schema:

```ts
type RaceAction =
  | { type: 'SetCar'; carId: string; liveryId?: string }
  | { type: 'SetTrack'; trackId: string; layoutId?: string }
  | { type: 'SetWeather'; slot: number; preset: string }
  | { type: 'SetTime'; start: string; progression: number }
  | { type: 'SetOpponents'; gridSize: number; difficulty: number };
```

Adapters convert DSL actions into AMS2 UI selectors (button IDs, tile coordinates, slider values). The same DSL will be reused for iRacing/ACC/LMU later, ensuring this codebase becomes a drop-in module.

## Vision Stack Options

- **Default (Tier‑2)**: PaddleOCR + YOLOv8‑n detector + Qwen3‑VL‑8B Instruct 4‑bit for disambiguation.
- **Tier‑3+**: OmniParser v2 for dense layout output + 8–13 B reasoning model (Molmo or Qwen3‑VL‑32B, as VRAM allows).
- **Tier‑1 fallback**: CPU-only OCR (PaddleOCR) + handcrafted template matching for static widgets.

The `LocalVisionModel` wrapper in `src/automation/vision/localVisionModel.ts` hides the differences so the rest of the pipeline can stay simulator-focused.

## Integration Path to SimVox MVP

1. Ship this package as a standalone binary invoked via CLI (`simvox-automation --story payload.json`).
2. The SimVox desktop client watches the automation logs (JSONL) to update UI state (progress bar, recovery prompts).
3. Later, embed the pipeline into a shared Rust service (Tauri plugin) so automation mode can be triggered without shelling out.
4. Keep dependencies minimal (TypeScript + AutoHotkey) so QA can run this module independently of the rest of SimVox.
- ### Capture Automation Options
  - **SikuliX** – Java-based visual automation/recorder. Install Temurin JDK + SikuliX IDE, capture AMS2 widgets, auto-generate PNG+JSON pairs via `SCREEN.capture`. Scripts run via `java -jar sikulixide-2.0.5.jar -r path/to/script.sikuli`.
  - **TagUI** – CLI RPA toolkit. Author `.tagui` scripts with `snap`/`echo` to capture frames + cursor metadata, run `tagui script.tagui -log -video` for deterministic datasets. CLI is easy to call from Node once automation needs to replay.
