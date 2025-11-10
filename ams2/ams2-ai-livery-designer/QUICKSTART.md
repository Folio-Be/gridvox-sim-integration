# Quick Start Guide - AMS2 AI Livery Designer POC

## Immediate Next Steps

### 1. Install Dependencies (5 minutes)

```powershell
# Navigate to project directory
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-ai-livery-designer

# Install Node.js dependencies
pnpm install

# Verify Rust installation
rustc --version
# If not installed: Download from https://rustup.rs/

# Verify Python installation
python --version
# Should be 3.10 or higher
```

### 2. Run the Application (1 minute)

```powershell
# Start the Tauri development server
pnpm tauri dev

# This will:
# - Start Vite dev server on http://localhost:1430
# - Compile Rust backend
# - Open the desktop application window
```

### 3. Test Basic Functionality

1. **Select a Test Car**
   - Choose from Porsche 992 GT3 R, McLaren 720S GT3 Evo, or BMW M4 GT3

2. **Upload Photos**
   - Drag & drop images or click "Choose Files"
   - Tag photos with their viewing angle (front/side/rear/3-4)

3. **Generate Livery** (Mock - Not Yet Implemented)
   - Click "Generate AI Livery" button
   - Currently shows a 3-second mock processing

## What Works Now

- ✅ Modern desktop UI with Tauri
- ✅ Photo upload with drag & drop
- ✅ Multi-file selection
- ✅ Angle tagging for photos
- ✅ Car selection (3 GT3 test cars)
- ✅ Project structure complete

## What's Coming Next (Week 1-2)

### Option A: Continue Environment Setup

```powershell
# Install CUDA Toolkit (for GPU acceleration)
# Download from: https://developer.nvidia.com/cuda-downloads

# Set up Python virtual environment
cd python-backend
python -m venv venv
.\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run Python backend (placeholder)
python main.py
# Should start on http://localhost:8002
```

### Option B: Start Asset Extraction (Week 3)

1. **Locate AMS2 Installation**
   ```
   C:\GAMES\Automobilista 2\vehicles\
   ```

2. **Find Target Car Folders**
   - `Porsche_992_GT3R\`
   - `McLaren_720S_GT3_Evo\`
   - `BMW_M4_GT3\`

3. **Install PCarsTools**
   - Download from GitHub
   - Extract `.mas` and `.gmt` files
   - Look for `livery_*.dds` files

4. **Collect Real-World Photos**
   - Search for GT3 race car photos online
   - Focus on: Porsche 992 GT3 R, McLaren 720S GT3, BMW M4 GT3
   - Save to `assets/test-photos/`

### Option C: Research Online for Livery Examples

Search for:
- "Porsche 992 GT3 R racing livery"
- "McLaren 720S GT3 Evo livery designs"
- "BMW M4 GT3 race livery photos"
- AMS2 modding communities (Overtake.gg, RaceDepartment)
- Real-world IMSA/GT World Challenge photos

## Troubleshooting

### Tauri Dev Won't Start

```powershell
# Ensure Rust is installed
rustup update

# Ensure Tauri CLI is installed
cargo install tauri-cli --version ^2

# Clear node_modules and reinstall
rm -r node_modules
pnpm install
```

### Port Already in Use

If port 1430 is occupied:
1. Close other applications using the port
2. Or modify `vite.config.ts` to use a different port (e.g., 1440)

### Python Backend Issues

```powershell
# Install missing packages
pip install fastapi uvicorn

# Test manually
cd python-backend
python main.py
# Should see: "Application startup complete"
```

## File Locations

- **Project Root:** `C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-ai-livery-designer`
- **Frontend Code:** `src/`
- **Rust Backend:** `src-tauri/`
- **Python Backend:** `python-backend/`
- **Assets:** `assets/`
- **Generated Output:** `output/`
- **Documentation:** `PHASE_1_POC.md`, `AI_LIVERY_DESIGNER_RESEARCH.md`

## Recommended Workflow

### Week 1 (Current)
1. ✅ Project structure created
2. ⏳ Install all development tools
3. ⏳ Test that Tauri app runs
4. ⏳ Verify GPU capabilities with CUDA

### Week 2
1. Download SDXL model
2. Set up Python environment
3. Test basic SDXL generation (not car-specific yet)
4. Benchmark generation time on your GPU

### Week 3
1. Extract UV templates from AMS2
2. Collect 30+ real-world GT3 photos
3. Analyze UV layouts
4. Document seam locations

### Week 4
1. Extract existing AMS2 liveries
2. Study DDS compression formats
3. Create comparison baseline
4. Prepare for pipeline development

## Resources

- **Tauri Docs:** https://tauri.app/v1/guides/
- **Stable Diffusion XL:** https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- **ControlNet:** https://github.com/lllyasviel/ControlNet
- **PCarsTools:** https://github.com/lazd/pcarstools
- **AMS2 Modding:** https://www.overtake.gg/downloads/categories/automobilista-2.8/

## Need Help?

Check these documents:
- `README.md` - Project overview
- `PHASE_1_POC.md` - Detailed 8-week plan
- `AI_LIVERY_DESIGNER_RESEARCH.md` - Technical research

## Next Command to Run

```powershell
# Start developing!
pnpm tauri dev
```

Good luck! 🚀🎨
