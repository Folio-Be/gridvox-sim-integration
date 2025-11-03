# UI Automation Design: AMS2 Race Configuration

Objective
Design a robust, testable automation flow to configure AMS2 race sessions from the desktop.

Approach
Primary: AutoHotkey v2 scripts wrapped by a Node/Electron service. Fallback: Python (pywinauto + OpenCV) for image anchors.

Supported Profiles (V1)
- Resolution: 1920x1080, 2560x1440 (fullscreen/borderless)
- Language: English
- Input: Keyboard/mouse; controller disabled for test

Flow Diagram (Example: Configure Spa, GT3, 20 opponents, rain)
1) Pre-flight
   - Detect AMS2 process; bring to foreground via WinAPI
   - Ensure at main menu
2) Navigate to Custom Race
   - From main menu: select Single Player → Custom Race
   - Wait for race configuration screen
3) Configure Track
   - Navigate to Track Selection
   - Find "Spa-Francorchamps" (scroll/search if needed)
   - Confirm selection
4) Configure Car Class
   - Navigate to Car/Class Selection
   - Select "GT3" class
   - Confirm selection
5) Configure Opponents
   - Navigate to Opponent Configuration
   - Set count to 20 (arrow keys or slider)
   - Adjust AI difficulty if requested
6) Configure Weather
   - Navigate to Weather/Conditions
   - Select "Rain" preset or configure manually
   - Set time of day if requested
7) Confirm/Start
   - Navigate to Start Race or Save Configuration
   - Confirm action
8) Report
   - Capture screenshot; log success; return to app

Resilience Strategies
- Anchors: Store small template images (buttons, menu items) at multiple scales
- Timeouts + retries with exponential backoff
- State validation at each step (OCR/title match)
- Watchdog to abort on unexpected dialog
- Configurable delays; per-machine calibration file

Telemetry & Logging
- JSON log per run: timestamps, steps, retries, outcome
- Screenshot capture on failure and major steps
- Version stamp: AMS2 build number (from title/Steam APIs if available)

Security/Safety
- Hotkey to abort (e.g., Ctrl+Alt+G)
- Confirm popup in GridVox before automation starts
- Restore focus to previous window at end

Packaging
- race-config-runner.exe (compiled AHK) + assets/templates
- Node wrapper: exposes start/stop/status over IPC for Electron

Open Questions
- Menu structure differences between game modes?
- Track/car list navigation (pagination, search)?
- UI theme changes affecting anchors?

