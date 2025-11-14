# Recording Guide - Step-by-Step Workflow

This guide walks through the complete process of recording racing simulator UI and generating a labeled dataset.

**Time Investment:**
- One-time setup: 30-60 minutes
- Recording session: 10 minutes
- Automated processing: 5-10 minutes
- Manual review: 25-40 minutes
- **Total: ~1.5 hours for 200-300 labeled frames**

---

## Prerequisites Checklist

Before your first recording session, ensure you have:

### Software Installed
- [ ] **Rust & Cargo** - Comes with Tauri or [install standalone](https://rustup.rs/)
- [ ] **FFmpeg** - Download from [ffmpeg.org](https://ffmpeg.org/download.html), add to PATH
- [ ] **Python 3.10+** - Download from [python.org](https://www.python.org/downloads/)
- [ ] **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- [ ] **Racing Simulator** - AMS2, ACC, iRacing, etc.

### Project Setup
- [ ] Cloned/navigated to this directory
- [ ] Ran `pnpm install` (or `npm install`)
- [ ] Ran `pip install -r requirements.txt`
- [ ] Created `.env` file from `.env.example`

### Recorder Ready
- [ ] Rust toolchain installed (`rustc --version` works)
- [ ] Windows 10 1803+ or Windows 11 (for Graphics Capture API)

---

## Part 1: Verify Setup (One-Time, ~2 minutes)

### Check Rust Installation

The native recorder is built with Rust/Tauri. Verify installation:

```bash
# Check Rust compiler
rustc --version
# Expected: rustc 1.70+ or later

# Check Cargo (Rust package manager)
cargo --version
# Expected: cargo 1.70+ or later
```

If not installed:
1. Visit https://rustup.rs/
2. Run installer
3. Restart terminal

### Verify Recorder Settings

The recorder auto-detects your game window and uses sensible defaults. To customize:

1. Open `config/recorder-settings.json`
2. Check/adjust settings:
   ```json
   {
     "default_settings": {
       "fps": 60,
       "quality": "high",  // low, medium, high
       "format": "mp4",
       "cursor_capture": true,
       "auto_detect_window": true
     }
   }
   ```
3. No changes needed for first recording

### Test Recorder (Optional)

```bash
# Quick test recording (captures for 5 seconds)
pnpm run test-recorder

# Expected output:
# ✓ Rust recorder compiled
# ✓ Windows Graphics Capture API available
# ✓ H.264 encoder initialized
# ✓ Test recording saved to data/recordings/test.mp4
```

**That's it!** No external apps or complex configuration. The recorder is built into the Tauri application.

### Validate Sim Profile

Before the first capture (or after editing `config/sim-profiles/*.json`), run:

```bash
pnpm run validate-profile -- --sim ams2
```

This ensures region presets, bookmark hotkeys, and window-title validation rules are sane. Fix any reported errors before recording.

---

## Part 2: Recording Session (~10 minutes)

### Pre-Recording Checklist

Before starting your recording:
- [ ] Close unnecessary applications (free up resources)
- [ ] Racing simulator is installed and launches successfully
- [ ] You know the menu flow you want to record (see suggestions below)
- [ ] Adequate storage space (~200MB for 10-minute recording)

### Menu Navigation Suggestions

**For AMS2 Championship Setup (comprehensive):**
1. Main Menu → Career/Championship
2. Create New Championship
3. Championship Settings (name, rounds, etc.)
4. Car Selection:
   - Browse different classes (GT3, GT4, Formula, etc.)
   - Click on 3-5 different cars
   - View car details
5. Track Selection:
   - Browse track list
   - Click on 5-7 different tracks
   - View track layouts (if applicable)
6. Weather Settings:
   - Adjust weather sliders
   - Change time of day
   - Toggle dynamic weather
7. Race Settings:
   - Adjust race length
   - Set AI difficulty
   - Configure assists
8. Review and Start (don't actually start race)

**Total navigation time: ~8-10 minutes**

### Bookmark Hotkeys & Notes

- Press `Ctrl+L` (default) whenever you hit an interesting UI transition; the recorder logs the timestamp + cursor coordinates in `.inputs.jsonl`.
- Profiles can swap the chord (e.g., `F5`, `Ctrl+Shift+B`) by editing `config/sim-profiles/<sim>.json` → `bookmarkHotkey.ctrl|shift|key`, then rerunning `pnpm run record-session --sim <name>`.
- Set `bookmarkHotkey.noteMode` to `stdin` if you want the CLI to prompt for a quick text note after each bookmark (press Enter to skip). Leave as `none` to avoid prompts.

### Capture Regions

- Each sim profile defines `capture.regionPresets` such as `full_ui` or `hud_strip`. The recorder uses `capture.defaultRegion` automatically.
- Override on the fly by appending `--region <preset>` when running `pnpm run record-session` (or `-- --region hud_strip` when passing additional args). FFmpeg crops the MP4 while recording so files stay lightweight.
- Use the same `--region` flag when calling `pnpm run process-recording` / `pnpm run extract-frames` to keep frame metadata aligned. Every frame JSON now includes `captureRegion` + `crop` for downstream automation.

### Starting the Recording

```bash
# Start recording script
pnpm run record-session

# Output:
# === UI Automation Recorder ===
# Starting native screen recorder...
# Auto-detecting game window...
# ✓ Found: Automobilista 2
# ✓ Recording started (1920x1080, 60fps)
#
# Instructions:
# 1. Navigate simulator menus naturally (no rush)
# 2. Cover all menu screens you want to automate
# 3. Press Ctrl+C when finished
```

**How it works:**
- Recorder automatically finds your game window by title
- Uses Windows Graphics Capture API (native, high-performance)
- Encodes to H.264 MP4 in real-time
- Minimal CPU/GPU overhead (~5% CPU, ~500MB RAM)

### During Recording

**Do:**
- Navigate menus at a natural pace (1-2 seconds per screen)
- Let each screen fully load before clicking
- Include menu animations/transitions
- Browse through options (cars, tracks, settings)
- Revisit important screens multiple times (variation is good)

**Don't:**
- Rush through menus (give time to capture clear frames)
- Press hotkeys or shortcuts excessively
- Minimize/alt-tab the game window
- Pause the recording mid-session

**Tips:**
- If you make a navigation mistake, just continue (we filter frames later)
- It's okay to hover over buttons without clicking
- Aim for 8-12 minutes of footage (sweet spot for variety)

### Stopping the Recording

When you've covered all menu screens:

```bash
# In the terminal running record-session:
# Press Ctrl+C

# Output:
# ✓ Recording stopped
# ✓ Video saved: data/recordings/ams2-2025-01-14-10-30.mp4
# ✓ Duration: 10:23
# ✓ Size: 197 MB
#
# Next steps:
# Run: pnpm run process-recording
```

### Verify Recording Quality

Before processing, quick verification:

1. Open the video file in VLC or Windows Media Player
2. Check:
   - [ ] Video plays smoothly (no major stuttering)
   - [ ] Resolution is 1920x1080
   - [ ] UI elements are clearly visible (not blurry)
   - [ ] No black bars or incorrect aspect ratio

If quality is poor, adjust OBS settings and re-record.

---

## Part 3: Automated Processing (~5-10 minutes)

This stage extracts frames, detects UI elements, and imports to Label Studio.

### Running the Processing Pipeline

```bash
pnpm run process-recording

# Output:
# === Processing Recording ===
# [1/4] Extracting frames...
#   Found video: ams2-recording-2025-01-14-10-30.mp4
#   Duration: 10:23
#   Extracting at 0.5 FPS with scene detection...
#   ████████████████████ 100% (623/623 seconds)
# ✓ Extracted 287 unique frames to data/captures/
#
# [2/4] Running pre-annotation (OmniParser)...
#   Loading model: microsoft/OmniParser...
#   Processing 287 frames...
#   ████████████████████ 100% (287/287 frames)
# ✓ Detected 2,145 UI elements (avg 7.5 per frame)
#
# [3/4] Importing to Label Studio...
#   Uploading images...
#   ████████████████████ 100% (287/287 images)
#   Attaching pre-annotations...
# ✓ Imported 287 tasks to project "AMS2 UI Elements"
#
# [4/4] Complete!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Review annotations at: http://localhost:8080
# Project: AMS2 UI Elements (ID: 1)
# Tasks: 287
# Estimated review time: 2-3 hours
```

> Tip: append `-- --region hud_strip` (or any preset name) if you want processing to assume a different viewport than the default defined in the profile.

### Verify Capture Integrity

After extraction (or before importing into Label Studio) you can sanity-check the capture directory:

```bash
pnpm run verify-capture -- --dir data/captures/<session-id>
```

The script reports frame counts, region distribution, and warns if any PNG is missing metadata (or vice versa). This is especially helpful when experimenting with new capture regions or scene thresholds.

> Need to tune FFmpeg scene detection before running the full pipeline? Use `pnpm run test-scene -- --video path/to/video.mp4 --sim ams2` to preview frame counts for different thresholds. Pass `--keep` to retain the temporary PNGs for manual inspection.

### Processing Time Breakdown

| Stage | Time (GPU) | Time (CPU only) |
|-------|-----------|----------------|
| Frame extraction | 2 min | 2 min |
| Pre-annotation | 3-4 min | 15-20 min |
| Import to Label Studio | 1 min | 1 min |
| **Total** | **6-7 min** | **18-23 min** |

### If Processing Fails

**Error: "FFmpeg not found"**
```bash
# Verify FFmpeg installation
ffmpeg -version

# If not found, download and add to PATH
# Restart terminal after installation
```

**Error: "OmniParser model download failed"**
```bash
# OmniParser is large (~5GB), ensure good internet
# Retry or use template matching fallback:
pnpm run process-recording --no-omniparser
```

**Error: "Label Studio connection refused"**
```bash
# Start Label Studio in separate terminal:
label-studio start

# Then retry processing
```

---

## Part 4: Manual Review in Label Studio (~25-40 minutes)

### First-Time Label Studio Setup

If this is your first time using Label Studio:

```bash
# Start Label Studio
label-studio start

# Opens in browser: http://localhost:8080
```

1. **Create Account:**
   - Email: `your@email.com` (local only, not validated)
   - Password: Create a password

2. **Project Already Created:**
   - The import script created "AMS2 UI Elements" project
   - Click on it to enter

3. **Familiarize with Interface:**
   - Left panel: Task list (all frames)
   - Center: Image with bounding boxes
   - Right panel: Labels and controls
   - Top: Progress bar and navigation

### Labeling Workflow

**For each frame (30 seconds average):**

1. **Review Pre-Annotations:**
   - OmniParser has already drawn bounding boxes
   - Boxes are color-coded by label type:
     - 🟥 Red = button
     - 🟦 Blue = text-field
     - 🟩 Green = dropdown
     - 🟧 Orange = tile-car
     - 🟪 Purple = tile-track
     - 🟨 Yellow = slider

2. **Correct Mistakes:**
   - **Wrong label:** Click box → Change label in right panel
   - **Wrong position:** Drag box or corners to resize
   - **False positive:** Click box → Press Delete

3. **Add Missing Elements:**
   - Click "Create Rectangle" (or press `R`)
   - Drag to draw bounding box around missed UI element
   - Select label from right panel

4. **Mark Screen Type:**
   - In right panel, select screen type:
     - main-menu
     - car-selection
     - track-selection
     - weather-setup
     - championship-config
     - etc.

5. **Submit:**
   - Click "Submit" button (top right)
   - Automatically moves to next frame

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Create rectangle (bounding box) |
| `Delete` | Delete selected box |
| `Ctrl+Enter` | Submit and move to next |
| `Ctrl+←/→` | Navigate prev/next task |
| `1-9` | Quick select label (order in config) |
| `Space` | Pan image (hold and drag) |
| `Ctrl+Wheel` | Zoom in/out |

### Quality Control Tips

**For best results:**
- Label ALL interactive elements (even small icons)
- Be consistent with label categories:
  - **button:** Clickable buttons (Career, OK, Cancel)
  - **tile-car/track:** Grid tiles for selection
  - **dropdown:** Combo boxes with down arrow
  - **text-field:** Editable input fields
  - **slider:** Horizontal/vertical sliders
- Draw tight bounding boxes (minimal padding)
- Mark screen-type for every frame (important for training)

**Common mistakes to watch for:**
- OmniParser labeling text as buttons
- Missing small icons or checkboxes
- Overlapping bounding boxes (split them)
- Incorrect screen-type classification

### Progress Tracking

Label Studio shows progress at top:
```
Progress: 47 / 287 (16%) • Estimated time remaining: 2h 10m
```

**Batch labeling tips:**
- Label in sessions (50-100 frames per sitting)
- Take breaks to maintain quality
- Review first 10-20 frames for consistency before continuing
- Use "Agreement" view to compare similar frames

---

## Part 5: Export Dataset

Once all frames are labeled:

### Export from Label Studio

```bash
pnpm run label-studio:export

# Output:
# === Exporting from Label Studio ===
# Fetching 287 completed annotations...
# Converting to training format...
# ✓ Exported to: data/labeled/ams2-ui-dataset-2025-01-14.json
#
# Dataset summary:
# • Frames: 287
# • Total elements: 2,543
# • Labels:
#   - button: 1,234 (48.5%)
#   - tile-car: 456 (17.9%)
#   - tile-track: 389 (15.3%)
#   - dropdown: 234 (9.2%)
#   - text-field: 156 (6.1%)
#   - slider: 74 (2.9%)
#
# Ready for training!
```

### Export Formats

Choose output format based on your use case:

```bash
# YOLO format (for YOLOv8 training)
pnpm run export:yolo

# COCO format (for various frameworks)
pnpm run export:coco

# Pascal VOC format (XML)
pnpm run export:voc

# Label Studio JSON (default, most flexible)
pnpm run export:labelstudio
```

---

## Part 6: Next Steps

### Training a Model

With your labeled dataset:

```bash
# Copy to ams2-race-setup-automation project
cp data/labeled/ams2-ui-dataset-*.json \
   ../ams2/ams2-race-setup-automation/data/training/

# Train YOLOv8 model (see ams2-race-setup-automation docs)
cd ../ams2/ams2-race-setup-automation
python scripts/train-yolo-detector.py
```

### Iterating and Improving

For better model accuracy:
1. **Record more sessions** covering edge cases:
   - Different game settings/themes
   - Different times of day (if UI changes)
   - Language variants (if targeting multiple languages)

2. **Augment dataset** (synthetic variations):
   ```bash
   pnpm run augment-dataset --brightness --contrast --scaling
   ```

3. **Active learning** (label uncertain predictions):
   ```bash
   pnpm run active-learning --model trained-model.pt
   # Suggests frames where model is uncertain
   ```

---

## Troubleshooting

### Recording Issues

**Problem: "Game window not found"**

Solution:
1. Ensure game is running and in a window/borderless windowed mode (not fullscreen)
2. Check window title in Task Manager matches pattern in `config/recorder-settings.json`
3. Manually specify window title:
   ```bash
   pnpm run record-session --window "Exact Window Title"
   ```

**Problem: Black screen in recording**

Solution:
1. Run game in borderless windowed mode (not exclusive fullscreen)
2. Update GPU drivers
3. Some games with anti-cheat may block capture - run in offline/practice mode

**Problem: Recording file size too large (>400MB for 10 min)**

Solution:
- Edit `config/recorder-settings.json`:
  ```json
  { "quality": "medium" }  // or "low"
  ```
- Medium quality uses 8Mbps (~150MB per 10 min)
- Low quality uses 5Mbps (~100MB per 10 min)

**Problem: Choppy/dropped frames during recording**

Solution:
- Record to SSD instead of HDD (faster write speeds)
- Close background applications
- Reduce bitrate to "medium" or "low" quality
- Check Task Manager for CPU/disk bottlenecks

### Processing Issues

**Problem: Pre-annotation accuracy <40%**

Solutions:
- AMS2 UI might be difficult for generic OmniParser model
- Option 1: Manually label first 50 frames, fine-tune OmniParser
- Option 2: Use template matching instead:
  ```bash
  pnpm run process-recording --use-templates
  ```
- Option 3: Skip pre-annotation, manually label all (slower but accurate)

**Problem: Out of memory during pre-annotation**

Solutions:
- Reduce batch size: Edit `scripts/batch_preannotate.py`, set `BATCH_SIZE=8`
- Use CPU inference: `pnpm run preannotate --device cpu`
- Process in chunks: `pnpm run preannotate --start 0 --end 100`

### Label Studio Issues

**Problem: Images not loading in Label Studio**

Solutions:
- Check data/captures/ directory has PNG files
- Verify Label Studio is running: `label-studio start`
- Check browser console for CORS errors
- Try re-importing: `pnpm run label-studio:import --force`

**Problem: Lost labeling progress**

Solutions:
- Label Studio auto-saves, but check browser storage not full
- Export frequently: `pnpm run label-studio:export --incremental`
- Backup Label Studio database:
  ```bash
  cp ~/.local/share/label-studio/label_studio.sqlite3 \
     data/backups/labelstudio-backup-$(date +%Y%m%d).sqlite3
  ```

---

## Tips for Efficient Recording Sessions

### Plan Your Navigation

Before recording, map out menu structure:
```
Main Menu
├── Career / Championship
│   ├── Create Championship
│   │   ├── Name + Settings
│   │   ├── Car Selection (browse 5-10 cars)
│   │   ├── Track Selection (browse 5-10 tracks)
│   │   ├── Weather Setup
│   │   └── Review
│   └── Load Championship
├── Quick Race
│   └── (similar flow)
└── Settings
    ├── Graphics
    ├── Controls
    └── Audio
```

### Maximize Dataset Variety

Record different scenarios:
- Different championship types (sprint, endurance)
- Different car classes (GT3, Formula, Prototype)
- Different track layouts (e.g., Monza GP vs Monza Junior)
- Scrolling through long lists (captures partial views)

### Batch Recording

If you need large datasets:
- Record multiple 10-min sessions across days
- Process all at once for consistent labeling
- Merge datasets:
  ```bash
  pnpm run merge-datasets data/labeled/ams2-session*.json
  ```

---

## Expected Outcomes

After completing this workflow once:

**Artifacts Created:**
- 1 video file (~500MB)
- ~300 extracted frames (~50MB)
- ~300 pre-annotated JSON files
- 1 labeled dataset JSON
- Training-ready data for ML models

**Time Investment:**
- Recording: 10 minutes
- Processing: 5-10 minutes (automated)
- Labeling: 2-3 hours (one-time)
- **Total: ~3 hours for first dataset**

**Subsequent recordings:**
- Only 10 min recording + 10 min labeling (easier with practice)
- Reuse same OBS setup and scripts

---

**Next:** See [LABELING-GUIDE.md](LABELING-GUIDE.md) for detailed labeling taxonomy and quality guidelines.
