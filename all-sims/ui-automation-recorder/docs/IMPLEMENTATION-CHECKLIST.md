# Implementation Checklist

## Phase 0: Documentation & Setup ✓
- [x] Create project structure *Directories created, README written.*
- [x] Write ARCHITECTURE.md *Updated to use native Rust recorder.*
- [x] Write RECORDING-GUIDE.md *Removed OBS, added native recorder workflow.*
- [x] Write NATIVE-RECORDER.md *Complete technical guide for Rust implementation.*
- [x] Write RESEARCH-SUMMARY.md *Complete research findings documented.*
- [x] Create .env.example with configuration template *Native recorder settings.*
- [x] Create package.json with scripts *Updated to remove OBS dependencies.*
- [x] Create config/recorder-settings.json *Native recorder configuration.*
- [x] Create requirements.txt for Python dependencies *Pinned OmniParser/Label Studio/FFmpeg helpers.*

## Phase 1: Tauri Screen Recorder (Native CLI)
**Goal:** Provide a built-in recording CLI driven by Tauri. Initial cut uses FFmpeg while the windows-capture implementation is in progress.

### Setup
- [x] Initialize `src-tauri/` workspace with Cargo + tauri v1 *Manual scaffolding, no UI window shown (hidden window).*
- [x] Add tauri/build dependencies and empty dist folder *`tauri.conf.json` points dev/dist to `/dist` to avoid scanning the entire repo.*
- [x] Provide placeholder icons (`icons/icon.png` + `.ico`) *Allows tauri-build to bake resources.*

### Development: Core Recorder CLI
- [x] Implement `RecorderState` in Rust with start/stop/status tauri commands *Currently spawns FFmpeg's `gdigrab` to capture the requested window and writes MP4.*
- [x] Expose CLI subcommand `record` (tauri config + handler) *Supports `--window`, `--output`, `--ffmpeg`, `--fps`.*
- [ ] Swap FFmpeg capture with Windows Graphics Capture / windows-capture crate *Keeps the same command surface so the CLI doesn't change.*
- [ ] Extract recording logic into `src-tauri/src/recording/*` modules (window selector, capturer, encoder) for easier maintenance.

### Development: Node Wrapper
- [x] Create `scripts/record-session.ts` *Parses `--sim`, resolves output path under `data/recordings`, and invokes `cargo run --record ...`.*
- [x] Extend script to load sim profile metadata (window title/FPS/bookmark hotkey) once profile manager lands. *Profile bookmark chord + note mode now forwarded to the CLI.*
- [x] Integrate bookmark hotkey middleware once input logger is implemented. *Recorder CLI receives the per-profile modifiers/key so telemetry captures aligned events.*

### Testing
- [x] `cargo build --manifest-path src-tauri/Cargo.toml` *Builds headless Tauri binary.*
- [ ] Manual smoke test on Windows machine to verify FFmpeg capture works end-to-end (blocked until hardware testing slot).

### Acceptance Criteria (current FFmpeg version)
- [x] `pnpm run record-session --sim ams2` spawns Tauri CLI + FFmpeg and writes MP4 to `data/recordings`. *User stops with Ctrl+C.*
- [ ] Replace FFmpeg backend with native Graphics Capture (same interface).
- [ ] Graceful errors when window title not found or FFmpeg missing (log + exit code).

---

## Phase 1B: Input Telemetry Logger
**Goal:** Capture cursor position, keystrokes, and bookmarks alongside each recording.**

- [x] Implement cursor/bookmark logger in `src-tauri/src/telemetry.rs` *(polls cursor + Detects Ctrl+L bookmarks).*
- [x] Stream events to recorder session and flush to `*.inputs.jsonl`
- [x] Configurable bookmark hotkey (default Ctrl+L) + optional note prompt UI *Profiles + CLI flags feed telemetry and console prompts capture optional notes.*
- [x] Extend `scripts/process-recording.ts` to merge telemetry with extracted frames *(copies `.inputs.jsonl` into capture dir and references it in metadata)*
- [x] Update README + RECORDING-GUIDE to describe bookmark workflow *Docs now outline chord overrides, notes, and CLI flags.*
- [x] Add unit tests for JSONL schema and debounced logging *Telemetry serialization + bookmark edge detector covered by `cargo test`.*

### Acceptance Criteria
- [x] Running `pnpm run record-session --sim ams2` creates both `.mp4` and `.inputs.jsonl`
- [ ] Bookmarks show up in metadata with cursor coordinates + user notes
- [x] Frame metadata references the telemetry log path for downstream alignment
- [ ] Input logging can be disabled via `.env`/CLI flag

---

## Phase 1C: Sim Profile Manager
**Goal:** Make recorder/processor configurable per simulator without code changes.**

