# UI Automation Recorder - Technical Architecture

## Overview

The UI Automation Recorder is a **video-first, offline-processing** pipeline that converts natural menu navigation in racing simulators into labeled training datasets with minimal user effort.

**Design Philosophy:**
- **Zero overhead during recording** - Video capture only, no real-time analysis
- **Sim-agnostic** - Works with any game using pixel-based vision, no API access needed
- **AI-assisted labeling** - Pre-annotation reduces manual work by 70-80%
- **Modular pipeline** - Each stage can be run independently or swapped out

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    RECORDING PHASE (Live)                          │
│                      - Minimal CPU/GPU usage                       │
│                      - User navigates naturally                    │
└────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ Tauri Screen Recorder    │
                    │   (Rust/windows-capture) │
                    │   - H.264 1080p/60fps    │
                    │   - ~200MB per 10 min    │
                    │   - Native Tauri command │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │    Raw Video File        │
                    │ data/recordings/*.mp4    │
                    └──────────────────────────┘
                                   │
┌────────────────────────────────────────────────────────────────────┐
│                  PROCESSING PHASE (Offline)                        │
│                    - Run when convenient                           │
│                    - Fully automated                               │
└────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Frame Extractor        │
                    │   - FFmpeg CLI           │
                    │   - Scene detection      │
                    │   - 0.5-1 FPS extraction │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Extracted Frames        │
                    │  data/captures/*.png     │
                    │  (~300 frames)           │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Pre-Annotator           │
                    │  - OmniParser (GPU)      │
                    │  - or Template Match (CPU)│
                    │  - Bounding box detection│
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Pre-Annotations         │
                    │  data/preannotations/    │
                    │  (Label Studio JSON)     │
                    └──────────────────────────┘
                                   │
┌────────────────────────────────────────────────────────────────────┐
│                  REVIEW PHASE (Manual)                             │
│                  - 30 seconds per frame                            │
│                  - Correct AI mistakes                             │
└────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Label Studio Importer   │
                    │  - API upload            │
                    │  - Attach pre-annotations│
                    │  - Create tasks          │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Label Studio Web UI     │
                    │  http://localhost:8080   │
                    │  - Review bounding boxes │
                    │  - Add missing labels    │
                    │  - Mark screen types     │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Labeled Dataset         │
                    │  data/labeled/           │
                    │  (JSON + images)         │
                    └──────────────────────────┘
```

---

## Component Details

### 1. Tauri Screen Recorder

**Files:**
- `src-tauri/src/recording/mod.rs` - Tauri commands (public API)
- `src-tauri/src/recording/capturer.rs` - Screen capture logic
- `src-tauri/src/recording/encoder.rs` - H.264 encoder wrapper
- `src-tauri/src/recording/window_selector.rs` - Game window detection

**Responsibilities:**
- Detect game window by title pattern (automatic)
- Capture screen using Windows Graphics Capture API
- Encode frames to H.264 MP4 in real-time
- Expose Tauri commands for frontend control
- Handle recording lifecycle and state management

**API (Tauri Commands):**
```rust
#[tauri::command]
async fn start_recording(
    window_title: String,
    output_path: String,
) -> Result<(), String>

#[tauri::command]
async fn stop_recording() -> Result<String, String>  // Returns video path

#[tauri::command]
fn get_recording_status() -> RecordingStatus
```

**Frontend TypeScript API:**
```typescript
import { invoke } from '@tauri-apps/api';

async function startRecording(windowTitle: string, outputPath: string) {
  await invoke('start_recording', { windowTitle, outputPath });
}

async function stopRecording(): Promise<string> {
  return await invoke('stop_recording');
}
```

**Recording Configuration:**
- **Output:** MP4 container, H.264 codec
- **Resolution:** 1920x1080 (auto-detected from game window)
- **FPS:** 60fps (captures fast menu transitions)
- **Bitrate:** 12 Mbps high quality (configurable: 5/8/12 Mbps)
- **Capture API:** Windows Graphics Capture API (primary), DXGI Desktop Duplication (fallback)
- **Encoder:** Built-in H.264 encoder from windows-capture crate

**Dependencies:**
- **Rust:** `windows-capture = "1.5"` (includes VideoEncoder)
- **Rust:** `windows` crate for Win32 API bindings
- **TypeScript:** `@tauri-apps/api` (Tauri IPC)

**Advantages over OBS:**
- ✅ No external application to install/configure
- ✅ Direct Tauri command calls (<5ms latency vs ~50-100ms WebSocket)
- ✅ Smaller file sizes (~200MB vs ~500MB per 10 min at similar quality)
- ✅ Lower CPU/RAM overhead (native Rust vs Electron)
- ✅ Reusable for SimVox race replay recording (Highlights Editor feature)
- ✅ Single integrated app (better UX)

**Technical Details:**
See [NATIVE-RECORDER.md](./NATIVE-RECORDER.md) for complete implementation details, code examples, and troubleshooting.

---

### 2. Frame Extractor

**File:** `src/extraction/frameExtractor.ts`

**Responsibilities:**
- Extract frames from video at specified rate (0.5-1 FPS)
- Apply scene detection to filter duplicate/similar frames
- Save frames as PNG with timestamps
- Generate metadata JSON for each frame

**FFmpeg Command:**
```bash
ffmpeg -i recording.mp4 \
  -vf "fps=0.5,select='gt(scene,0.3)'" \
  -vsync vfr \
  data/captures/frame-%04d.png
```

**Scene Detection:**
- `gt(scene,0.3)` = Only keep frames where scene change > 30%
- Filters out static menu screens captured multiple times
- Reduces dataset from 600 frames → ~300 unique frames

**Output Format:**
```
data/captures/
├── frame-0001.png          # Main menu
├── frame-0001.json         # Metadata
├── frame-0023.png          # Career menu
├── frame-0023.json
└── ...
```

**Metadata Schema:**
```json
{
  "sourceVideo": "ams2-recording-2025-01-14.mp4",
  "timestamp": 12.5,
  "frameNumber": 750,
  "extractedAt": "2025-01-14T10:30:00Z",
  "resolution": [1920, 1080]
}
```

**Dependencies:**
- FFmpeg (system binary)
- `fluent-ffmpeg`: ^2.1.2 (Node wrapper)

---

### 3. Pre-Annotator

**File:** `scripts/batch_preannotate.py`

**Responsibilities:**
- Load OmniParser vision model
- Process each frame to detect UI elements
- Generate bounding boxes with labels
- Output Label Studio compatible JSON

**OmniParser Integration:**
```python
from omniparser import OmniParser
from PIL import Image

parser = OmniParser.from_pretrained('microsoft/OmniParser')

def preannotate_frame(image_path):
    image = Image.open(image_path)
    result = parser.parse(image)

    elements = []
    for detection in result.detections:
        elements.append({
            'bbox': detection.bbox,  # [x, y, w, h]
            'label': detection.label,  # button, text, dropdown, etc.
            'confidence': detection.confidence,
            'interactable': detection.interactable
        })

    return elements
```

**Label Taxonomy:**
```python
UI_LABELS = [
    'button',           # Clickable buttons
    'text-field',       # Input fields
    'dropdown',         # Selection dropdowns
    'tile-car',         # Car selection tiles
    'tile-track',       # Track selection tiles
    'slider',           # Adjustment sliders
    'checkbox',         # Toggle checkboxes
    'icon',             # Navigation icons
    'text-static',      # Read-only text
]
```

**Output Format (Label Studio):**
```json
{
  "annotations": [{
    "result": [
      {
        "type": "rectanglelabels",
        "value": {
          "x": 10.5,
          "y": 15.2,
          "width": 20.0,
          "height": 5.0,
          "rectanglelabels": ["button"]
        },
        "from_name": "label",
        "to_name": "image",
        "score": 0.95
      }
    ]
  }]
}
```

**Fallback: Template Matching (CPU-only)**

When OmniParser unavailable or too slow:

```python
import cv2
import numpy as np

def template_match_preannotate(frame_path, template_dir):
    frame = cv2.imread(frame_path)
    elements = []

    for template_file in os.listdir(template_dir):
        template = cv2.imread(os.path.join(template_dir, template_file))
        result = cv2.matchTemplate(frame, template, cv2.TM_CCOEFF_NORMED)
        locations = np.where(result >= 0.8)

        for pt in zip(*locations[::-1]):
            elements.append({
                'bbox': [pt[0], pt[1], template.shape[1], template.shape[0]],
                'label': template_file.replace('.png', ''),
                'confidence': result[pt[1], pt[0]]
            })

    return elements
```

**Dependencies:**
- `omniparser`: (GitHub install)
- `torch`, `transformers`: For OmniParser
- `opencv-python`: For template matching fallback
- `Pillow`: Image processing

---

### 4. Label Studio Importer

**File:** `src/labeling/labelStudioImporter.ts`

**Responsibilities:**
- Upload frames to Label Studio via REST API
- Attach pre-annotations to each task
- Create project if doesn't exist
- Handle batch imports efficiently

**API Integration:**
```typescript
class LabelStudioImporter {
  constructor(
    private apiUrl: string,
    private apiToken: string,
    private projectId: number
  ) {}

  async importFrameWithAnnotations(
    imagePath: string,
    preannotationPath: string
  ): Promise<number> {
    // 1. Upload image
    const taskId = await this.uploadImage(imagePath);

    // 2. Attach pre-annotation
    const annotation = JSON.parse(fs.readFileSync(preannotationPath));
    await this.createAnnotation(taskId, annotation);

    return taskId;
  }

  async batchImport(capturesDir: string): Promise<ImportResult> {
    const frames = glob.sync(`${capturesDir}/*.png`);

    for (const frame of frames) {
      const preannotation = frame.replace('.png', '-preannotated.json');
      await this.importFrameWithAnnotations(frame, preannotation);
    }
  }
}
```

**Label Studio Project Configuration:**

```xml
<!-- config/labelstudio-config.xml -->
<View>
  <Image name="image" value="$image"/>

  <RectangleLabels name="label" toName="image">
    <Label value="button" background="red"/>
    <Label value="text-field" background="blue"/>
    <Label value="dropdown" background="green"/>
    <Label value="tile-car" background="orange"/>
    <Label value="tile-track" background="purple"/>
    <Label value="slider" background="yellow"/>
    <Label value="checkbox" background="pink"/>
    <Label value="icon" background="cyan"/>
    <Label value="text-static" background="gray"/>
  </RectangleLabels>

  <Choices name="screen-type" toName="image" choice="single">
    <Choice value="main-menu"/>
    <Choice value="career-menu"/>
    <Choice value="car-selection"/>
    <Choice value="track-selection"/>
    <Choice value="weather-setup"/>
    <Choice value="championship-config"/>
    <Choice value="race-settings"/>
    <Choice value="other"/>
  </Choices>

  <TextArea name="notes" toName="image" placeholder="Additional notes..."/>
</View>
```

**Dependencies:**
- `axios`: ^1.6.0
- `form-data`: ^4.0.0

---

### 5. Orchestration Scripts

**File:** `scripts/record-session.ts`

Entry point for recording workflow:

```typescript
import { invoke } from '@tauri-apps/api';

async function main() {
  console.log('=== UI Automation Recorder ===');
  console.log('Starting native screen recorder...');

  const windowTitle = 'Automobilista 2';  // Auto-detected by pattern
  const outputPath = `data/recordings/ams2-${Date.now()}.mp4`;

  await invoke('start_recording', { windowTitle, outputPath });

  console.log('✓ Recording started');
  console.log('Navigate your simulator menus naturally');
  console.log('Press Ctrl+C when finished');

  // Wait for interrupt
  await waitForInterrupt();

  const savedPath = await invoke('stop_recording');
  console.log(`✓ Recording saved: ${savedPath}`);
  console.log('Run: pnpm run process-recording');
}
```

**File:** `scripts/process-recording.ts`

Automated processing pipeline:

```typescript
async function main() {
  const config = loadConfig();

  console.log('=== Processing Recording ===');

  // Step 1: Extract frames
  console.log('[1/4] Extracting frames...');
  const extractor = new FrameExtractor(config.videoPath);
  const frames = await extractor.extract({
    fps: 0.5,
    sceneThreshold: 0.3,
    outputDir: 'data/captures'
  });
  console.log(`✓ Extracted ${frames.length} frames`);

  // Step 2: Pre-annotate
  console.log('[2/4] Running OmniParser pre-annotation...');
  await exec('python scripts/batch_preannotate.py data/captures');
  console.log(`✓ Pre-annotated ${frames.length} frames`);

  // Step 3: Import to Label Studio
  console.log('[3/4] Importing to Label Studio...');
  const importer = new LabelStudioImporter(config.labelStudio);
  const result = await importer.batchImport('data/captures');
  console.log(`✓ Imported ${result.imported} tasks`);

  // Step 4: Summary
  console.log('[4/4] Complete!');
  console.log(`Review annotations: ${config.labelStudio.url}`);
  console.log(`Project: ${config.labelStudio.projectName}`);
}
```

---

## Data Flow

### Input
- User navigates simulator menus for 10 minutes
- Native recorder captures at 60fps → ~36,000 frames
- Video file: ~200-300MB (better compression than OBS)

### Stage 1: Frame Extraction
- FFmpeg samples at 0.5 FPS → 300 frames
- Scene detection filters to ~200 unique frames
- Output: 200 PNG files (~50MB total)

### Stage 2: Pre-Annotation
- OmniParser processes 200 frames in ~3 minutes (GPU)
- Detects ~2,000 UI elements total (~10 per frame)
- Accuracy: 60-80% (evaluated on test set)
- Output: 200 JSON files (~5MB total)

### Stage 3: Manual Review
- User reviews 200 frames in Label Studio
- Average 30 seconds per frame = 100 minutes total
- Corrects ~20-40% of bounding boxes
- Adds ~10-20% missing elements

### Final Output
- 200 fully labeled frames
- ~2,500 UI elements with labels
- Training-ready dataset for YOLOv8, Florence-2, etc.

---

## Performance Characteristics

| Stage | Duration | CPU | GPU | Automation |
|-------|----------|-----|-----|------------|
| Recording | 10 min | Low | Low (encoder) | Manual |
| Frame extraction | 2 min | High | None | Full |
| Pre-annotation | 3 min | Low | High | Full |
| Import | 30 sec | Low | None | Full |
| Review | 100 min | Low | None | AI-assisted |
| **Total** | **115 min** | - | - | **87% automated** |

Compare to manual:
- Manual screenshot + labeling: ~6-8 hours
- This pipeline: ~2 hours (65% time savings)

---

## Technology Stack

### Recording
- **Rust** - Native screen recorder implementation
- **windows-capture** (Rust crate) - Screen capture + H.264 encoding
- **Tauri 2.0** - Desktop framework, IPC between Rust and TypeScript
- **@tauri-apps/api** - Frontend API for invoking Rust commands

### Processing
- **FFmpeg** - Video frame extraction
- **OmniParser** - UI element detection (optional, recommended)
- **OpenCV** - Template matching (fallback)

### Labeling
- **Label Studio** - Annotation web UI
- **Label Studio SDK** - API integration

### Orchestration
- **TypeScript + ts-node** - Pipeline scripts
- **Python 3.10+** - ML model inference

### Storage
- **Local filesystem** - All data stays on user's machine
- **No cloud dependencies** - Privacy-first design

---

## Extensibility

### Adding New Vision Models

Replace OmniParser in `scripts/batch_preannotate.py`:

```python
# Option 1: Use SAM + YOLO
from ultralytics import YOLO, SAM
yolo = YOLO('yolov8n.pt')
sam = SAM('mobile_sam.pt')

# Option 2: Use Florence-2
from transformers import Florence2ForConditionalGeneration
model = Florence2ForConditionalGeneration.from_pretrained('microsoft/Florence-2')

# Option 3: Use Qwen2.5-VL
from transformers import Qwen2VLForConditionalGeneration
model = Qwen2VLForConditionalGeneration.from_pretrained('Qwen/Qwen2-VL-7B')
```

### Supporting Other Sims

No code changes needed - the pipeline is pixel-based:
1. Add sim window title pattern to `config/recorder-settings.json`
2. Record menu navigation (auto-detects window)
3. Process identically
4. Label taxonomy may differ (adjust config/labelstudio-config.xml)

### Export Formats

Add exporters in `src/labeling/exporters/`:
- `yoloExporter.ts` - YOLOv8 format (txt bounding boxes)
- `cocoExporter.ts` - COCO JSON format
- `pascalVocExporter.ts` - XML format
- `tfRecordExporter.ts` - TensorFlow training format

---

## Integration with AMS2 Race Setup Automation

This tool generates the training data consumed by the automation POC:

```
ui-automation-recorder/                  ams2-race-setup-automation/
└── data/labeled/                       └── data/
    └── ams2-ui-dataset-2025-01.json       └── trained-models/
                                               └── ams2-ui-detector.pt

Flow:
1. Record AMS2 menus → labeled dataset
2. Train YOLOv8/Florence-2 on dataset
3. Deploy trained model in automation POC
4. Automation uses model to understand menu state

---

## Input Telemetry Logger

- Hooks Windows Raw Input to capture cursor coordinates, mouse clicks, bookmark hotkeys, and focused window titles during recording.
- Outputs `*.inputs.jsonl` next to each MP4 with `{timestamp, cursor, key, simProfile, note}` entries.
- `scripts/process-recording.ts` aligns extracted frames with the nearest telemetry entry to produce per-frame metadata consumed by downstream planners.
- Bookmark hotkey defaults to `Ctrl+L` but is configurable per profile; when enabled, an optional prompt lets the user annotate the bookmark.

## Sim Profile Manager

- Profiles live in `config/sim-profiles/*.json` and define window detection, capture region presets, scene thresholds, taxonomy hints, and detector choices.
- Recorder CLI flag `--sim <name>` loads the profile everywhere (recorder, extractor, annotator, labeler) so adding a new sim is as simple as dropping a profile file.
- Profiles also map sim-specific labels (e.g., `car_tile`, `weather_slot`) so both the mini labeler and Label Studio stay consistent.
- Region presets expose named crops (full UI vs HUD-only) so future Graphics Capture + automation stages can swap viewports without editing code.
- `pnpm run validate-profile -- --sim <name>` runs schema/semantic checks (window title patterns, capture regions, required processes) before shipping new configs.

## Minimal Labeler (Tauri)

- Lightweight reviewer for the dataset schema; launch via `pnpm run labeler`.
- Supports bounding box edit, class dropdown, bookmark navigation, quick flagging, and auto-advance.
- Ideal for single-user passes or when Label Studio isn’t installed; still allows exporting/importing to Label Studio for collaborative QA.

## Detection Fallback Path

- Default path uses OmniParser (GPU). If OmniParser isn’t available, the pipeline switches to Template Matching + PaddleOCR driven by sim profiles.
- Template assets provide bounding box seeds, PaddleOCR labels text-only controls, and the resulting confidence scores guide annotators to focus on low-confidence frames first.

## Frame Extraction Service

- `src/extraction/frameExtractor.ts` runs FFmpeg with scene detection + FPS throttling to write PNG frames into `data/captures/<sessionId>`.
- `scripts/extract-frames.ts` and `scripts/process-recording.ts` are the CLI entry points for extracting directly from MP4 or as part of the full processing pipeline.
- `src/extraction/metadataWriter.ts` writes per-frame JSON metadata (index, sim, resolution, source video) used by downstream annotators/exporters.

## Pre-Annotation Adapter

- `scripts/batch_preannotate.py` (Python) generates Label Studio prediction JSON from captures (OmniParser placeholder).
- `src/annotation/omniparserAdapter.ts` exposes a Node API to run the batch script from any CLI or service (process-recording, CI, etc.).

## Label Studio Integration

- `src/labeling/labelStudioClient.ts` wraps LS REST endpoints.
- `scripts/import-to-labelstudio.ts` loads captures + metadata and pushes them into a project (embedded backend by default).
- `scripts/export-from-labelstudio.ts` downloads reviewed datasets back into `data/labeled/`.

## Dataset Exporters

- YOLO exporter: `scripts/exporters/yolo-exporter.ts` converts Label Studio JSON into YOLO txt files + label map.
- COCO/VOC/TFRecord exporters will use the same metadata schema (outlined in checklist; implementation TBD).
```

---

## Security & Privacy

- **Local-only processing** - No data leaves user's machine
- **No telemetry** - No analytics or tracking
- **No cloud APIs** - Unless user opts in (e.g., cloud inference)
- **Sensitive data** - User may capture championship names, account info - stays local

---

## Future Enhancements

### Phase 2
- Active learning: Flag low-confidence annotations for review
- Dataset versioning and diffs
- Multi-monitor support
- Resume interrupted processing

### Phase 3
- GUI application (Electron/Tauri wrapper)
- Real-time pre-annotation during recording (if GPU idle)
- Dataset augmentation (brightness, contrast, scaling)
- Synthetic data generation from templates

### Phase 4
- Crowdsourced labeling for SimVox community
- Pre-trained models for common sims (AMS2, ACC, iRacing)
- Integration with AutoHotkey replay scripts
- CI/CD for dataset validation

---

**Next:** See [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) for build progress.
## Embedded Label Studio Frontend

- Bundle the open-source Label Studio frontend directly inside the recorder’s Tauri app (option 2).
- Build the LS frontend (`npm run build` in upstream repo) and serve assets from `apps/recorder/public/labelstudio/`.
- Run the LS backend as a Tauri sidecar (`label-studio start --host 127.0.0.1 --port 8808 --no-browser`).
- Recorder UI exposes a tab (`/labelstudio`) rendering the bundled LS UI in a WebView that talks to the embedded backend (`http://127.0.0.1:8808`).
- Auto-provision LS users/projects via REST on startup, inject auth tokens so reviewers never leave the recorder window.
- Provide configuration to switch between the embedded backend and an external LS instance if teams need to collaborate remotely.
