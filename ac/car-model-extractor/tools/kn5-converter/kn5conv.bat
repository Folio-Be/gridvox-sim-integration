@echo off
REM Wrapper for kn5-obj-converter (Python implementation)
REM Usage: kn5conv.exe -fbx input.kn5

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set PYTHON_CONVERTER=%SCRIPT_DIR%..\kn5-python\convert.py

REM Parse arguments
set FORMAT=fbx
set INPUT_FILE=

:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="-fbx" (
    set FORMAT=fbx
    shift
    goto parse_args
)
if "%~1"=="-obj" (
    set FORMAT=obj
    shift
    goto parse_args
)
REM Assume last argument is the input file or directory
set INPUT_FILE=%~1
shift
goto parse_args

:end_parse

if "%INPUT_FILE%"=="" (
    echo Usage: kn5conv.exe [-fbx^|-obj] input.kn5
    exit /b 1
)

REM If INPUT_FILE is a .kn5 file, extract its directory
if /i "%INPUT_FILE:~-4%"==".kn5" (
    for %%F in ("%INPUT_FILE%") do set "INPUT_DIR=%%~dpF"
) else (
    set "INPUT_DIR=%INPUT_FILE%"
)

REM Call Python converter (it takes the directory, not the file)
python "%PYTHON_CONVERTER%" !INPUT_DIR!

exit /b %ERRORLEVEL%
