@echo off
REM Production DDS to PNG converter using Microsoft texconv
REM Usage: convert-textures.bat <texture-directory>

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Usage: convert-textures.bat ^<texture-directory^>
    exit /b 1
)

set "TEXTURE_DIR=%~1"
set "SCRIPT_DIR=%~dp0"
set "TEXCONV=%SCRIPT_DIR%texconv.exe"

if not exist "%TEXCONV%" (
    echo Error: texconv.exe not found at %TEXCONV%
    exit /b 1
)

if not exist "%TEXTURE_DIR%" (
    echo Error: Texture directory not found: %TEXTURE_DIR%
    exit /b 1
)

echo Converting DDS textures to PNG...
echo Texture directory: %TEXTURE_DIR%
echo.

REM Convert all DDS files to PNG format
"%TEXCONV%" -ft png -o "%TEXTURE_DIR%" "%TEXTURE_DIR%\*.dds" -y -nologo

echo.
echo Texture conversion complete!
exit /b 0
