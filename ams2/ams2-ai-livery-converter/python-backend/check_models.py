"""
Check if AI models are downloaded and ready to use
Quick startup check - no heavy imports
"""

from pathlib import Path

def check_models():
    """Check if all required models are present"""
    base_dir = Path(__file__).parent / "models"
    
    required_files = [
        # SDXL Base (main model)
        "sdxl-base/sd_xl_base_1.0.safetensors",
        "sdxl-base/unet/diffusion_pytorch_model.fp16.safetensors",
        "sdxl-base/text_encoder/model.safetensors",
        "sdxl-base/text_encoder_2/model.safetensors",
        "sdxl-base/vae/diffusion_pytorch_model.safetensors",
        
        # ControlNet Depth
        "controlnet-depth/diffusion_pytorch_model.fp16.safetensors",
        
        # VAE Fix
        "sdxl-vae/sdxl_vae.safetensors",
    ]
    
    missing = []
    total_size = 0
    
    for file_path in required_files:
        full_path = base_dir / file_path
        if not full_path.exists():
            missing.append(file_path)
        else:
            total_size += full_path.stat().st_size
    
    if missing:
        print("❌ Missing AI models:")
        for file in missing:
            print(f"  - {file}")
        print("\nRun: python download_models.py")
        return False
    
    total_gb = total_size / (1024**3)
    print(f"✅ All models present ({total_gb:.1f} GB)")
    return True

if __name__ == "__main__":
    import sys
    sys.exit(0 if check_models() else 1)
