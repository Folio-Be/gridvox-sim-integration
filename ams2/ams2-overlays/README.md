# AMS2 Overlay POC

**GridVox Transparent Video Overlay Proof of Concept**

## Overview

This POC demonstrates transparent window overlay functionality for displaying story cutscenes over AMS2 racing sim. Built with Tauri v2 + React + TypeScript.

## Features

- ✅ **Transparent borderless window** overlay
- ✅ **Multi-window architecture** (main control + overlay)
- ✅ **Always-on-top** positioning
- ✅ **Event-driven** video playback
- ✅ **Cross-platform** (Windows, macOS, Linux)

## Architecture

```
┌─────────────────────────────────┐
│ Main Window                     │
│  - Control interface            │
│  - Show/Hide overlay buttons    │
│  - Story trigger simulation     │
└─────────────────────────────────┘
           │
           │ Commands
           ▼
┌─────────────────────────────────┐
│ Overlay Window (Transparent)    │
│  - No decorations               │
│  - Always on top                │
│  - Transparent background       │
│  - Video player (future)        │
└─────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ and npm
- Rust 1.70+
- Tauri CLI

## Installation

```bash
# Install dependencies
npm install

# Install Tauri CLI globally (if not already)
npm install -g @tauri-apps/cli
```

## Development

```bash
# Run in development mode
npm run tauri dev
```

This will:
1. Start Vite dev server (port 1420)
2. Launch Tauri app with hot-reload
3. Open main control window
4. Overlay window is hidden by default

## Testing

1. Click **"Show Overlay"** button in main window
2. Overlay window appears as transparent window on top
3. Click **"Hide Overlay"** to dismiss

## Current Status

**Phase 1: Transparent Window POC** ✅ (Week 1)
- [x] Multi-window setup
- [x] Transparent overlay window
- [x] Show/hide commands
- [x] Event system
- [x] Test UI

**Phase 2: Video Playback** 🔄 (Next)
- [ ] HTML5 video player component
- [ ] Video playback commands
- [ ] Auto-hide on video end
- [ ] Test video assets

**Phase 3: Telemetry Integration** 📅 (Future)
- [ ] AMS2 shared memory reader
- [ ] Event detection
- [ ] Automatic triggering

## File Structure

```
ams2-overlays/
├── src/
│   ├── main.tsx              # Main window entry
│   ├── overlay.tsx           # Overlay window entry
│   ├── App.tsx               # Main window UI
│   ├── pages/
│   │   └── Overlay.tsx       # Overlay window UI
│   └── styles.css
├── src-tauri/
│   ├── src/
│   │   ├── main.rs           # Rust entry point
│   │   ├── lib.rs            # Tauri app setup
│   │   └── commands.rs       # Overlay control commands
│   ├── Cargo.toml
│   └── tauri.conf.json       # Multi-window config
├── index.html                # Main window HTML
├── overlay.html              # Overlay window HTML
└── package.json
```

## Key Technologies

- **Tauri v2**: Multi-window support, transparent windows, native APIs
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool with hot-reload

## Tauri Commands

### `show_overlay()`
Shows the overlay window and brings it to focus.

### `hide_overlay()`
Hides the overlay window.

### `is_overlay_visible()`
Returns boolean indicating if overlay is currently visible.

### `play_overlay_video(video_path: string)`
Shows overlay and emits event to play video at specified path.

## Events

### `play-overlay-video`
Emitted from Rust → Overlay window
```typescript
{
  src: string  // Path to video file
}
```

## Next Steps

1. ✅ Verify transparent window works over AMS2
2. Add HTML5 video player to overlay
3. Add test video assets
4. Implement auto-hide on video end
5. Add telemetry integration (POC-02)
6. Add story trigger system

## Performance

**Target:**
- Frame time: +0.5-3ms
- CPU overhead: 3-6%
- GPU overhead: 8-17%
- Memory: 250-600 MB

See `OVERLAY-POC-PLAN.md` for detailed performance analysis.

## Troubleshooting

### Overlay window not appearing
- Check if overlay window is in task manager
- Verify `transparent: true` in tauri.conf.json
- On Windows, ensure DWM (Desktop Window Manager) is enabled

### Overlay appears solid instead of transparent
- Restart app (Tauri sometimes needs restart for transparency)
- Check background: transparent in overlay CSS
- Verify Windows Aero is enabled

## Related Documentation

- [OVERLAY-POC-PLAN.md](./OVERLAY-POC-PLAN.md) - Comprehensive implementation plan
- [Tauri Multi-Window Guide](https://tauri.app/v2/guide/features/multi-window)
- [Tauri Transparent Windows](https://tauri.app/v2/reference/config/#windowconfig.transparent)

## License

Part of GridVox project.
