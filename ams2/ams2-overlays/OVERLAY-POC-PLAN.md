# AMS2 Overlay POC - Implementation Plan

**Date:** November 10, 2025  
**Goal:** Create proof-of-concept overlay system for GridVox story cutscenes in AMS2  
**Tech Stack:** Tauri v2 + Rust + React + TypeScript  
**Status:** Phase 2 in progress (video playback)

---

## Executive Summary

This POC implements a **transparent overlay window** approach using Tauri v2's native capabilities to display story-driven video cutscenes over AMS2 racing gameplay. This is the fastest, safest path to MVP while maintaining alignment with GridVox's tech stack.

**Key Decision:** Transparent borderless window (vs DirectX injection) - proven approach used by SimHub and Race-Element, with no anti-cheat risks and lower complexity.

**Performance Target:** <10% GPU overhead, <5% CPU overhead, minimal frame time impact (<2ms).

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ GridVox Overlay App (Tauri v2)                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Main Window                                             │ │
│  │  - Control interface                                    │ │
│  │  - Story management                                     │ │
│  │  - Telemetry bridge                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Overlay Window (Transparent, Always-on-Top)             │ │
│  │  - HTML5 video player                                   │ │
│  │  - Auto-hide on video end                               │ │
│  │  - ESC to skip                                          │ │
│  │  - Event-driven visibility                              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
           │                           │
           │                           │ Telemetry Events
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────────┐
│ AMS2 Game Window    │    │ Telemetry Bridge         │
│ (Running full/wind) │    │ (ams2-telemetry-track-   │
│                     │    │  generator integration)  │
└─────────────────────┘    │ - Reads $pcars2$         │
                           │ - Detects events         │
                           │ - Triggers overlay       │
                           └──────────────────────────┘
```

---

## Implementation Phases

### ✅ Phase 1: Basic Overlay (Week 1) - COMPLETE
**Status:** Implemented

- [x] Tauri multi-window setup (main + overlay)
- [x] Transparent borderless window
- [x] Always-on-top positioning
- [x] Show/hide commands
- [x] Skip taskbar integration

**Deliverables:**
- Working transparent overlay window
- Tauri commands: `show_overlay()`, `hide_overlay()`
- React UI for control interface

---

### 🔄 Phase 2: Video Playback (Week 1-2) - IN PROGRESS
**Status:** Core functionality implemented, testing needed

**Completed:**
- [x] HTML5 `<video>` element in overlay
- [x] Auto-play on trigger
- [x] Auto-hide on video end
- [x] ESC key to skip cutscene
- [x] Event system (`play-overlay-video`)
- [x] Test button in main UI
- [x] Video asset directory structure
- [x] Error handling for missing videos

**Pending:**
- [ ] Test with actual MP4 video files
- [ ] Verify audio playback
- [ ] Test multi-monitor positioning
- [ ] Performance profiling during playback
- [ ] Volume control (optional)

**Test Videos Needed:**
- Place MP4 files in: `public/videos/stories/`
- Example: `test-cutscene.mp4` (1920x1080, H.264, 15-30 sec)

**Usage:**
```typescript
// From main window or telemetry bridge
await emit("play-overlay-video", { 
  src: "/videos/stories/test-lap-complete.mp4" 
});
```

---

### 📋 Phase 3: Telemetry Integration (Week 2-3) - PLANNED
**Goal:** Automatically trigger overlays based on AMS2 race events

**Tasks:**
- [ ] Create `telemetry_bridge.rs` module
- [ ] Connect to `ams2-telemetry-track-generator` (IPC or shared memory)
- [ ] Implement event detection:
  - Lap complete
  - Race start
  - Race finish
  - Overtake event
  - Position change
- [ ] Story trigger mapping (event → video cutscene)
- [ ] Event queue (prevent overlapping cutscenes)
- [ ] Configuration system (which events trigger which videos)

**Architecture:**
```rust
// src-tauri/src/telemetry_bridge.rs
pub struct TelemetryBridge {
    event_sender: mpsc::Sender<TelemetryEvent>,
    story_config: StoryConfig,
}

