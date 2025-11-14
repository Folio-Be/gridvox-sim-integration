# UI Automation Recorder for Racing Simulators

**Generic screen recording and labeling toolkit for building UI automation datasets across racing simulators.**

## Purpose

This tool enables **minimal-effort recording** of racing simulator UI interactions and automatically generates labeled training datasets for vision-based automation systems. Designed to be simulator-agnostic, supporting AMS2, ACC, iRacing, and other racing sims.

## Key Features

- **10-minute recording sessions** - Natural menu navigation, no hotkeys to remember
- **Built-in native recorder** - No external apps (OBS) required, pure Rust/Tauri
- **CLI-first workflow** - `pnpm run record-session --sim ams2` auto-loads per-sim profiles
- **Automatic frame extraction** - Extract 300+ frames from a single video
- **AI-powered pre-annotation** - OmniParser detects UI elements with 60-80% accuracy
- **Label Studio integration** - Review and correct annotations in web UI
- **Optional mini labeler** - Built-in Tauri reviewer for quick corrections without Label Studio
- **Sim-agnostic design** - Reusable across multiple racing simulators
- **Reusable component** - Same recorder used for race replay highlights (SimVox feature)

## Quick Start

### Prerequisites

- **Rust & Cargo** - Comes with Tauri (for Tauri projects) or [install standalone](https://rustup.rs/)
- **FFmpeg** - [Download](https://ffmpeg.org/download.html) and add to PATH
- **Python 3.10+** with pip
- **Node.js 18+** with npm/pnpm

### Installation

```bash
# Clone or navigate to this directory
cd C:\DATA\SimVox\simvox-sim-integration\all-sims\ui-automation-recorder

# Install Node dependencies
pnpm install

# Install Python dependencies
pip install -r requirements.txt

# Setup Label Studio
pip install label-studio

# Start Label Studio (first time)
label-studio start
# Opens at http://localhost:8080 - create account and project
```

### Configuration

**Environment Variables:**
```bash
cp .env.example .env
# Edit .env with Label Studio credentials and recording settings
```

**That's it!** No external screen recorder to install or configure.

### Basic Workflow

#### 1. Record Menu Navigation (10 minutes)

```bash
# Start built-in screen recorder
pnpm run record-session

# Instructions will appear:
# "Starting native screen recorder..."
# "Navigate simulator menus naturally for ~10 minutes"
# "Press Ctrl+C when done"
# (Under the hood this launches the headless Tauri CLI + FFmpeg gdigrab capture)
```

In your racing sim:
- Navigate through menus naturally (no need to pause or press hotkeys)
- Cover all menu flows: car selection, track selection, weather, settings, etc.
- Take your time, let each screen load fully

```bash
# When done, press Ctrl+C
# Recording saved to: data/recordings/ams2-recording-YYYY-MM-DD.mp4
# Input log saved to: data/recordings/ams2-recording-YYYY-MM-DD.inputs.jsonl (cursor + bookmarks)
```

**How it works:**
- Rust-based screen capturer detects your game window automatically
- Records to H.264 MP4 using Windows Graphics Capture API
- Native performance, minimal CPU/GPU overhead

#### 2. Process Recording (Automatic - 5 minutes)

```bash
pnpm run process-recording -- --sim ams2 --video data/recordings/ams2-recording-YYYY-MM-DD.mp4

# This will:
# V Extract frames every 1-2 seconds (~300 frames)
# V Filter duplicate frames with scene detection
# V Log the ffmpeg version being used
# V Copy `.inputs.jsonl` into the captures folder and reference it in metadata
# V Generate per-frame metadata JSON files
# V Run pre-annotation (OmniParser placeholder) on all frames
# V Output: "Review at http://localhost:8080"
```

#### 3. Review & Correct Labels (25-40 minutes)

1. Open Label Studio: http://localhost:8080
2. Select your project (e.g., "AMS2 UI Elements")
3. Review each frame:
   - Pre-annotated bounding boxes already present
   - Correct any mislabeled elements
   - Add missing labels
   - Mark screen type (main-menu, car-selection, etc.)
4. Average: 30 seconds per frame

#### 4. Export Dataset

```bash
pnpm run label-studio:export

# Exports to: data/labeled/ams2-ui-dataset-YYYY-MM-DD.json
```

## Recording Effort

| Activity | Time | Automation Level |
|----------|------|------------------|
| **Recording session** | **10 min** | Manual (just play naturally) |
| Frame extraction | 2 min | Fully automated |
| Pre-annotation | 3 min | Fully automated |
| Label Studio import | 30 sec | Fully automated |
| **Label review** | **25-40 min** | Manual (with AI assist) |
| **Total manual effort** | **35-50 min** | 70-80% automated |

Compare to manual screenshot + labeling: ~5-6 hours total

## Recorder Modes & Labeling Options

- **CLI-first recorder**: every workflow starts with `pnpm run record-session --sim <name>` which loads the right capture profile, window title, FPS, and bookmark hotkeys. No UI clicks required to start/stop.
- **Processing pipeline**: `pnpm run process-recording -- --sim <name> --video <mp4>` extracts frames, merges telemetry, writes metadata, and generates pre-annotations.
- **Status overlay (optional)**: `pnpm run record-session --overlay` opens a minimal Tauri window showing elapsed time, detected sim, and bookmark count.
- **Minimal labeler (beta)**: run `pnpm run labeler` to launch a lightweight Tauri reviewer that reads/writes the same JSON schema as Label Studio. Use this for quick passes when you do not need collaboration.
- **Label Studio**: still available for full review workflows (multi-user comments, taxonomy editing). Export/import scripts remain in `scripts/label-studio-*`.
- **Profile validator**: run `pnpm run validate-profile -- --sim ams2` whenever you tweak `config/sim-profiles/*.json` to ensure capture regions + metadata are valid before recording.
- **Scene-testing helper**: use `pnpm run test-scene -- --video path/to/recording.mp4 --sim ams2` to experiment with FFmpeg scene thresholds without touching your main dataset.
- **Region overrides**: append `--region hud_strip` (or any preset defined in the profile) to `pnpm run record-session` / `pnpm run process-recording` if you want to focus on a cropped viewport. The recorder now passes the preset to FFmpeg so MP4s are cropped at source.
- **Capture verifier**: run `pnpm run verify-capture -- --dir data/captures/<session>` to confirm every PNG has matching metadata, inspect region distributions, and catch missing files before importing into Label Studio.

## Input Logging & Metadata

During recording the native capture service writes a parallel `.inputs.jsonl` file containing:

- Timestamped cursor coordinates (from Raw Input) every time you click or trigger the bookmark hotkey.
- Active window title + resolution per segment (helps when switching between sims/tools mid-run).
- Optional hotkey events (default Ctrl+L) so we can align bookmarks with extracted frames.
- `.inputs.jsonl` gets copied into each capture session as `input-log.jsonl` so you can review cursor trajectories alongside frames.
- Per-frame metadata references that log and includes FFmpeg version info for reproducibility.
- Frame metadata now records `captureRegion` + `crop` to describe which preset (e.g., `full_ui`, `hud_strip`) produced each dataset, keeping downstream automation aware of the viewport.

You can tweak logging behavior per simulator in `config/sim-profiles/<sim>.json` (or override using `--bookmark-*` flags on the recorder CLI):

- `bookmarkHotkey.ctrl|shift|key`: redefine the chord by toggling modifiers or switching to another key/F-key.
- `bookmarkHotkey.noteMode`: set to `stdin` to prompt for a quick console note whenever you drop a bookmark, or `none` to keep silent.

## Per-Sim Profiles & Detection Fallbacks

The recorder reads `config/sim-profiles/*.json` when you pass `--sim ams2`:

- Window title patterns (`"Automobilista 2"`, `"ACC"`).
- Preferred resolution/crop (`regionPresets.full_ui`, `regionPresets.hud_strip`) that can be overridden at runtime via `--region <name>`.
- Default scene change thresholds (fast menus vs slow transitions).

Processing scripts use the same profile to pick the right extractor + annotator:

- `omn iparser`: default GPU-based layout detection.
- `template`: CPU-only fallback (OpenCV template matching + PaddleOCR) for lower-end GPUs.
- `labelerHints`: per-sim taxonomy + color codes so both the mini labeler and Label Studio share consistent class names.
- Profiles also encode capture validation hints (required processes, window title variants, supported resolutions) so `pnpm run validate-profile` can catch mistakes early.

Switch profiles via CLI (`pnpm run record-session --sim acc`) or set `SIMVOX_RECORDER_PROFILE=acc` in `.env`.

## Project Structure

```
ui-automation-recorder/
├── README.md                    # This file
├── docs/
│   ├── ARCHITECTURE.md          # Technical design
│   ├── RECORDING-GUIDE.md       # Detailed recording workflow
│   ├── NATIVE-RECORDER.md       # Rust recorder technical details
│   ├── LABELING-GUIDE.md        # Label Studio best practices
│   ├── RESEARCH-SUMMARY.md      # Technology decisions
│   └── IMPLEMENTATION-CHECKLIST.md  # Build progress
├── config/
│   ├── recorder-settings.json   # Native recorder config
│   └── labelstudio-config.xml   # Label taxonomy
├── scripts/
│   ├── record-session.ts        # Recording orchestrator
│   ├── process-recording.ts     # Frame extraction pipeline
│   └── batch_preannotate.py     # OmniParser integration
├── src/
│   ├── extraction/              # FFmpeg frame extractor
│   ├── annotation/              # OmniParser adapter
│   └── labeling/                # Label Studio API client
├── src-tauri/                   # Rust native recorder (Tauri)
│   └── src/recording/           # Screen capture implementation
│       ├── capturer.rs          # Windows Graphics Capture API
│       ├── encoder.rs           # H.264 video encoder
│       └── window_selector.rs   # Game window detection
└── data/
    ├── recordings/              # Recorded MP4 videos
    ├── captures/                # Extracted frames (PNG)
    ├── preannotations/          # OmniParser output (JSON)
    └── labeled/                 # Final datasets
```

## Use Cases

### Primary: AMS2 Race Setup Automation
Generate training data for vision model that understands AMS2 menu structure:
- Button detection (Career, Championship, Settings)
- Dropdown detection (Car class, Track layout)
- Text field detection (Championship name)
- Tile detection (Car/track grid tiles)

### Secondary: SimVox Race Replay Recording
The same native recorder is reused in SimVox Desktop for the **Highlights Editor** feature:
- Auto-record race replays
- Capture telemetry-synchronized footage
- Generate highlight reels with AI-detected events (overtakes, incidents)

### Future: Multi-Sim Support
Same tool can record:
- **Assetto Corsa Competizione** - GT3 race setup
- **iRacing** - Session configuration
- **rFactor 2** - Championship creation
- Any sim with menu-based configuration

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Component design, data flow
- [Native Recorder](docs/NATIVE-RECORDER.md) - Rust screen capture technical details
- [Recording Guide](docs/RECORDING-GUIDE.md) - Step-by-step recording workflow
- [Labeling Guide](docs/LABELING-GUIDE.md) - Label Studio tips and taxonomy
- [Research Summary](docs/RESEARCH-SUMMARY.md) - Why we chose this approach
- [Implementation Checklist](docs/IMPLEMENTATION-CHECKLIST.md) - Build progress

## Requirements

### Hardware
- **GPU:** Any (recording uses minimal resources)
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** ~2GB per 10-minute recording (H.264 1080p, high quality)
- **Display:** 1920x1080 or higher recommended

### Software
- **Windows 10/11** (primary target, Graphics Capture API required)
- **Rust 1.70+** (comes with Tauri or install via rustup)
- **FFmpeg** (video processing)
- **Python 3.10+** (OmniParser, Label Studio)
- **Node.js 18+** (orchestration scripts)

### Optional
- **OmniParser** - For pre-annotation (70-80% time savings)
- **CUDA GPU** - Faster OmniParser inference (not required)

## Advantages Over External Recorders

**Why built-in vs OBS Studio:**

| Aspect | Built-In Recorder | OBS Studio |
|--------|-------------------|------------|
| **Installation** | Bundled with Tauri | 100MB+ download |
| **Setup** | Zero config | WebSocket + game capture config |
| **User Experience** | Single app | Two apps to manage |
| **Code Complexity** | Direct function calls | WebSocket IPC |
| **Reusability** | UI capture + race replays | Just this POC |
| **Latency** | <5ms (native) | ~50-100ms (IPC) |
| **Maintenance** | No external dependency | Version compatibility |

## Roadmap

### Phase 1: Native Recorder (Current)
- [x] Architecture design
- [x] Documentation complete
- [ ] Rust screen capturer (windows-capture crate)
- [ ] Tauri command API
- [ ] Frame extraction with FFmpeg
- [ ] Basic Label Studio integration

### Phase 2: Pre-Annotation
- [ ] OmniParser integration
- [ ] Batch processing pipeline
- [ ] Duplicate frame filtering

### Phase 3: Quality of Life
- [ ] GUI for recording control
- [ ] Auto-detection of game window
- [ ] Resume interrupted processing
- [ ] Export to multiple formats (YOLO, COCO)

### Phase 4: Advanced Features
- [ ] Template matching fallback (no GPU)
- [ ] Active learning (suggest uncertain frames)
- [ ] Dataset augmentation
- [ ] Integration with ams2-race-setup-automation

### Phase 5: SimVox Integration
- [ ] Race replay auto-recording
- [ ] Telemetry-synchronized capture
- [ ] Highlights Editor integration
- [ ] Multi-cam support (for VR/triple monitor)

## Contributing

This tool is part of SimVox.ai's automation infrastructure. For questions or contributions:
- See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details
- See [NATIVE-RECORDER.md](docs/NATIVE-RECORDER.md) for Rust recorder implementation
- See [IMPLEMENTATION-CHECKLIST.md](docs/IMPLEMENTATION-CHECKLIST.md) for current status

## License

MIT License - Part of SimVox.ai project

## Related Projects

- [ams2-race-setup-automation](../ams2/ams2-race-setup-automation) - Uses datasets generated by this tool
- [SimVox Desktop](../../simvox-desktop) - Main application (reuses native recorder)
- [SimVox Docs](../../simvox-docs) - Project documentation

---

**Next Steps:** See [RECORDING-GUIDE.md](docs/RECORDING-GUIDE.md) for detailed recording instructions.
- **Label Studio import/export**
  ```bash
  pnpm run label-studio:import -- --captures data/captures/<session>
  pnpm run label-studio:export -- --project 1
  ```
- **YOLO dataset export**
  ```bash
  pnpm run export:yolo -- --input data/labeled/project-1.json --output data/export/yolo/project-1
  ```
