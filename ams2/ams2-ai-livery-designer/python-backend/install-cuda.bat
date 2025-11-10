@echo off
REM Install PyTorch with CUDA support for AMS2 AI Livery Designer
REM Matches POC-08 approach - use pip index URL for CUDA version

echo ========================================
echo   PyTorch CUDA Installation  
echo   AMS2 AI Livery Designer
echo ========================================
echo.

REM Check for CUDA toolkit
echo Checking CUDA installation...
where nvcc >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: CUDA Toolkit not found in PATH
    echo Continuing anyway - PyTorch may use CPU only
    echo.
)

echo Installing PyTorch with CUDA 12.6 support...
echo This may take several minutes...
echo.

REM Activate venv
call venv\Scripts\activate.bat

REM Uninstall CPU-only PyTorch if present
pip uninstall -y torch torchvision torchaudio

REM Install PyTorch with CUDA 12.6
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126

echo.
echo Testing PyTorch CUDA...
python test_env.py

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
pause
