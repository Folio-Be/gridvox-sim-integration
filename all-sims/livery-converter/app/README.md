# SimVox.ai AI Livery Designer Desktop App

React/Tauri shell that mirrors the reference tech stack from recent SimVox.ai POCs while remaining standalone for the livery-designer project.

## Available Scripts

```powershell
# Install dependencies
pnpm install

# Start Vite dev server + Tauri
pnpm tauri dev

# Build production bundle
pnpm tauri build
```

## Architecture Snapshot

- **UI Framework:** React 19 + TypeScript 5.8 (Vite bundling)
- **State:** Zustand stores for app phase, project context, and UI feedback
- **Networking:** Axios client targeting the FastAPI backend (HTTP 8000 by default)
- **3D Preview:** Three.js placeholder ready for car viewer integration
- **Desktop Shell:** Tauri 2 with Rust commands for simulator path detection

Ports align with the implementation checklist (HTTP 1470 for Vite, WebSocket 1471 reserved for backend streaming updates).
