# AMS2 AI Livery Designer - POC

**Phase 1 Proof of Concept** - AI-Powered Livery Generation for Automobilista 2

## Overview

This is a Tauri-based desktop application that uses AI (Stable Diffusion XL + ControlNet) to generate racing livery textures from real-world car photos. The POC focuses on 3 GT3 cars:

- **Porsche 992 GT3 R** (GT3_Gen2)
- **McLaren 720S GT3 Evo** (GT3_Gen2)
- **BMW M4 GT3** (GT3_Gen2)

## Project Structure

```
ams2-ai-livery-designer/
├── src/                    # React frontend
│   ├── App.tsx            # Main UI component
│   ├── App.css            # Styling
│   └── main.tsx           # Entry point
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Tauri entry
│   │   └── lib.rs         # Commands
│   ├── Cargo.toml
│   └── tauri.conf.json
├── python-backend/        # AI processing (standalone)
│   ├── main.py            # FastAPI server (port 8002)
│   ├── setup.py           # Environment setup script
│   ├── install.bat        # Automated installer
│   ├── start.bat          # Server startup script
│   ├── requirements.txt   # Python dependencies
│   └── services/
│       ├── __init__.py
│       ├── image_processor.py  # Photo preprocessing, SAM
│       ├── ai_generator.py     # SDXL + ControlNet
│       └── dds_exporter.py     # DDS file export
├── assets/                # UV templates & reference data
│   ├── uv-templates/
│   ├── test-photos/
│   └── sample-liveries/
└── output/                # Generated liveries
```

## Tech Stack

### Frontend
- **Tauri 2.0** - Desktop app framework
- **React 19** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 7** - Build tool

### Backend
- **Rust** - Tauri native backend
- **Python 3.10+** - AI processing
- **FastAPI** - Python API server (port 8002)

### AI Models
- **Stable Diffusion XL** - Image generation
- **ControlNet** - Guided generation (depth/normals)
- **IPAdapter** - Style transfer
- **SAM** - Background removal

## Ports Configuration

- **Frontend Dev Server:** `http://localhost:1430`
- **HMR WebSocket:** `ws://localhost:1431`
- **Python Backend:** `http://localhost:8002` (avoids conflicts with POC-08 on 8001)

## Setup Instructions

### Prerequisites

1. **Node.js 18+** and **pnpm**
2. **Rust** (latest stable) - [rustup.rs](https://rustup.rs/)
3. **Python 3.10+**
4. **CUDA Toolkit** (already installed from POC-08)
5. **AMS2 Installation** (for extracting UV templates)

### Quick Start

#### 1. Install Frontend Dependencies

```powershell
# Navigate to project root
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-ai-livery-designer

# Install Node.js dependencies
pnpm install

# Install Tauri CLI (if not already installed)
cargo install tauri-cli
```

#### 2. Set Up Python Backend

```powershell
# Navigate to Python backend
cd python-backend

# Run automated setup (creates venv, installs dependencies)
.\install.bat

# This will:
# - Create a virtual environment
# - Install all Python packages
# - Set up directory structure
# - Check GPU availability
```

#### 3. Test the Setup

```powershell
# Terminal 1: Start Python backend
cd python-backend
.\start.bat
# Should start on http://127.0.0.1:8002

# Terminal 2: Start Tauri app
cd ..
pnpm tauri dev
```

### Manual Python Setup (Alternative)

If you prefer manual setup:

```powershell
cd python-backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run setup check
python setup.py

# Start server
python main.py
```

### Development

```powershell
# Run Tauri dev mode (starts both frontend and Rust backend)
pnpm tauri dev

# Or run frontend only
pnpm dev

# Run Python backend (when implemented)
cd python-backend
python main.py
```

### Build

```powershell
# Build production executable
pnpm tauri build
```

## Current Status

### ✅ Week 1-2: Environment Setup (IN PROGRESS)

- [x] Tauri project structure created
- [x] React + TypeScript frontend set up
- [x] Basic UI with photo upload
- [x] Car selection (3 GT3 test cars)
- [x] Drag & drop functionality
- [x] Multi-angle photo tagging
- [x] Python backend structure (standalone)
- [x] Service stubs (image processor, AI generator, DDS exporter)
- [x] Automated setup scripts
- [ ] Install Python dependencies
- [ ] Test GPU availability
- [ ] Download SDXL models

### ⏳ Week 3-4: Asset Extraction (NEXT)

- [ ] Extract UV templates for 3 test cars
- [ ] Collect 10+ real-world reference photos per car
- [ ] Extract existing AMS2 liveries for comparison
- [ ] Document UV layout patterns
- [ ] Extract 3D car models for depth/normal generation

### ⏳ Week 5-6: Pipeline Development

- [ ] Build photo preprocessing module
- [ ] Implement SAM background removal
- [ ] Integrate SDXL + ControlNet
- [ ] Create UV space projection
- [ ] Build DDS exporter

### ⏳ Week 7-8: Quality Assessment

- [ ] Generate 10 test liveries per car (30 total)
- [ ] In-game validation in AMS2
- [ ] Calculate accuracy metrics (target: 70-85%)
- [ ] Create demo video
- [ ] Write technical findings report

## Features

### POC Phase 1 Features

- ✅ **Modern UI** - Clean, dark-themed interface
- ✅ **Photo Upload** - Drag & drop with multi-file support
- ✅ **Angle Detection** - Tag photos as front/side/rear/3-4
- ✅ **Car Selection** - Choose from 3 GT3 test cars
- ⏳ **AI Generation** - SDXL + ControlNet processing
- ⏳ **UV Projection** - Map photos to UV texture space
- ⏳ **DDS Export** - AMS2-compatible texture files
- ⏳ **In-Game Preview** - Test liveries in AMS2

## Reference Cars (from AMS2 Content Listing)

Based on actual AMS2 vehicle data:

### Porsche 992 GT3 R
- **ID:** `Porsche_992_GT3R`
- **Class:** GT3_Gen2
- **Manufacturer:** Porsche
- **Year:** 2023
- **DLC:** endurancept1pack

### McLaren 720S GT3 Evo
- **ID:** `McLaren_720S_GT3_Evo`
- **Class:** GT3_Gen2
- **Manufacturer:** McLaren
- **Year:** 2023
- **DLC:** endurancept1pack

### BMW M4 GT3
- **ID:** `BMW_M4_GT3`
- **Class:** GT3_Gen2
- **Manufacturer:** BMW
- **Year:** 2023
- **DLC:** endurancept1pack

## Research References

- See [AI_LIVERY_DESIGNER_RESEARCH.md](./AI_LIVERY_DESIGNER_RESEARCH.md) for full technical analysis
- See [PHASE_1_POC.md](./PHASE_1_POC.md) for detailed 8-week plan

## Next Steps

1. **Install Development Tools**
   - Verify Rust installation: `rustc --version`
   - Verify Python: `python --version`
   - Install CUDA toolkit for GPU

2. **Extract AMS2 Assets**
   - Use PCarsTools to extract `.mas` files
   - Get UV templates for test cars
   - Collect real-world reference photos

3. **Set Up AI Models**
   - Download SDXL model (6.9GB)
   - Install ControlNet weights
   - Test generation on development GPU

4. **Build Python Backend**
   - Create FastAPI server (port 8002)
   - Implement image preprocessing
   - Integrate SDXL pipeline

## License

This is a proof-of-concept project for GridVox. All AI-generated content is for personal/research use only.

## Contact

Part of the GridVox ecosystem - AI-powered tools for sim racing.
