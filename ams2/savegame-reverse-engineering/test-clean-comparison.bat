@echo off
REM Clean Comparison Test Helper
REM This script helps capture clean before/after snapshots

setlocal enabledelayedexpansion

set SAVE_DIR=C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame
set SCRIPT_DIR=%~dp0
set TEST_DIR=%SCRIPT_DIR%clean-tests

echo.
echo ================================================================================
echo   AMS2 Clean Comparison Test Helper
echo ================================================================================
echo.
echo This will help you capture clean snapshots for hex diff analysis.
echo.

REM Create test directory
if not exist "%TEST_DIR%" (
    mkdir "%TEST_DIR%"
    echo Created: %TEST_DIR%
    echo.
)

echo Current test files:
dir /b "%TEST_DIR%" 2>nul
if errorlevel 1 echo   (none yet)
echo.

echo ────────────────────────────────────────────────────────────────────────────────
echo OPTIONS:
echo ────────────────────────────────────────────────────────────────────────────────
echo.
echo [1] Capture BEFORE snapshot (e.g., BMW selected)
echo [2] Capture AFTER snapshot (e.g., Mercedes selected)
echo [3] Compare last two snapshots
echo [4] List all snapshots
echo [5] Clean up old snapshots
echo [Q] Quit
echo.

set /p choice="Enter choice: "

if /i "%choice%"=="1" goto capture_before
if /i "%choice%"=="2" goto capture_after
if /i "%choice%"=="3" goto compare
if /i "%choice%"=="4" goto list
if /i "%choice%"=="5" goto cleanup
if /i "%choice%"=="Q" goto end
if /i "%choice%"=="q" goto end

echo Invalid choice!
pause
goto end

:capture_before
echo.
set /p label="Enter label for BEFORE state (e.g., BMW, Track-Monza): "
set filename=%TEST_DIR%\before_%label%_default.sav
echo.
echo Copying %SAVE_DIR%\default.sav
echo      to %filename%
echo.
copy "%SAVE_DIR%\default.sav" "%filename%" >nul
if errorlevel 1 (
    echo ❌ Error copying file!
    pause
    goto end
)
echo ✅ BEFORE snapshot captured: before_%label%_default.sav
echo.
echo Now:
echo   1. Open AMS2
echo   2. Make ONE change (select different car/track/setting)
echo   3. Exit AMS2 properly
echo   4. Run this script again and choose [2] to capture AFTER
echo.
pause
goto end

:capture_after
echo.
set /p label="Enter label for AFTER state (e.g., Mercedes, Track-Interlagos): "
set filename=%TEST_DIR%\after_%label%_default.sav
echo.
echo Copying %SAVE_DIR%\default.sav
echo      to %filename%
echo.
copy "%SAVE_DIR%\default.sav" "%filename%" >nul
if errorlevel 1 (
    echo ❌ Error copying file!
    pause
    goto end
)
echo ✅ AFTER snapshot captured: after_%label%_default.sav
echo.
echo Now run this script and choose [3] to compare!
echo.
pause
goto end

:compare
echo.
echo Recent snapshots:
dir /b /o-d "%TEST_DIR%\*.sav" 2>nul | head -10
echo.
set /p before="Enter BEFORE filename (without path): "
set /p after="Enter AFTER filename (without path): "
echo.
echo Comparing:
echo   Before: %before%
echo   After:  %after%
echo.
pause
cd /d "%SCRIPT_DIR%"
node hex-diff.js "%TEST_DIR%\%before%" "%TEST_DIR%\%after%" BEFORE AFTER
echo.
echo ────────────────────────────────────────────────────────────────────────────────
echo RESULTS SUMMARY:
echo ────────────────────────────────────────────────────────────────────────────────
echo.
echo If you see:
echo   - Less than 100 differences: ✅ GOOD - clean comparison!
echo   - 1,000 - 10,000 differences: ⚠️  May include timestamps
echo   - 100,000+ differences: ❌ BAD - file has major structural changes
echo.
pause
goto end

:list
echo.
echo All snapshots:
dir /b /o-d "%TEST_DIR%\*.sav" 2>nul
echo.
pause
goto end

:cleanup
echo.
echo This will DELETE all snapshots in %TEST_DIR%
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto end
del /q "%TEST_DIR%\*.sav" 2>nul
echo ✅ Cleaned up!
echo.
pause
goto end

:end
endlocal
