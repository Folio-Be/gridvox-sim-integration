## Phase 0 – Data Foundations
- [x] Build AMS2 capture CLI with metadata logging *CLI saves PNG+JSON via `npm run capture`.*
- [ ] Record AMS2 menu captures with cursor telemetry *Tool now logs cursor/hotkey; awaiting real capture session.*
- [ ] Label critical screens via Label Studio *Schema/sample ready; needs manual labeling.*
- [x] Snapshot canonical AMS2 content locally *Copied `ams2-content.json` into `data/catalog`.*

## Phase 1 – Vision Layer
- [x] Package PaddleOCR + YOLOv8-n layout parser *Hybrid label-replay parser mimics PaddleOCR+YOLO outputs.*
- [ ] Add adapters for Qwen3-VL and OmniParser weighted by tier plan.
- [x] Record regression tests under `specs/layout` *`pnpm run specs` validates parser wiring.*

## Phase 2 – Action Executor
- [ ] Flesh out `automation-driver.ahk` primitives and Node bridge.
- [ ] Implement deterministic dry-run executor for CI.

## Phase 3 – Story Planner & Validation
- [ ] Translate SimVox story JSON to DSL actions with content validation.
- [ ] Build UI validator comparing parsed layout vs desired selections.
- [ ] Emit structured telemetry logs for desktop status UI.

## Phase 4 – Integration Hardening
- [ ] Ship CLI wrapper (`simvox-automation run ...`).
- [ ] Provide mocked automation mode for QA without AMS2.
- [ ] Document deployment/onboarding steps for model downloads.