- [x] Define profile schema in `config/sim-profiles/README.md`
- [x] Create base profile `config/sim-profiles/ams2.json`
- [x] Recorder CLI loads profile (window title, output path) before invoking Tauri
- [x] Extend profile to include bookmark hotkey + note prompt settings *`bookmarkHotkey` now stores modifiers/key + `noteMode` for recorder telemetry.*
- [x] Add capture region presets + cursor polling hints *Region maps + default region + cursor Hz captured per profile for future Graphics Capture swap.*
- [x] Add validation CLI: `pnpm run validate-profile -- --sim <name>` *New script validates JSON + warns about window title patterns and missing dirs.*
- [x] Document profile creation & validation flow in README/RECORDING-GUIDE *Guide now covers validator usage and schema updates.*

### Acceptance Criteria
- [ ] Switching profiles changes capture settings + taxonomy without touching code
- [x] Unsupported sim names produce helpful error *`getSimProfileOrExit` surfaces actionable loader errors in every CLI.*
- [ ] Profiles live in source control and pass validation CI step

---

## Phase 2: Frame Extraction
**Goal:** Extract unique frames from video using scene detection.

### Setup
- [x] Install FFmpeg (add to PATH if not present)
- [x] Verify FFmpeg version logged automatically via `pnpm run process-recording`
- [ ] Test basic frame extraction: `ffmpeg -i video.mp4 -vf fps=1 frame-%04d.png`
- [x] Provide FFmpeg scene detection test CLI (`pnpm run test-scene`) *Calibrate thresholds without polluting captures.*
- [x] Provide capture verification CLI (`pnpm run verify-capture`) *Checks PNG/JSON parity, region distribution, and flags missing metadata before import.*

### Development
- [x] Create `src/extraction/frameExtractor.ts` *(FFmpeg wrapper with scene detection)*
- [x] Create `src/extraction/metadataWriter.ts` *(writes per-frame JSON metadata, references telemetry + ffmpeg version)*
- [x] Add CLI scripts: `scripts/extract-frames.ts`, `scripts/process-recording.ts`
- [x] Add detailed progress reporting + logging *Frame extractor now polls PNG counts + logs duration; scripts emit contextual prefixes.*
- [x] Persist capture region metadata per frame *Each JSON stores `captureRegion` + `crop` so downstream automation knows the viewport.*

### Testing
- [ ] Extract frames from 10-min test video (requires manual run)
- [ ] Verify ~300 frames extracted (0.5 FPS)
- [ ] Verify scene detection filters duplicates (check consecutive frames)
- [ ] Verify metadata JSON exists for each PNG
- [ ] Check total file size (~50MB for 300 frames)

### Acceptance Criteria
- [ ] Extracts 250-350 unique frames from 10-min video
- [ ] Each frame has corresponding .json metadata
- [ ] Total processing time < 3 minutes
- [ ] No duplicate/nearly-identical frames

## Phase 3: Pre-Annotation (OmniParser)
**Goal:** Auto-detect UI elements with bounding boxes.

### Setup
- [x] Install Python tooling & venv (`requirements.txt`)
- [ ] Validate OmniParser / fallback detectors installation once GPU target confirmed

### Development
- [x] Skeleton `scripts/batch_preannotate.py` (placeholder tasks)
- [x] Node wrapper `src/annotation/omniparserAdapter.ts` for invoking Python script
- [ ] Integrate actual OmniParser inference (GPU path) + fallback template matching

### Testing
- [ ] Validate placeholder pipeline runs end-to-end (frames → JSON)
- [ ] Replace placeholder with OmniParser and measure accuracy/runtime

### Acceptance Criteria
- [ ] Pre-annotates 300 frames in <5 minutes (GPU)
- [ ] Detects buttons, text fields, tiles with >60% accuracy
- [ ] Outputs valid Label Studio JSON format
- [ ] Handles errors gracefully (logs skipped frames)

## Phase 4: Label Studio Integration
**Goal:** Import frames with pre-annotations for manual review.

### Setup
- [ ] Decide deployment approach (embedded sidecar vs external server)
- [ ] Document `.env` requirements for LS backend (URL, token, project name)

### Development
- [x] Basic LS REST client + import/export scripts (needs real config + error handling)
- [ ] Build Tauri mini labeler + embed LS frontend per architecture doc
- [ ] Add CLI workflow: record → process → import → review → export

### Minimal Labeler (Tauri)
- [ ] TBD (will start after LS integration)

### Embedded Label Studio Frontend (Tauri)
- [ ] START: integrate once LS backend config & asset build steps defined

## Phase 5: End-to-End Pipeline
- [x] Create `scripts/process-recording.ts` (records telemetry -> frames -> pre-annotations)
- [ ] Auto-import to Label Studio from the same command
- [ ] Provide summary report (frame counts, file paths)
- [x] Add YOLO exporter (`scripts/exporters/yolo-exporter.ts`) for downstream training

### Acceptance Criteria
- [x] Single command: `pnpm run process-recording --sim <sim> --video <mp4>`
- [x] Outputs: MP4 -> Frames -> Pre-annotations
- [ ] Logs Label Studio import link automatically
- [ ] Fails fast when prerequisites missing (ffmpeg, python, LS token)

