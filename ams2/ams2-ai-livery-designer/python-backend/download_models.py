"""
Download AI Models for AMS2 AI Livery Designer
Downloads Stable Diffusion XL and ControlNet models from HuggingFace
"""

import os
from pathlib import Path
from huggingface_hub import snapshot_download, hf_hub_download
import torch

def check_gpu():
    """Check if CUDA GPU is available"""
    print("=" * 60)
    print("GPU Check")
    print("=" * 60)
    
    if not torch.cuda.is_available():
        print("⚠️  WARNING: No CUDA GPU detected!")
        print("Models will run on CPU (very slow)")
        response = input("\nContinue anyway? (y/n): ")
        if response.lower() != 'y':
            return False
    else:
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"✅ GPU: {gpu_name}")
        print(f"✅ VRAM: {vram_gb:.2f} GB")
        
        if vram_gb < 8:
            print(f"\n⚠️  WARNING: {vram_gb:.2f} GB VRAM may be insufficient")
            print("Recommended: 12+ GB for SDXL")
    
    return True

def download_sdxl_base():
    """Download Stable Diffusion XL Base model (~6.9 GB)"""
    print("\n" + "=" * 60)
    print("Downloading SDXL Base Model")
    print("=" * 60)
    
    model_id = "stabilityai/stable-diffusion-xl-base-1.0"
    models_dir = Path(__file__).parent / "models" / "sdxl-base"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nModel: {model_id}")
    print(f"Size: ~6.9 GB")
    print(f"Destination: {models_dir}")
    print("\nThis will take several minutes...")
    
    try:
        snapshot_download(
            repo_id=model_id,
            local_dir=models_dir,
            local_dir_use_symlinks=False,
            ignore_patterns=["*.onnx", "*.onnx_data", "*onnx*", "*.msgpack", "*openvino*", "*.h5", "*.pb"]
        )
        print(f"\n✅ SDXL Base downloaded to {models_dir}")
        return True
    except Exception as e:
        print(f"\n❌ Error downloading SDXL Base: {e}")
        return False

def download_controlnet_depth():
    """Download ControlNet Depth model for SDXL (~2.5 GB)"""
    print("\n" + "=" * 60)
    print("Downloading ControlNet Depth SDXL")
    print("=" * 60)
    
    model_id = "diffusers/controlnet-depth-sdxl-1.0"
    models_dir = Path(__file__).parent / "models" / "controlnet-depth"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nModel: {model_id}")
    print(f"Size: ~2.5 GB")
    print(f"Destination: {models_dir}")
    
    try:
        snapshot_download(
            repo_id=model_id,
            local_dir=models_dir,
            local_dir_use_symlinks=False,
            ignore_patterns=["*.onnx", "*.onnx_data", "*onnx*", "*.msgpack", "*openvino*", "*.h5", "*.pb"]
        )
        print(f"\n✅ ControlNet downloaded to {models_dir}")
        return True
    except Exception as e:
        print(f"\n❌ Error downloading ControlNet Depth: {e}")
        return False

def download_vae():
    """Download VAE for better image quality"""
    print("\n" + "=" * 60)
    print("Downloading SDXL VAE")
    print("=" * 60)
    
    model_id = "madebyollin/sdxl-vae-fp16-fix"
    models_dir = Path(__file__).parent / "models" / "sdxl-vae"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nModel: {model_id}")
    print(f"Size: ~335 MB")
    print(f"Destination: {models_dir}")
    
    try:
        snapshot_download(
            repo_id=model_id,
            local_dir=models_dir,
            local_dir_use_symlinks=False,
            ignore_patterns=["*.onnx", "*.onnx_data", "*onnx*", "*.msgpack", "*openvino*", "*.h5", "*.pb"]
        )
        print(f"\n✅ VAE downloaded to {models_dir}")
        return True
    except Exception as e:
        print(f"\n❌ Error downloading VAE: {e}")
        return False

def main():
    """Main download process"""
    print("=" * 60)
    print("AMS2 AI Livery Designer - Model Download")
    print("=" * 60)
    print("\nTotal download size: ~9.7 GB (PyTorch only)")
    print("Models:")
    print("  1. SDXL Base 1.0         (~6.9 GB)")
    print("  2. ControlNet Depth SDXL (~2.5 GB)")
    print("  3. SDXL VAE Fix          (~335 MB)")
    print("\nNote: Skipping ONNX, Flax, OpenVINO formats (saves ~18 GB)")
    
    # Check GPU
    if not check_gpu():
        print("\nDownload cancelled.")
        return
    
    # No authentication needed for public models
    print("\n" + "=" * 60)
    print("Starting Download")
    print("=" * 60)
    print("\nNote: These are public models, no login required")
    print("If download fails, you can login with: huggingface-cli login")
    print("\n✅ Starting automatic download in 3 seconds...")
    
    import time
    time.sleep(3)
    
    # Download models
    success = True
    
    if success:
        success = download_sdxl_base()
    
    if success:
        success = download_controlnet_depth()
    
    if success:
        success = download_vae()
    
    # Summary
    print("\n" + "=" * 60)
    if success:
        print("✅ All models downloaded successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Run setup.py to verify installation")
        print("  2. Start backend: python main.py")
        print("  3. Test generation in UI")
    else:
        print("❌ Some downloads failed")
        print("=" * 60)
        print("\nTry running this script again")

if __name__ == "__main__":
    main()
