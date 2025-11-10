@echo off
REM Start the Python backend server

echo Starting AMS2 AI Livery Designer Backend...
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo WARNING: Virtual environment not found
    echo Run install.bat first to set up the environment
    echo.
    echo Attempting to run with system Python...
)

echo.
echo Starting server on http://127.0.0.1:8002
echo Press Ctrl+C to stop
echo.

python main.py
