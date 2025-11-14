"""
Test SDXL model loading and simple generation
Week 2 verification - ensure GPU pipeline works
"""

import torch
from diffusers import StableDiffusionXLPipeline
from pathlib import Path
import time

def test_model_loading():
    """Test loading SDXL model with GPU"""
    print("=" * 60)
    print("SDXL Model Loading Test")
    print("=" * 60)
    
    # Check GPU
    if not torch.cuda.is_available():
        print("❌ No CUDA GPU available")
        return False
    
    gpu_name = torch.cuda.get_device_name(0)
    vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"✅ GPU: {gpu_name}")
    print(f"✅ VRAM: {vram_gb:.2f} GB")
    
    # Model path
    model_path = Path(__file__).parent / "models" / "sdxl-base"
    if not model_path.exists():
        print(f"❌ Model not found: {model_path}")
        print("Run: python download_models.py")
        return False
    
    print(f"\n📁 Loading from: {model_path}")
    print("⏳ This will take 30-60 seconds...")
    
    start_time = time.time()
    
    try:
        # Load pipeline
        pipe = StableDiffusionXLPipeline.from_pretrained(
            str(model_path),
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        )
        
        load_time = time.time() - start_time
        print(f"✅ Model loaded in {load_time:.1f} seconds")
        
        # Move to GPU
        print("\n⏳ Moving to GPU...")
        pipe = pipe.to("cuda")
        
        # Check VRAM usage
        vram_used = torch.cuda.memory_allocated(0) / 1e9
        print(f"✅ GPU memory used: {vram_used:.2f} GB")
        
        # Simple generation test
        print("\n⏳ Testing generation (simple prompt)...")
        print("Prompt: 'a racing car livery, red and white stripes'")
        
        gen_start = time.time()
        image = pipe(
            prompt="a racing car livery, red and white stripes",
            num_inference_steps=20,  # Fast test (normally 30-50)
            guidance_scale=7.5,
            height=512,  # Small for speed test
            width=512
        ).images[0]
        
        gen_time = time.time() - gen_start
        print(f"✅ Generated in {gen_time:.1f} seconds")
        
        # Save test output
        output_path = Path(__file__).parent / "temp" / "test_output.png"
        output_path.parent.mkdir(exist_ok=True)
        image.save(output_path)
        print(f"✅ Saved to: {output_path}")
        
        # Summary
        print("\n" + "=" * 60)
        print("✅ SDXL Test PASSED")
        print("=" * 60)
        print(f"Load time: {load_time:.1f}s")
        print(f"Generation time: {gen_time:.1f}s")
        print(f"VRAM usage: {vram_used:.2f} GB")
        print(f"Output: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import sys
    success = test_model_loading()
    sys.exit(0 if success else 1)