impl TelemetryBridge {
    pub fn on_lap_complete(&self, lap_data: LapData, app: AppHandle) {
        if self.story_config.should_trigger_cutscene("lap_complete") {
            app.emit("play-overlay-video", json!({
                "src": "/videos/stories/lap-complete.mp4"
            }));
        }
    }
}
```

**Integration Options:**
1. **IPC** - Connect to running telemetry-track-generator process
2. **Shared Memory** - Read AMS2 $pcars2$ directly (duplicate reader)
3. **Unified Process** - Merge overlay into telemetry app

---

### 🧪 Phase 4: Testing & Polish (Week 3) - PLANNED
**Goal:** Ensure production-ready quality

**Tasks:**
- [ ] Performance profiling (GPU, CPU, frame time)
- [ ] Multi-monitor testing
- [ ] VR compatibility check (overlay behavior in VR mode)
- [ ] Edge cases:
  - Game alt-tab
  - Game minimize/restore
  - Screen resolution changes
  - Multiple videos queued
- [ ] User documentation
- [ ] Demo video creation

**Success Criteria:**
- GPU overhead <10% during video playback
- CPU overhead <5%
- Frame time impact <2ms
- No crashes or freezes
- Smooth video playback with audio
- Works on 1080p, 1440p, 4K monitors

---

### 🎯 Future: VR Support (Week 4-5) - OPTIONAL
**Goal:** Extend overlay to VR headsets for immersive cutscenes

**Approach:**
- OpenXR API (modern standard, best performance)
- Composition layers (quad layer for 2D video)
- HMD-locked or world-locked positioning
- Same React video player, different rendering backend

**See:** `docs/VR-OVERLAY-PLAN.md` for detailed VR implementation plan

---

## Success Criteria

### MVP (End of Week 2)
- ✅ Transparent overlay window works over AMS2
- ✅ Video playback functional (MP4, H.264, with audio)
- ✅ Auto-hide when video ends
- ✅ ESC to skip
- ✅ Manual trigger works (`show_overlay()` command)

### Full POC (End of Week 3)
- ✅ Telemetry integration (reads AMS2 events)
- ✅ Automatic triggers (lap complete, race finish, overtake)
- ✅ Story configuration system
- ✅ Multiple test cutscenes
- ✅ Performance validated (<10% GPU, <5% CPU)

### Production Ready (End of Week 4)
- ✅ Edge cases handled
- ✅ Multi-monitor support
- ✅ User documentation
- ✅ Demo video created
- ✅ Integration path into main GridVox app defined

---

## Current File Structure

```
ams2-overlays/
├── README.md
├── OVERLAY-POC-PLAN.md (this file)
├── docs/
│   ├── RESEARCH-FINDINGS.md (overlay system research)
│   ├── PERFORMANCE-ANALYSIS.md (GPU/CPU impact analysis)
│   └── VR-OVERLAY-PLAN.md (future VR support)
├── public/
│   └── videos/
│       └── stories/
│           └── README.md (video asset instructions)
├── src/
│   ├── main.tsx
│   ├── App.tsx (control interface)
│   └── pages/
│       └── Overlay.tsx (video player overlay)
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── commands.rs (show/hide overlay)
│   │   └── telemetry_bridge.rs (future: AMS2 integration)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
```

---

## Development Commands

```bash
# Start dev server (hot reload enabled)
npm run tauri dev

# Build for production
npm run tauri build

# Run tests (future)
npm test
```

---

## Next Actions (Week 2)

1. **Add test video** - Place MP4 in `public/videos/stories/test-cutscene.mp4`
2. **Test video playback** - Click "Play Test Video" button
3. **Verify ESC skip works** - Press ESC while video plays
4. **Performance check** - Monitor GPU/CPU during playback
5. **Begin telemetry bridge** - Create `telemetry_bridge.rs` stub

---

## References

- **Research Details:** `docs/RESEARCH-FINDINGS.md`
- **Performance Data:** `docs/PERFORMANCE-ANALYSIS.md`
- **VR Future Plan:** `docs/VR-OVERLAY-PLAN.md`
- **Tauri Docs:** https://v2.tauri.app/
- **AMS2 Telemetry:** `../ams2-telemetry-track-generator/`

---

**Last Updated:** November 10, 2025  
**Status:** Phase 2 (Video Playback) - Ready for testing with actual video files
