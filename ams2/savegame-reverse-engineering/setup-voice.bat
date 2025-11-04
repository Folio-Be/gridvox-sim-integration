@echo off
cd /d C:\DATA\GridVox\gridvox-sim-integration\ams2\savegame-reverse-engineering
echo Setting up voice recognition model...
echo This will download the small model (40MB)
echo.
node download-vosk-model.js small
echo.
echo Setup complete! You can now use voice input with the watcher.
pause