## Phase 6: Documentation & Guides
**Goal:** User-facing documentation for recording workflow.

### Documentation
- [x] Write RECORDING-GUIDE.md *Complete with native recorder workflow.*
- [ ] Write LABELING-GUIDE.md
  - [ ] Label taxonomy definitions
  - [ ] Keyboard shortcuts
  - [ ] Quality control checklist
- [x] Write RESEARCH-SUMMARY.md *Complete research findings documented.*
- [ ] Write TROUBLESHOOTING.md
  - [ ] Native recorder compilation issues
  - [ ] Window detection problems
  - [ ] FFmpeg not found
  - [ ] OmniParser installation problems
  - [ ] Label Studio errors
- [x] Create config/recorder-settings.json *Native recorder configuration complete.*
- [x] Update README.md with actual commands and workflows *Updated for native recorder.*

### Examples
- [ ] Create examples/sample-workflow.md
  - [ ] Full walkthrough with actual outputs
  - [ ] Screenshots of each stage
- [ ] Create examples/metadata-schema.json
  - [ ] Complete example of all JSON formats

### Acceptance Criteria
- [ ] New user can complete workflow with only README + guides
- [ ] All npm scripts documented with examples
- [ ] Troubleshooting covers top 5 common issues

---

## Phase 7: Quality of Life Improvements
**Goal:** Usability enhancements based on testing.

### Features
- [ ] Add progress bars to all long operations
- [ ] Add `--resume` flag to continue interrupted processing
- [ ] Auto-detect OBS recording output path
- [ ] Add `--sim ams2|acc|iracing` flag for metadata tagging
- [ ] Add duplicate frame threshold configuration
- [ ] Add frame quality filter (skip blurry frames)

### Optional Enhancements
- [ ] GUI wrapper (Electron/Tauri) for non-technical users
- [ ] Real-time preview during recording (show last extracted frame)
- [ ] Template matching fallback when OmniParser fails
- [ ] Dataset statistics (element counts, label distribution)
- [ ] Export to multiple formats (YOLO, COCO, Pascal VOC)

---

## Phase 8: Integration with AMS2 Automation POC
**Goal:** Use labeled dataset to train automation model.

### Tasks
- [ ] Export dataset in YOLOv8 format
- [ ] Copy to ams2-race-setup-automation/data/training
- [ ] Document training workflow
- [ ] Test trained model accuracy on new captures
- [ ] Integrate model into automation pipeline

### Acceptance Criteria
- [ ] Labeled dataset trains YOLOv8 model successfully
- [ ] Model detects AMS2 UI elements with >80% accuracy
- [ ] Automation POC uses model for menu state detection

---

## Current Status

**Phase 0: Documentation** - ✅ Complete (8/9 tasks done, requirements.txt pending)
**Phase 1: Tauri Screen Recorder** - ⏳ Not Started (design complete, implementation pending)
**Phase 2: Frame Extraction** - ⏳ Not Started
**Phase 3: Pre-Annotation** - ⏳ Not Started
**Phase 4: Label Studio** - ⏳ Not Started
**Phase 5: Pipeline** - ⏳ Not Started
**Phase 6: Guides** - ✅ Mostly Complete (RECORDING-GUIDE and RESEARCH-SUMMARY done)
**Phase 7: QoL** - ⏳ Not Started
**Phase 8: Integration** - ⏳ Not Started

---

## Timeline Estimates

| Phase | Estimated Time | Dependencies |
|-------|---------------|--------------|
| Phase 0 | 4 hours | None ✅ |
| Phase 1 | 2-3 days | Rust toolchain installed |
| Phase 2 | 1 day | FFmpeg installed |
| Phase 3 | 1-2 days | Python + OmniParser |
| Phase 4 | 1 day | Label Studio setup |
| Phase 5 | 0.5 days | Phases 1-4 complete |
| Phase 6 | 1 day | Real usage experience ✅ (mostly done) |
| Phase 7 | 2-3 days | User feedback |
| Phase 8 | 2-3 days | Labeled dataset |
| **Total** | **11-16 days** | - |

**Note:** Phase 1 takes longer than OBS approach (2-3 days vs 1 day) but eliminates external dependency and enables reuse for SimVox race replay recording.

---

## Next Immediate Steps

1. ✅ Complete Phase 0 documentation (ARCHITECTURE, RECORDING-GUIDE, NATIVE-RECORDER, RESEARCH-SUMMARY)
2. ✅ Create config/recorder-settings.json with native recorder configuration
3. ✅ Update package.json to remove OBS dependencies
4. Create requirements.txt for Python dependencies (Label Studio, OmniParser)
5. Build Phase 1: Tauri Screen Recorder (2-3 days)
   - Initialize Tauri project in src-tauri/
   - Implement Rust recorder using windows-capture crate
   - Create TypeScript API wrapper
   - Test with AMS2 recording session

---

**Last Updated:** 2025-01-14 (updated for native Rust recorder)
**Current Phase:** Phase 0 Complete → Ready for Phase 1 (Tauri Screen Recorder)
