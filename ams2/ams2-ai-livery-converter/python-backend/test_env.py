"""Quick environment check script"""
import sys

print(f"Python: {sys.version}")
print()

try:
    import torch
    print(f"✅ PyTorch: {torch.__version__}")
    print(f"✅ CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
except ImportError:
    print("❌ PyTorch not installed - run install-cuda.bat")

print()

try:
    import diffusers
    print(f"✅ Diffusers: {diffusers.__version__}")
except ImportError:
    print("❌ Diffusers not installed - run install-ai.bat")

print()
print("Run setup.py for full check: python setup.py")
