# AMS2 AI Livery Designer - Project Setup Complete

## What Was Built

A complete **Tauri-based desktop application** framework for AI-powered livery generation, ready for Phase 1 POC development.

### Project Structure

```
C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-ai-livery-designer\
├── 📄 Documentation
│   ├── README.md                        # Project overview
│   ├── QUICKSTART.md                    # Getting started guide
│   ├── PHASE_1_POC.md                   # 8-week detailed plan
│   ├── AI_LIVERY_DESIGNER_RESEARCH.md   # Technical research (existing)
│   └── PROJECT_SETUP_COMPLETE.md        # This file
│
├── 🎨 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── main.tsx                     # React entry point
│   │   ├── App.tsx                      # Main UI component
│   │   └── App.css                      # Dark-themed styling
│   ├── index.html                       # HTML template
│   ├── vite.config.ts                   # Vite config (port 1430/1431)
│   ├── tsconfig.json                    # TypeScript config
│   ├── tsconfig.node.json               # Node TypeScript config
│   └── package.json                     # NPM dependencies
│
├── 🦀 Backend (Rust + Tauri)
│   └── src-tauri/
│       ├── src/
│       │   ├── main.rs                  # Entry point
│       │   └── lib.rs                   # Tauri commands
│       ├── Cargo.toml                   # Rust dependencies
│       ├── tauri.conf.json              # Tauri configuration
│       └── build.rs                     # Build script
│
├── 🐍 Python Backend (AI Processing)
│   └── python-backend/
│       ├── main.py                      # FastAPI server (port 8002)
│       └── requirements.txt             # Python dependencies
│
├── 📁 Assets (Organized directories)
│   ├── uv-templates/README.md           # UV texture templates (Week 3-4)
│   ├── test-photos/README.md            # Real-world reference photos
│   └── sample-liveries/README.md        # Existing AMS2 liveries
│
├── 📤 Output
│   └── README.md                        # Generated liveries storage
│
└── ⚙️ Configuration
    ├── .gitignore                       # Git ignore rules
    └── (Package configs above)
```

## Technical Decisions

### Port Configuration (No Conflicts)
- **Frontend:** `localhost:1430` (Vite dev server)
- **HMR:** `localhost:1431` (Hot Module Replacement)
- **Python:** `localhost:8002` (AI backend)
- **POC-08 uses:** 1420/1421 and 8001 ✅ No conflicts

### Tech Stack Choices

