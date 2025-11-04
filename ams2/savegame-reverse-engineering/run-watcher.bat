@echo off
echo ========================================
echo  AMS2 Savegame Watcher with Voice STT
echo ========================================
echo.
cd /d C:\DATA\GridVox\gridvox-sim-integration\ams2\savegame-reverse-engineering
node watcher.js
echo.
echo ========================================
echo  Watcher stopped.
echo ========================================
pause

