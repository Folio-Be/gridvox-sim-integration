# AMS2 Telemetry Track Generator - Features & UI Specification

## Complete Feature List

### 🎯 Core Features (MVP - Week 1)

#### Telemetry Recording & Management
- ✅ **3-Run Recording Workflow**
  - Outside border lap recording
  - Inside border lap recording
  - Racing line lap recording
  - Live telemetry display during recording
  - Real-time 2D path visualization
  - Automatic file saving (JSON format)

- ✅ **File Import/Management**
  - Load existing telemetry JSON files
  - File format validation
  - Telemetry data completeness check
  - Session metadata capture (track name, car, date, game version)
  - File naming convention enforcement

#### Track Alignment & Processing
- ✅ **Automatic Start/Finish Detection**
  - Method 1: Lap distance reset detection
  - Method 2: Lap number increment detection
  - Method 3: Sector reset detection
  - Cross-validation (3 methods → confidence score)

- ✅ **Run Alignment**
  - Rotate all runs to common start point
  - Uniform resampling (1000 points per run)
  - Alignment quality scoring (0.0-1.0)
  - Visual alignment diagnostics

#### Track Surface Generation
- ✅ **3D Mesh Generation**
  - CatmullRomCurve3 path from boundary points
  - Triangulated mesh (quad strips between curves)
  - Variable track width through corners
  - Elevation profile from Y coordinates
  - Dark asphalt material (roughness/metalness)

- ✅ **Racing Line Overlay**
  - Green line above track surface
  - Smooth curve interpolation
  - Visual reference for optimal path

#### Basic Feature Detection
- ✅ **Track Features**
  - Start/finish line marker (checkered flag)
  - Sector boundaries (S1=Blue, S2=Yellow, S3=Red)
  - Track surface with proper materials

#### Export & Output
- ✅ **File Export**
  - glTF 2.0 (.glb) 3D model
  - Metadata JSON (track info + features)
  - Organized scene hierarchy
  - Feature markers folder

---

### 🚀 Advanced Features (Week 2)

#### Advanced Feature Detection
- ✅ **Corner Detection & Classification**
  - Automatic corner numbering (T1, T2, T3...)
  - Entry/apex/exit point detection
  - Corner classification:
    - Flat-out (>200 km/h)
    - Fast sweeper (150-200 km/h)
    - Medium-speed (100-150 km/h)
    - Slow corner (50-100 km/h)
    - Hairpin (<50 km/h, >90° turn)
    - Chicane (multiple direction changes)
    - Kink (slight direction change)
  - Corner radius estimation
  - Speed through corner analysis

- ✅ **Track Element Detection**
  - Curb detection (elevation spikes + terrain type)
  - Pit lane extraction (entry, path, exit)
  - Braking zones (deceleration analysis)
  - Speed zones (high/medium/low classification)
  - Elevation & banking detection
  - Runoff area detection (grass, gravel, asphalt)

#### Environmental Features
- ✅ **Weather & Conditions**
  - Track temperature heatmap
  - Weather conditions capture (rain, wind, cloud)
  - Ambient temperature recording

#### Optimization & Enhancement
- ✅ **File Optimization**
  - Draco mesh compression (80% reduction)
  - Texture optimization
  - Mesh simplification (LOD)
  - Remove unused data
  - File size comparison (before/after)

- ✅ **AI Track Enrichment** (Optional)
  - Corner names via Gemini API
  - Building generation (satellite + OSM)
  - Historical documentation gathering
  - Famous moments/lap records

#### Validation & Testing
- ✅ **Quality Checks**
  - Track quality validation
  - Closed loop verification
  - Geometry error detection
  - Alignment confidence scoring
  - Visual preview/inspection

---

## User Interface Design

### Application Architecture

**Platform**: Tauri v2 Desktop Application
**Frontend**: React 19 + TypeScript + Vite
**Backend**: Python FastAPI (port 8000)
**Telemetry**: C++ Native Addon (shared memory)
**3D**: Three.js (WebGL renderer)

### Screen Flow Diagram