#### Why Tauri?
- Native performance (Rust backend)
- Small bundle size (~5MB vs Electron's 100MB+)
- Direct file system access for DDS export
- GPU acceleration support
- Same stack as other SimVox.ai POCs

#### Why React 19?
- Modern hooks and concurrent features
- Type-safe with TypeScript
- Familiar to team (used in POC-08)
- Fast development iteration

#### Why Separate Python Backend?
- AI models (PyTorch, SDXL) best in Python ecosystem
- Isolates heavy AI processing from UI
- Can scale to cloud API later
- FastAPI for REST endpoints

### Test Cars Selected

Based on AMS2 actual vehicle data:

1. **Porsche 992 GT3 R** (`Porsche_992_GT3R`)
   - Class: GT3_Gen2
   - DLC: endurancept1pack
   - Popular in GT3 racing

2. **McLaren 720S GT3 Evo** (`McLaren_720S_GT3_Evo`)
   - Class: GT3_Gen2  
   - DLC: endurancept1pack
   - Complex body surfaces (good test)

3. **BMW M4 GT3** (`BMW_M4_GT3`)
   - Class: GT3_Gen2
   - DLC: endurancept1pack
   - Different manufacturer for variety

## Features Implemented

### ✅ Working Now

1. **Modern UI**
   - Dark theme with gradient accents
   - Responsive layout
   - Clean, professional design

2. **Photo Upload System**
   - Drag & drop support
   - Multi-file selection
   - Image preview with thumbnails
   - Angle tagging (front/side/rear/3-4)
   - Remove individual photos

3. **Car Selection**
   - Radio button selection
   - 3 GT3 test cars
   - Display car name and class

4. **Status Tracking**
   - Processing indicators
   - Success/error messages
   - Phase progress tracker

5. **Project Architecture**
   - Tauri app framework
   - React components
   - Rust backend stubs
   - Python backend placeholder
   - Asset organization

### ⏳ Coming Next (Week 1-4)

- AI model integration (SDXL + ControlNet)
- UV template extraction
- Background removal (SAM)
- Real-world photo collection
- DDS export functionality
- In-game testing

## How to Use

### 1. Install Dependencies

```powershell
cd C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-ai-livery-designer
pnpm install
```

### 2. Run Development Server

```powershell
pnpm tauri dev
```

This opens the desktop app with hot-reload enabled.

### 3. Test UI

- Select a test car (Porsche/McLaren/BMW)
- Drag & drop photos
- Tag photo angles
- Click "Generate AI Livery" (mock for now)

### 4. Next Steps

See `QUICKSTART.md` for detailed instructions on:
- Setting up CUDA
- Installing AI models
- Extracting AMS2 assets
- Collecting reference photos

## Phase 1 Progress

### Week 1-2: Environment Setup (15% Complete)

- [x] Project structure created
- [x] Tauri app configured
- [x] React UI implemented
- [x] Rust backend stubs
- [x] Python backend placeholder
- [x] Asset directories organized
- [ ] Development tools installed
- [ ] AI models downloaded
- [ ] GPU benchmarked

### Week 3-4: Asset Extraction (0% Complete)

- [ ] UV templates extracted (3 cars)
- [ ] Real-world photos collected (30+)
- [ ] Existing liveries analyzed
- [ ] UV layouts documented

### Week 5-6: Pipeline Development (0% Complete)

- [ ] Background removal
- [ ] SDXL integration
- [ ] UV projection
- [ ] DDS export

### Week 7-8: Quality Assessment (0% Complete)

- [ ] Generate 30 test liveries
- [ ] In-game validation
- [ ] Quality metrics
- [ ] Demo video

## Key Files to Know

### Documentation
- `README.md` - Start here for project overview
- `QUICKSTART.md` - How to run the app
- `PHASE_1_POC.md` - Detailed 8-week plan with todos

### Code Entry Points
- `src/App.tsx` - Main UI component
- `src-tauri/src/lib.rs` - Rust commands
- `python-backend/main.py` - AI processing server

### Configuration
- `vite.config.ts` - Frontend dev server (port 1430)
- `src-tauri/tauri.conf.json` - Tauri settings
- `package.json` - NPM scripts and dependencies

## Dependencies Overview

### Frontend (Node.js)
```json
{
  "react": "^19.1.0",
  "@tauri-apps/api": "^2",
  "vite": "^7.0.4",
  "typescript": "~5.8.3"
}
```

### Backend (Rust)
```toml
tauri = { version = "2" }
tauri-plugin-dialog = "2"
serde_json = "1"
```

### AI Processing (Python)
```txt
fastapi==0.115.0
# torch (when CUDA ready)
# diffusers (Week 2)
# transformers (Week 2)
```

## Success Criteria for POC

By end of Week 8, should have:

1. **Working Application**
   - Desktop app that runs on Windows
   - Upload photos → Generate livery → Export DDS
   - 3 test cars fully supported

2. **Quality Benchmark**
   - 30 generated liveries (10 per car)
   - 70-85% visual accuracy achieved
   - DDS files load correctly in AMS2

3. **Documentation**
   - Technical findings report
   - Before/after comparison gallery
   - Demo video
   - Recommendations for Phase 2 (MVP)

## Resources

- **AMS2 Car Data:** `../ams2-car-image-extractor/output/manifest.json`
- **Research:** `AI_LIVERY_DESIGNER_RESEARCH.md` (1776 lines!)
- **Phase Plan:** `PHASE_1_POC.md` (detailed weekly todos)
- **Similar POC:** `../../SimVox.ai-desktop/pocs/poc-08-tts-integration/`

## Next Immediate Actions

Choose your path:

### Path A: Complete Environment Setup
```powershell
# Install CUDA toolkit
# Download SDXL model
# Set up Python venv
pip install -r python-backend/requirements.txt
```

### Path B: Start Asset Extraction
```powershell
# Locate AMS2 installation
cd C:\GAMES\Automobilista 2\vehicles

# Extract UV templates for:
# - Porsche_992_GT3R
# - McLaren_720S_GT3_Evo
# - BMW_M4_GT3
```

### Path C: Collect Reference Photos
```
# Search online for GT3 livery photos
# Focus on Porsche 992 GT3 R, McLaren 720S GT3, BMW M4 GT3
# Save to assets/test-photos/
# Aim for 10+ photos per car, various angles
```

## Project Health

✅ **Status:** Ready for Development  
✅ **Architecture:** Solid foundation  
✅ **Dependencies:** Clearly defined  
✅ **Documentation:** Comprehensive  
✅ **Next Steps:** Well planned  

## Questions or Issues?

1. Check `QUICKSTART.md` for common troubleshooting
2. Review `PHASE_1_POC.md` for detailed plan
3. Reference `AI_LIVERY_DESIGNER_RESEARCH.md` for technical details
4. Look at POC-08 for similar Tauri + Python setup

---

**Project Created:** November 10, 2025  
**Status:** Phase 1 - Week 1 (15% Complete)  
**Next Milestone:** Environment setup + AI model download  

Let's build something amazing! 🚀🎨
