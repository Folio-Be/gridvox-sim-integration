@echo off
echo ============================================================
echo Installing Additional Vision Libraries
echo ============================================================
echo.

call .\venv\Scripts\activate.bat

echo Installing image quality metrics...
pip install lpips pytorch-msssim scikit-image

echo Installing image processing...
pip install opencv-python pillow-simd imageio

echo Installing visualization...
pip install matplotlib seaborn tqdm

echo.
echo ============================================================
echo Installation Complete
echo ============================================================
echo.
echo Installed libraries:
echo - lpips (perceptual loss)
echo - pytorch-msssim (SSIM metric)
echo - scikit-image (image processing)
echo - opencv-python (computer vision)
echo - matplotlib (visualization)
echo.

pause