```
┌─────────────┐
│   Welcome   │ ──→ New Track ──→ ┌──────────────┐
│   Screen    │                   │ Project Setup│
└─────────────┘                   └──────┬───────┘
       │                                 │
       │                                 ▼
       │                          ┌──────────────┐
       │                          │ Recording    │
       │                          │ Instructions │
       │                          └──────┬───────┘
       │                                 │
       │                                 ▼
       │                          ┌──────────────┐
       │                          │ Run 1:       │
       │                          │ Outside      │
       │                          │ Border       │
       │                          └──────┬───────┘
       │                                 │
       │                                 ▼
       │                          ┌──────────────┐
       │                          │ Run 2:       │
       │                          │ Inside       │
       │                          │ Border       │
       │                          └──────┬───────┘
       │                                 │
       │                                 ▼
       │                          ┌──────────────┐
       │                          │ Run 3:       │
       │                          │ Racing Line  │
       │                          └──────┬───────┘
       │                                 │
       └──→ Load Files ──────────────────┤
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Processing & │
                                  │ Generation   │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ 3D Preview & │
                                  │ Validation   │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Export       │
                                  │ Options      │
                                  └──────────────┘
```

### Detailed Screen Specifications

#### Screen 1: Welcome/Home Screen

**Purpose**: Entry point for new projects or loading existing files
**Size**: 1200x800px (minimum)
**Theme**: Dark (#0a0a0a background)

**Layout**:
```
┌────────────────────────────────────────────────┐
│ 🏁 SimVox.ai TRACK GENERATOR         [─][□][×] │ ← Custom title bar
├────────────────────────────────────────────────┤
│                                                │
│                                                │
│         [SimVox.ai Logo - Large Icon]            │
│                                                │
│      AMS2 Telemetry Track Generator            │
│      Generate 3D tracks from telemetry         │
│                                                │
│                                                │
│   ┌──────────────────────┐ ┌─────────────────┐│
│   │  📁 New Track        │ │  📂 Load Files  ││
│   │                      │ │                 ││
│   │  Start 3-Run         │ │  Import Existing││
│   │  Recording Workflow  │ │  Telemetry Data ││
│   │                      │ │                 ││
│   │  [Start Recording]   │ │  [Browse Files] ││
│   └──────────────────────┘ └─────────────────┘│
│                                                │
│   Recent Projects:                             │
│   ┌──────────────────────────────────────────┐ │
│   │ 📁 Silverstone GP          2 hours ago   │ │
│   │    18 corners • 5,891m • 3 sectors       │ │
│   ├──────────────────────────────────────────┤ │
│   │ 📁 Spa-Francorchamps      Yesterday      │ │
│   │    19 corners • 7,004m • 3 sectors       │ │
│   └──────────────────────────────────────────┘ │
│                                                │
│                         [Settings] [Help] [?]  │
└────────────────────────────────────────────────┘
```

**Components**:
- Custom title bar (frameless window, drag-to-move)
- Large icon/logo (centered, 120x120px)
- Two primary action cards (400x250px each)
  - Card 1: New Track (lime accent)
  - Card 2: Load Files (cyan accent)
- Recent projects list (clickable, shows metadata)
- Bottom toolbar (settings, help, about)

---

#### Screen 2: Project Setup

**Purpose**: Gather track metadata and configure recording method
**Modal**: Yes (overlays welcome screen)
**Size**: 600x500px

**Layout**:
```
┌────────────────────────────────────────┐
│ New Track Project              [×]     │
├────────────────────────────────────────┤
│                                        │
│  Track Information                     │
│  ┌────────────────────────────────────┐│
│  │ Track Name: *                      ││
│  │ [Silverstone________________]      ││
│  │                                    ││
│  │ Variation: (optional)              ││
│  │ [GP Circuit_________________]      ││
│  │                                    ││
│  │ Location: (optional)               ││
│  │ [United Kingdom_____________]      ││
│  │                                    ││
│  │ Notes:                             ││
│  │ [________________________]         ││
│  │ [________________________]         ││
│  └────────────────────────────────────┘│
│                                        │
│  Recording Method                      │
│  ┌────────────────────────────────────┐│
│  │ ● Manual 3-Run Recording           ││
│  │   Record live from AMS2            ││
│  │                                    ││
│  │ ○ Load Existing Telemetry Files    ││
│  │   Import pre-recorded JSON         ││
│  └────────────────────────────────────┘│
│                                        │
│  Output Directory                      │
│  [C:\SimVox.ai\Tracks\________] [Browse] │
│                                        │
│                                        │
│           [Cancel] [Next: Recording →] │
└────────────────────────────────────────┘
```

**Validation**:
- Track name required (no special chars except hyphen/underscore)
- Output directory must exist or be creatable
- Auto-suggest track names from AMS2 track list

---

#### Screen 3: Recording Instructions

**Purpose**: Visual guide for 3-run recording method
**Size**: Full window (1200x800px)
**Navigation**: Tab-based (Run 1 / Run 2 / Run 3)

**Layout** (Run 1 example):
```
┌────────────────────────────────────────────────┐
│ 3-Run Recording Guide                  [×]     │
├────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐                      │
│  │ 1/3 │ │ 2/3 │ │ 3/3 │  ← Tab navigation    │
│  │ ● │ │ ○ │ │ ○ │                      │
│  └─────┘ └─────┘ └─────┘                      │
│                                                │
│  Run 1: Outside Border                         │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │    [Animated Track Diagram - SVG/Canvas] │  │
│  │                                          │  │
│  │         ═══════════════════              │  │
│  │        ║                   ║             │  │
│  │        ║    🏎️ ←─ Car on   ║             │  │
│  │        ║       outer edge  ║             │  │
│  │         ═══════════════════              │  │
│  │                                          │  │
│  │    [Animation shows car following        │  │
│  │     white line around track perimeter]   │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  📋 Instructions:                              │
│  • Stay on the OUTSIDE edge of the track      │
│  • Follow the white line / track boundary     │
│  • Don't cut corners or go off track          │
│  • Drive at ~50% race pace (smooth & consistent)│
│  • Complete ONE full lap                       │
│                                                │
│  💡 Tips:                                      │
│  ┌──────────────────────────────────────────┐  │
│  │ • Imagine you're driving a wide truck    │  │
│  │ • Lap time doesn't matter - consistency  │  │
│  │   is what counts                         │  │
│  │ • If you make a mistake, just restart    │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ⏱ Estimated time: 2-3 minutes per lap        │
│                                                │
│                                                │
│         [← Back to Setup] [Start Recording →]  │
└────────────────────────────────────────────────┘
```

**Interactive Elements**:
- Animated track diagram (continuous loop showing car path)
- Tab navigation (click to preview other runs)
- Color-coded instructions (lime for actions, gray for tips)

---

#### Screen 4: Live Recording

**Purpose**: Real-time telemetry capture with visual feedback
**Size**: Full window (1200x800px)
**Update Frequency**: 10Hz (100ms refresh)

**Layout**:
```
┌────────────────────────────────────────────────┐
│ Recording: Run 1 - Outside Border      [×]     │
├────────────────────────────────────────────────┤
│  Status: 🔴 RECORDING                          │
│  ┌──────────────────────────────────────────┐  │
│  │ Connection: ✅ Connected to AMS2         │  │
│  │ Track: Silverstone GP                    │  │
│  │ Lap Progress: ████████████░░░░░ 65%      │  │
│  │ Lap Distance: 3,845m / 5,891m            │  │
│  │ Data Points: 1,247                       │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────┬──────────────────────────┐│
│  │                 │  Live Telemetry          ││
│  │                 │  ┌────────┬────────┬────┐││
│  │                 │  │ Speed  │Position│Lap ││
│  │                 │  │ 187    │ Sector │1/1 ││
│  │  Track Map 2D   │  │ km/h   │   2    │    ││
│  │                 │  └────────┴────────┴────┘││
│  │    ┌─────┐      │                          ││
│  │    │     │      │  ┌────────┬────────┬────┐││
│  │   ╱       ╲     │  │ X:1245 │ Y: 12  │Z:  ││
│  │  │         │    │  │        │        │3421││
│  │  │    •    │    │  └────────┴────────┴────┘││
│  │   ╲       ╱     │                          ││
│  │    └─────┘      │  Recording Time: 1m 32s  ││
│  │                 │                          ││
│  │  [Path being    │                          ││
│  │   drawn in      │                          ││
│  │   real-time]    │                          ││
│  └─────────────────┴──────────────────────────┘│
│                                                │
│  Debug Log:                                    │
│  ┌──────────────────────────────────────────┐  │
│  │ [16:42:31] ✅ Connected to shared memory │  │
│  │ [16:42:32] ℹ️  Lap started                │  │
│  │ [16:42:45] ℹ️  Sector 1 completed         │  │
│  │ [16:43:12] ℹ️  Sector 2 completed         │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│                      [⏹ Stop & Save Recording] │
└────────────────────────────────────────────────┘
```

**Components**:
- Status banner (recording indicator, pulsing red dot)
- Connection status (live update)
- Progress bar (based on lap distance)
- 2D track map (Canvas, draws path in real-time)
- Telemetry cards (POC-06 style, dark cards with metrics)
- Debug console (scrollable, monospace, color-coded)
- Stop button (large, prominent)

**Data Captured**:
- `mWorldPosition[3]` (X, Y, Z coordinates)
- `mSpeed` (km/h)
- `mCurrentLapDistance`
- `mTrackLength`
- `mCurrentSector`
- Timestamp (milliseconds)

---

#### Screen 5: Processing & Generation

**Purpose**: Show progress of alignment and track generation
**Size**: Full window (1200x800px)
**Auto-proceed**: Yes (to preview when complete)

**Layout**:
```
┌────────────────────────────────────────────────┐
│ Generating Track: Silverstone GP       [×]    │
├────────────────────────────────────────────────┤
│                                                │
│  Processing Pipeline                           │
│  ┌──────────────────────────────────────────┐  │
│  │ ✅ Loaded telemetry files (3/3)          │  │
│  │ ✅ Validated run data                    │  │
│  │ ⏳ Aligning runs...                      │  │
│  │    ├─ Finding start/finish ███████░ 85%  │  │
│  │    ├─ Rotating to start    ██████░░ 70%  │  │
│  │    └─ Resampling points    ░░░░░░░░  0%  │  │
│  │ ⏸️ Track surface generation (pending)    │  │
│  │ ⏸️ Feature detection (pending)           │  │
│  │    ├─ Sectors                            │  │
│  │    ├─ Corners                            │  │
│  │    ├─ Curbs                              │  │
│  │    ├─ Braking zones                      │  │
│  │    └─ Speed zones                        │  │
│  │ ⏸️ Export glTF (pending)                 │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  Alignment Quality                             │
│  ┌──────────────────────────────────────────┐  │
│  │ Confidence Score: 0.95 / 1.0             │  │
│  │ ┌────────────────────────────────────┐   │  │
│  │ │████████████████████░ 95%           │   │  │
│  │ └────────────────────────────────────┘   │  │
│  │                                          │  │
│  │ ✅ All 3 detection methods agree         │  │
│  │ ✅ Track lengths match within 2m         │  │
│  │ ✅ Runs aligned to common start          │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ⏱ Estimated time remaining: 45 seconds       │
│                                                │
│  Processing Log:                               │
│  ┌──────────────────────────────────────────┐  │
│  │ [16:42:31] ✅ Start/finish detected at...│  │
│  │ [16:42:32] ✅ Outside run rotated to...  │  │
│  │ [16:42:33] ⏳ Resampling inside run...   │  │
│  │ [16:42:34] ⏳ Processing points 500/1000 │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│                         [Cancel Processing]    │
└────────────────────────────────────────────────┘
```

**Progress Updates**:
- Hierarchical progress tree (expandable sub-steps)
- Individual progress bars per sub-step
- Confidence score meter (color-coded: >0.9=lime, 0.7-0.9=yellow, <0.7=red)
- Live log console (updates every 100ms)
- Time estimate (calculated from processing speed)

---

#### Screen 6: 3D Preview & Validation

**Purpose**: Interactive 3D visualization with quality checks
**Size**: Full window (1200x800px)
**Renderer**: Three.js WebGL

**Layout**:
```
┌────────────────────────────────────────────────┐
│ Track Preview: Silverstone GP          [×]    │
├────────────────────────────────────────────────┤
│  ┌────┬──────────────────────────────────────┐ │
│  │    │                                      │ │
│  │ L  │   [3D Track Viewer - Three.js]       │ │
│  │ a  │                                      │ │
│  │ y  │    🏁──────────────────┐             │ │
│  │ e  │   ║                    ║             │ │
│  │ r  │   ║  [Interactive      ║             │ │
│  │ s  │   ║   3D Track]        ║             │ │
│  │    │   ║                    ║             │ │
│  │ ☑  │    └──────────────────🏁             │ │
│  │Sur │                                      │ │
│  │ ☑  │   [Orbit Controls: Click+Drag]       │ │
│  │Line│   [Zoom: Scroll Wheel]               │ │
│  │ ☑  │                                      │ │
│  │Sec │   Camera: Free View  [Reset View]    │ │
│  │ ☑  │                                      │ │
│  │Cor │                                      │ │
│  │ □  │                                      │ │
│  │Curb│                                      │ │
│  │ □  │                                      │ │
│  │Brak│                                      │ │
│  │ □  │                                      │ │
│  │Pit │                                      │ │
│  │ □  │                                      │ │
│  │Grid│                                      │ │
│  └────┴──────────────────────────────────────┘ │
│                                                │
│  Track Statistics                              │
│  Length: 5,891m | Corners: 18 | Sectors: 3     │
│  Elevation: +12m to -5m (17m range)            │
│                                                │
│  Validation Results                            │
│  ┌──────────────────────────────────────────┐  │
│  │ ✅ Track forms closed loop                │  │
│  │ ✅ No geometry errors                     │  │
│  │ ✅ All features detected successfully     │  │
│  │ ⚠️  Pit lane not recorded                 │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│        [← Re-process] [Export Track →]         │
└────────────────────────────────────────────────┘
```

**3D Viewer Features**:
- Orbit controls (click+drag to rotate)
- Zoom (scroll wheel)
- Pan (right-click+drag)
- Camera presets: Top view, Side view, Free cam
- Grid floor (toggleable)
- Lighting: Ambient + directional

**Layer Toggles** (Sidebar):
- Track Surface (mesh)
- Racing Line (green line)
- Sectors (colored markers)
- Corners (numbered markers)
- Curbs (red/white geometry)
- Braking Zones (red cones)
- Pit Lane (gray path)
- Grid (reference floor)

**Validation Panel**:
- Checklist with color-coded results
- Warnings (orange) vs Errors (red)
- Click to view details

---

#### Screen 7: Export Options

**Purpose**: Configure export format and AI enrichment
**Modal**: Yes (overlays preview screen)
**Size**: 600x650px

**Layout**:
```
┌────────────────────────────────────────┐
│ Export Track                   [×]     │
├────────────────────────────────────────┤
│                                        │
│  Output Format                         │
│  ┌────────────────────────────────────┐│
│  │ ○ Standard (.glb)      ~8.2 MB     ││
│  │   No optimization                  ││
│  │                                    ││
│  │ ● Optimized (.glb)     ~2.1 MB     ││
│  │   Draco compression + mesh simplif ││
│  │                                    ││
│  │ ○ Web Optimized (.glb) ~850 KB     ││
│  │   Aggressive optimization (mobile) ││
│  └────────────────────────────────────┘│
│                                        │
│  Optimization Settings                 │
│  ┌────────────────────────────────────┐│
│  │ ☑ Draco mesh compression           ││
│  │ ☑ Mesh simplification              ││
│  │ ☑ Texture optimization             ││
│  │ □ Remove debug markers             ││
│  │ □ Merge similar meshes             ││
│  └────────────────────────────────────┘│
│                                        │
│  AI Enrichment (Optional)              │
│  ┌────────────────────────────────────┐│
│  │ ☑ Add corner names (Gemini API)    ││
│  │   Uses Wikipedia + track maps      ││
│  │                                    ││
│  │ □ Generate buildings (experimental)││
│  │   Requires satellite data API      ││
│  │                                    ││
│  │ □ Include historical documentation ││
│  │   Track history, famous moments    ││
│  └────────────────────────────────────┘│
│                                        │
│  Gemini API Key (for enrichment):      │
│  [••••••••••••••••••••••] [Set Key]    │
│  ℹ️  Free tier: Unlimited reasonable use│
│                                        │
│  Output Directory                      │
│  [C:\SimVox.ai\Tracks\Silverstone] [...] │
│                                        │
│  Files to be created:                  │
│  ┌────────────────────────────────────┐│
│  │ 📄 silverstone.glb                 ││
│  │ 📄 silverstone-metadata.json       ││
│  │ 📁 silverstone-features/           ││
│  │    ├─ corners.json                 ││
│  │    ├─ sectors.json                 ││
│  │    └─ zones.json                   ││
│  └────────────────────────────────────┘│
│                                        │
│           [Cancel] [Export Track]      │
└────────────────────────────────────────┘
```

**Export Process**:
1. Show progress modal (similar to processing screen)
2. Apply optimizations (if selected)
3. Call AI enrichment APIs (if enabled)
4. Write files to disk
5. Show success toast with file path
6. Option to "Open in Explorer" or "View in Viewer"

---

## Design System Specification

### Color Palette

**Background**:
- Primary: `#0a0a0a`
- Cards: `#1a1a1a`
- Nested cards: `#0d0d0d`
- Borders: `#333333`
- Hover borders: `#555555`

**Text**:
- Primary: `#e0e0e0`
- Secondary: `#aaaaaa`
- Muted: `#666666`
- White: `#ffffff`

**Accent Colors**:
- Success: `#51cf66` (lime)
- Error: `#ff6b6b` (red)
- Warning: `#ffd43b` (orange)
- Info: `#339af0` (cyan)
- Recording: `#ff0000` (red, pulsing)

**Track Feature Colors**:
- Racing line: `#00ff00` (bright green)
- Sector 1: `#3b82f6` (blue)
- Sector 2: `#fbbf24` (yellow)
- Sector 3: `#ef4444` (red)
- Corners: `#a855f7` (purple)
- Curbs: `#ffffff` + `#ff0000` (alternating)
- Braking zones: `#ff6b6b` (red)

### Typography

**Font Family**: System UI stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Helvetica', 'Arial', sans-serif;
```

**Font Sizes**:
- H1 (Screen titles): `1.5rem` (24px)
- H2 (Section headers): `1.25rem` (20px)
- H3 (Subsections): `1.1rem` (17.6px)
- Body: `0.95rem` (15.2px)
- Small: `0.85rem` (13.6px)
- Tiny: `0.75rem` (12px)

**Font Weights**:
- Bold (headers): `600`
- Medium (emphasis): `500`
- Normal (body): `400`

**Monospace** (logs, code):
```css
font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
font-size: 0.85rem;
```

### Spacing System

**Base unit**: `0.25rem` (4px)

- XS: `0.25rem` (4px)
- S: `0.5rem` (8px)
- M: `0.75rem` (12px)
- L: `1rem` (16px)
- XL: `1.5rem` (24px)
- 2XL: `2rem` (32px)
- 3XL: `3rem` (48px)

**Card padding**: `1rem`
**Card gap**: `1rem`
**Button padding**: `0.75rem 1.5rem`
**Input padding**: `0.5rem 0.75rem`

### Border Radius

- Small (inputs): `4px`
- Medium (cards): `6px`
- Large (modals): `8px`
- XL (buttons): `6px`

### Shadows

**Card shadow**:
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

**Modal shadow**:
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
```

**Button hover**:
```css
box-shadow: 0 4px 12px rgba(81, 207, 102, 0.3);
```

### Component Styles

#### Button (Primary)
```css
background: #51cf66;
color: #0a0a0a;
border: none;
padding: 0.75rem 1.5rem;
border-radius: 6px;
font-weight: 500;
cursor: pointer;
transition: all 0.2s;

&:hover {
  background: #69db7c;
  box-shadow: 0 4px 12px rgba(81, 207, 102, 0.3);
}
```

#### Button (Secondary)
```css
background: transparent;
color: #e0e0e0;
border: 1px solid #333;
padding: 0.75rem 1.5rem;
border-radius: 6px;

&:hover {
  border-color: #51cf66;
  color: #51cf66;
}
```

#### Card
```css
background: #1a1a1a;
border: 1px solid #333;
border-radius: 6px;
padding: 1rem;
transition: border-color 0.2s;

&:hover {
  border-color: #555;
}
```

#### Input
```css
background: #0d0d0d;
border: 1px solid #333;
color: #e0e0e0;
padding: 0.5rem 0.75rem;
border-radius: 4px;
font-size: 0.95rem;

&:focus {
  outline: none;
  border-color: #51cf66;
}
```

#### Progress Bar
```css
background: #222;
height: 20px;
border-radius: 4px;
overflow: hidden;
position: relative;

.fill {
  background: linear-gradient(90deg, #51cf66, #69db7c);
  height: 100%;
  transition: width 0.3s ease;
}

.text {
  position: absolute;
  color: #fff;
  font-size: 0.75rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

## Component Library

### Core Components

1. **AppShell**
   - Custom title bar (frameless window)
   - Drag-to-move functionality
   - Window controls (minimize, maximize, close)

2. **TelemetryCard**
   - Dark card with metric display
   - Large value, small label
   - Color-coded by importance

3. **ProgressBar**
   - Linear progress with percentage
   - Color-coded by status
   - Smooth transitions

4. **ProgressTree**
   - Hierarchical progress display
   - Expandable sub-steps
   - Status icons (✅/⏳/⏸️/❌)

5. **ThreeViewer**
   - WebGL canvas container
   - Orbit controls integration
   - Layer management system

6. **TrackMap2D**
   - Canvas-based 2D visualization
   - Real-time path drawing
   - Car position indicator

7. **AnimatedDiagram**
   - SVG/Canvas animation
   - Loop playback
   - Instructional overlays

8. **DebugConsole**
   - Scrollable log display
   - Color-coded messages
   - Timestamp formatting
   - Auto-scroll to bottom

9. **ValidationPanel**
   - Checklist display
   - Status icons
   - Expandable details

10. **FileExplorer**
    - Recent files list
    - Metadata preview
    - Click-to-load functionality

---

## Animations & Transitions

### Page Transitions
```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-out;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}
```

### Recording Indicator
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.recording-dot {
  background: #ff0000;
  animation: pulse 1s ease-in-out infinite;
}
```

### Progress Fill
```css
.progress-fill {
  transition: width 0.3s ease-out;
}
```

### Hover States
```css
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
```

---

## Accessibility

- **Keyboard Navigation**: Tab through all interactive elements
- **Focus Indicators**: Visible focus rings (lime accent)
- **Screen Reader**: ARIA labels on all controls
- **High Contrast**: Ensure 4.5:1 contrast ratio minimum
- **Text Scaling**: Support up to 200% zoom

---

## Performance Targets

- **Initial Load**: <2 seconds
- **Screen Transition**: <300ms
- **3D Viewer FPS**: 60fps (WebGL)
- **Telemetry Update**: 10Hz (100ms)
- **Processing Pipeline**: <60 seconds for full track
- **Export Time**: <10 seconds

---

## Responsive Breakpoints

**Minimum Window Size**: 1200x800px
**Recommended**: 1920x1080px (Full HD)

No mobile support (desktop-only application).

---

This specification provides complete UI/UX design for the AMS2 Telemetry Track Generator standalone desktop application.
