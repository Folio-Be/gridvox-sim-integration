# Week 2 Installation Guide - AI Models Setup

## Overview

This guide installs PyTorch with CUDA and Stable Diffusion XL for the AI Livery Designer.

**Total download size:** ~10 GB
**Disk space needed:** ~25 GB (models + dependencies)
**Time:** 30-60 minutes

## Prerequisites

✅ Already completed (Week 1):
- Python 3.10+ installed
- Virtual environment created (`install.bat` ran successfully)
- FastAPI backend structure set up

⚠️ Required:
- **NVIDIA GPU** with 8+ GB VRAM (12+ GB recommended)
- **CUDA Toolkit 12.6** installed
  - Download: https://developer.nvidia.com/cuda-downloads
  - Verify: `nvcc --version`
- **HuggingFace account** (free)
  - Sign up: https://huggingface.co/join

## Installation Steps

### Step 1: Install PyTorch with CUDA

```powershell
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-ai-livery-designer\python-backend
.\install-cuda.bat
```

**What this does:**
- Installs PyTorch 2.5+ with CUDA 12.6 support
- Installs torchvision and torchaudio
- Tests GPU detection
- Takes ~5-10 minutes

**Expected output:**
```
PyTorch: 2.5.0+cu126
CUDA Available: True
CUDA Version: 12.6
GPU: NVIDIA GeForce RTX 4090
```

### Step 2: Install AI Dependencies

```powershell
.\install-ai.bat
```

**What this does:**
- Installs diffusers (Stable Diffusion library)
- Installs transformers (model loading)
- Installs accelerate (GPU optimization)
- Installs ControlNet support
- Takes ~2-5 minutes

### Step 3: Login to HuggingFace

```powershell
venv\Scripts\activate
huggingface-cli login
```

You'll need your HuggingFace **access token**:
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access is enough)
3. Paste it when prompted

### Step 4: Download AI Models

```powershell
python download_models.py
```

**What this downloads:**
1. **SDXL Base 1.0** (~6.9 GB) - Main image generation model
2. **ControlNet Depth SDXL** (~2.5 GB) - Depth-guided generation
3. **SDXL VAE** (~335 MB) - Improved image quality

**Total:** ~9.7 GB, takes 10-30 minutes depending on internet speed.

### Step 5: Verify Installation

```powershell
python setup.py
```

**Expected output:**
```
✅ Python: 3.11.x
✅ PyTorch: 2.5.0+cu126
✅ CUDA: 12.6
✅ GPU: NVIDIA GeForce RTX 4090
✅ VRAM: 24.00 GB
✅ NumPy: 1.26.4
✅ Pillow: 10.4.0
✅ OpenCV: 4.10.0
✅ diffusers: 0.31.0
✅ transformers: 4.46.0

Models Found:
✅ SDXL Base: models/sdxl-base/
✅ ControlNet Depth: models/controlnet-depth/
✅ SDXL VAE: models/sdxl-vae/
```

## Testing

Start the backend server:

```powershell
python main.py
```

Visit http://localhost:8002/docs to see the API.

## Troubleshooting

### "CUDA not available"
- Check NVIDIA drivers: `nvidia-smi`
- Reinstall CUDA Toolkit 12.6
- Rerun `install-cuda.bat`

### "No module named 'diffusers'"
- Rerun `install-ai.bat`
- Check venv is activated: `venv\Scripts\activate`

### "HuggingFace login required"
- Run: `huggingface-cli login`
- Create token at https://huggingface.co/settings/tokens

### Models not downloading
- Check internet connection
- Check HuggingFace authentication
- Try manual download:
  ```powershell
  huggingface-cli download stabilityai/stable-diffusion-xl-base-1.0 --local-dir models/sdxl-base
  ```

## What's Next?

**Week 3-4: Asset Extraction**
- Extract UV templates from AMS2 cars
- Collect reference photos
- Extract existing liveries
- Prepare 3D models for ControlNet

**Week 5-6: Pipeline Development**
- Build photo preprocessing
- Integrate SDXL + ControlNet
- Create UV projection
- Test livery generation

## File Structure After Installation

```
python-backend/
├── venv/                    # Virtual environment
├── models/                  # AI models (~10 GB)
│   ├── sdxl-base/          # SDXL Base 1.0
│   ├── controlnet-depth/   # ControlNet Depth
│   └── sdxl-vae/           # VAE fix
├── install.bat             # Base setup (Week 1)
├── install-cuda.bat        # PyTorch CUDA (Week 2)
├── install-ai.bat          # AI deps (Week 2)
├── download_models.py      # Model downloader
├── setup.py                # Environment checker
├── main.py                 # FastAPI server
└── requirements.txt        # Dependencies
```

## Resource Usage

**VRAM Usage (during generation):**
- SDXL Base: ~7-8 GB
- + ControlNet: ~9-10 GB
- Peak: ~12 GB recommended

**Disk Space:**
- Python dependencies: ~5 GB
- AI models: ~10 GB
- Generated outputs: ~1-2 GB (varies)
- **Total:** ~16-17 GB

## Support

If you encounter issues:
1. Check `setup.py` output
2. Review CUDA installation: `nvcc --version`
3. Check GPU: `nvidia-smi`
4. Verify venv activation
5. Check logs in `python-backend/`
