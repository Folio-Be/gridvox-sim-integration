@echo off
REM Quick launcher - just double-click this file!
REM Updated to use port 1435

cd /d "%~dp0"

echo.
echo ========================================
echo   AMS2 AI Livery Designer
echo   Dev Server: http://localhost:1435
echo ========================================
echo.

start "Vite Dev Server" cmd /k "npm run dev"

