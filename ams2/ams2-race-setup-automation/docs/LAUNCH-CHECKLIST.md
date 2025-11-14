Launch Checklist — one terminal per app.
1) Terminal: Telemetry (HTTP 1430 / WS 1431)
   title Telemetry
   Set-Location c:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-telemetry-track-generator
   pnpm tauri dev
2) Terminal: Overlays (HTTP 1440 / WS 1441)
   title Overlays
   Set-Location c:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-overlays
   pnpm tauri dev
3) Terminal: AI Livery Designer (HTTP 1435 / WS 1436)
   title Livery
   Set-Location c:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-ai-livery-designer
   pnpm tauri dev
4) Terminal: Desktop POC06 (HTTP 1450 / WS 1451)
   title POC06
   Set-Location c:\DATA\GridVox\gridvox-desktop\pocs\poc-06-tauri-integration\gridvox-poc06
   pnpm tauri dev
5) Terminal: Desktop POC07 (HTTP 1455 / WS 1456)
   title POC07
   Set-Location c:\DATA\GridVox\gridvox-desktop\pocs\poc-07-llm-integration\gridvox-poc07
   pnpm tauri dev
6) Terminal: Desktop POC08 (HTTP 1460 / WS 1461)
   title POC08
   Set-Location c:\DATA\GridVox\gridvox-desktop\pocs\poc-08-tts-integration
   pnpm tauri dev
7) Terminal: Credit Economy Simulator (HTTP 1480)
   title EconSim
   Set-Location c:\DATA\SimVox\simvox-docs\05-presentations\simvox-credit-economy-simulator
   npm run dev
Rules of thumb:
- Only run the terminals you need today; comment out extras.
- If you change a port, adjust the label in this list so you remember the new value.
- Stop a project with Ctrl+C in its own terminal before reusing that shell.
