# AMS2 Race Setup Automation (Standalone POC)

Prototype workspace for the SimVox.ai automation agent that configures Automobilista 2 race sessions on behalf of the user. The goal is to keep this project **self-contained** so it can be embedded into the SimVox MVP later without inheriting dependencies from other proof-of-concepts.

## Repository Goals

- Capture AMS2 screens, parse UI layout with a local vision model, and emit structured elements the LLM can reason over.
- Orchestrate deterministic input playback (mouse/keyboard/AutoHotkey) to reliably pick cars, tracks, weather, and race modifiers.
- Provide a hardware-aware resource planner so mid‑range GPUs (e.g. RTX 3060) can swap voice/VLM workloads during automation mode.
- Define a sim-agnostic race setup DSL and adapters so the automation engine can be reused for additional simulators.

## Project Structure

```
ams2-race-setup-automation/
├── docs/                  # Architecture notes, integration guides, next steps
├── scripts/               # Input automation helpers (AutoHotkey etc.)
├── src/                   # TypeScript services for probing, planning, automation pipeline
├── data/                  # Sample assets (story requests, layouts, etc.)
├── specs/                 # Future contract tests and JSON schemas
├── package.json           # Standalone Node.js project definition
└── tsconfig.json          # TypeScript compiler settings
```

## Getting Started

```bash
pnpm install   # or npm install
pnpm run probe # capture system profile and recommended model bundle
pnpm start     # run the placeholder pipeline (logs only for now)
pnpm run capture -- --note="car grid" # grab AMS2 screen + metadata
pnpm run specs # verify label-replay hybrid parser wiring
```

> ℹ️  This directory intentionally contains no symlinks or references to other SimVox repositories. Copy assets from other POCs if you need them, but keep this repo portable.

### Capture CLI Options

```
pnpm run capture -- --prefix=car-grid --note="GT3 list" --hotkey=F12
```

Metadata now stores cursor coordinates and an optional `hotkey` field to correlate with manual capture shortcuts.

## Next Steps

1. Implement real screenshot capture via Desktop Duplication API and feed frames into the `LocalVisionModel` adapter.
2. Train/fine-tune a lightweight detector for AMS2 menu widgets and plug it into `VisionLayoutParser` (see `docs/ARCHITECTURE.md`).
3. Flesh out the AutoHotkey driver under `scripts/` to translate DSL actions into resilient window interactions.
4. Add contract tests in `specs/` that replay recorded AMS2 runs to validate the automation pipeline off-line.

For more detail on the roadmap and integration requirements, read `docs/NEXT-STEPS.md`.
