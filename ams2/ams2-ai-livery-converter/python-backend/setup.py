# Setup Script for Python Backend
# Run this after installing requirements.txt

"""
AMS2 AI Livery Designer - Python Environment Setup
Downloads AI models and prepares the environment
"""

import os
import sys
import torch
from pathlib import Path

def check_environment():
    """Check Python environment and dependencies"""
    print("=" * 60)
    print("Environment Check")
    print("=" * 60)
    
    # Python version
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print(f"✅ Python: {python_version}")
    
    # PyTorch
    try:
        import torch
        print(f"✅ PyTorch: {torch.__version__}")
        
        # CUDA
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            cuda_version = torch.version.cuda
            print(f"✅ CUDA: {cuda_version}")
            print(f"✅ GPU: {gpu_name}")
            
            # VRAM
            props = torch.cuda.get_device_properties(0)
            vram_gb = props.total_memory / 1e9
            print(f"✅ VRAM: {vram_gb:.2f} GB")
        else:
            print("⚠️  No CUDA GPU detected")
    except ImportError:
        print("❌ PyTorch not installed")
        return False
    
    # Other dependencies
    try:
        import numpy
        print(f"✅ NumPy: {numpy.__version__}")
    except ImportError:
        print("❌ NumPy not installed")
        return False
    
    try:
        import PIL
        print(f"✅ Pillow: {PIL.__version__}")
    except ImportError:
        print("❌ Pillow not installed")
        return False
    
    try:
        import cv2
        print(f"✅ OpenCV: {cv2.__version__}")
    except ImportError:
        print("❌ OpenCV not installed")
        return False
    
    return True

def download_models():
    """Download AI models (SDXL, ControlNet, etc.)"""
    print("\n" + "=" * 60)
    print("Downloading AI Models (Week 2)")
    print("=" * 60)
    
    models_dir = Path(__file__).parent / "models"
    models_dir.mkdir(exist_ok=True)
    
    print("\nModels to download:")
    print("1. Stable Diffusion XL Base (~6.9 GB)")
    print("2. ControlNet Depth SDXL (~2.5 GB)")
    print("3. ControlNet Normal SDXL (~2.5 GB)")
    print("4. IPAdapter (~1.2 GB)")
    print("5. Segment Anything Model (SAM) (~2.4 GB)")
    print("\nTotal: ~15.5 GB")
    
    print("\n⏳ Model download will be implemented in Week 2")
    print("For now, run: huggingface-cli login")
    
def create_directories():
    """Create necessary directories"""
    print("\n" + "=" * 60)
    print("Creating Directories")
    print("=" * 60)
    
    base_dir = Path(__file__).parent
    
    directories = [
        base_dir / "models",
        base_dir / "models" / "sdxl",
        base_dir / "models" / "controlnet",
        base_dir / "models" / "sam",
        base_dir / "temp",
        base_dir / "cache"
    ]
    
    for dir_path in directories:
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created: {dir_path}")

def main():
    """Main setup function"""
    print("AMS2 AI Livery Designer - Python Backend Setup\n")
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment check failed. Please install requirements:")
        print("   pip install -r requirements.txt")
        return
    
    # Create directories
    create_directories()
    
    # Download models (Week 2)
    download_models()
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run the backend: python main.py")
    print("2. Test GPU: curl http://localhost:8002/gpu-info")
    print("3. Download models in Week 2")

if __name__ == "__main__":
    main()
