@echo off
REM Install AI/ML dependencies for Stable Diffusion XL
REM Run this AFTER install-cuda.bat

echo ========================================
echo   AI Dependencies Installation
echo   Diffusers + Transformers + Accelerate
echo ========================================
echo.

call venv\Scripts\activate.bat

echo Installing HuggingFace libraries...
echo.

REM Install Stable Diffusion dependencies
pip install diffusers==0.31.0
pip install transformers==4.46.0
pip install accelerate==1.1.1
pip install safetensors==0.4.5
pip install invisible-watermark==0.2.0

REM Install ControlNet support
pip install controlnet-aux==0.0.9

REM Image processing
pip install opencv-python==4.10.0.84
pip install scipy==1.14.1

echo.
echo Testing imports...
python -c "import diffusers; print(f'✅ diffusers: {diffusers.__version__}')"
python -c "import transformers; print(f'✅ transformers: {transformers.__version__}')"
python -c "import accelerate; print(f'✅ accelerate: {accelerate.__version__}')"

echo.
echo ========================================
echo   AI Dependencies Installed!
echo ========================================
echo.
echo Next: Run download_models.py to download SDXL
pause
