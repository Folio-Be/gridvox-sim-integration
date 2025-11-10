# Transparent Overlay Window - Research Notes

## Current Status (POC Phase 1 Complete)

### What Works ✅
- **Transparent window creation**: Tauri can create a transparent overlay window
- **Multi-window communication**: Main window ↔ Overlay window via Tauri events (`emit`/`listen`)
- **Video playback**: HTML5 video plays in overlay with auto-hide functionality
- **Window positioning**: Overlay appears centered, always-on-top
- **Content transparency**: HTML/CSS backgrounds are fully transparent when set correctly

### Known Issues ⚠️

#### 1. Window Border and Shadow (Windows-specific)
**Problem**: Despite `"decorations": false` and `"shadow": false`, Windows still shows:
- Thin window border (1-2px)
- Drop shadow around the window edges
- These are visible even when content is transparent

**Root Cause**: Windows Desktop Window Manager (DWM) applies visual effects to ALL windows, including:
- Window borders (even with `WS_CAPTION` removed)
- Drop shadows (DWM composition effect)
- These are part of the Aero/Windows composition system

**Attempted Solutions**:
1. ❌ `tauri.conf.json` settings (`decorations: false`, `shadow: false`) - Minimal effect
2. ❌ Windows API `WS_EX_NOREDIRECTIONBITMAP` - Compilation issues with Tauri v2
3. ❌ Windows API `SetWindowLongPtrW` to modify extended styles - Type mismatches

**Partial Workaround**: 
- `"shadow": false` in config reduces shadow intensity by ~50%
- Border remains at 1-2px (unavoidable with current approach)

#### 2. Transparency Artifacts
**Problem**: Some visual elements may show dark/white backgrounds unexpectedly

**Solution**: Ensure ALL style sheets explicitly set transparent backgrounds:
```css
html, body, #root {
  background: transparent !important;
}
```

## Configuration Reference

### tauri.conf.json - Overlay Window
```json
{
  "label": "overlay",
  "url": "overlay.html",
  "width": 800,
  "height": 450,
  "decorations": false,     // Remove title bar and window chrome
  "alwaysOnTop": true,      // Stay above game window
  "transparent": true,       // Enable transparency (REQUIRED)
  "skipTaskbar": true,      // Don't show in taskbar
  "visible": false,         // Hidden by default
  "center": true,           // Center on screen
  "shadow": false           // Reduce (but not eliminate) shadow
}
```

### HTML Template (overlay.html)
```html
<style>
  * { margin: 0; padding: 0; }
  html, body, #root {
    width: 100%;
    height: 100%;
    background: transparent !important;
    overflow: hidden;
  }
</style>
```

### React Component Transparency
```tsx
// For transparent areas (no content)
<div style={{ background: "transparent" }}>

// For video container with slight background
<div style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
```

## Communication Pattern

### Main Window → Overlay
```tsx
// Main window (App.tsx)
await invoke("show_overlay");
await emit("play-overlay-video", { src: "/videos/stories/test.mp4" });
```

### Overlay → Main Window
```tsx
// Overlay (Overlay.tsx)
await emit("overlay-button-clicked", { 
  message: "Hello from overlay!",
  timestamp: new Date().toISOString()
});
```

### Event Listeners
```tsx
// Main window receives overlay events
useEffect(() => {
  const unlisten = listen("overlay-button-clicked", (event) => {
    console.log(event.payload);
  });
  return () => unlisten.then(fn => fn());
}, []);
```

## Future Research Topics

### 1. Complete Border/Shadow Removal (High Priority)
**Approaches to Investigate**:

#### Option A: Direct Windows API Integration
```rust
// Requires: windows-rs crate
use windows::Win32::UI::WindowsAndMessaging::{
    SetWindowLongPtrW, GWL_STYLE, GWL_EXSTYLE,
    WS_POPUP, WS_EX_LAYERED, WS_EX_TRANSPARENT, WS_EX_TOOLWINDOW
};

// Remove ALL window styles
SetWindowLongPtrW(hwnd, GWL_STYLE, WS_POPUP as isize);
SetWindowLongPtrW(hwnd, GWL_EXSTYLE, 
    WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW);

// Disable DWM window attributes
DwmSetWindowAttribute(hwnd, DWMWA_NCRENDERING_POLICY, 
    &DWMNCRP_DISABLED, size_of::<i32>());
```

**Challenges**:
- Tauri v2 window handle type changes (`hwnd()` returns different type)
- Need to call in `setup()` hook after window creation
- May conflict with Tauri's internal window management

#### Option B: Layered Window Approach
```rust
// Create as WS_EX_LAYERED from start
// Use UpdateLayeredWindow for manual rendering
// Full control over transparency and composition
```

**Pros**: Complete transparency control, no DWM interference
**Cons**: Complex, requires manual rendering, may break hot-reload

#### Option C: Win32 Hooks
```rust
// Hook into window creation process
// Modify styles BEFORE DWM sees the window
// Use SetWindowsHookEx with WH_CBT
```

**Pros**: Cleanest approach, intercepts at creation
**Cons**: Complex, global hooks can affect stability

### 2. Performance Optimization
**Areas to Test**:
- GPU acceleration for video playback
- Memory usage during long videos (9min test video = 150MB)
- Frame rate impact on game (target: <2ms)
- CPU usage (target: <5%)

**Profiling Tools**:
- Task Manager (GPU/CPU monitoring)
- GPU-Z for detailed GPU metrics
- MSI Afterburner for frame time overlay
- Chrome DevTools for video performance

### 3. Alternative Approaches

#### Option A: Electron with Transparency
```javascript
// Electron BrowserWindow
new BrowserWindow({
  transparent: true,
  frame: false,
  hasShadow: false  // Actually works in Electron!
})
```
**Pros**: Known to work, mature ecosystem
**Cons**: Larger bundle size, slower startup

#### Option B: Direct3D Overlay
```cpp
// D3D11 overlay rendering
// Common in game mod/cheat tools
// Full control, no window at all
```
**Pros**: Zero visual artifacts, maximum performance
**Cons**: Extremely complex, language barrier (Rust ↔ C++)

#### Option C: OBS Browser Source
```
// Use OBS virtual camera + browser source
// Overlay via streaming tech
```
**Pros**: Proven tech for overlays
**Cons**: External dependency, not integrated

### 4. Video Sizing
**Current**: `width: 90%`, `height: 90%`, `objectFit: "contain"`
**Issue**: Large videos (1920x1080) don't fit well in 800x450 window

**Solutions**:
- Make overlay window fullscreen by default
- Add dynamic sizing based on video resolution
- Create multiple overlay sizes (small/medium/large)

### 5. Game Integration
**Next Phase**: Telemetry Bridge (Phase 3)
- Monitor AMS2 memory for race events
- Trigger videos automatically (lap complete, race start, etc.)
- Read from `ams2-telemetry-track-generator` data

**Architecture Options**:
- IPC (Inter-Process Communication) - Recommended for POC
- Shared Memory - Better performance
- Unified Process - Simplest, but coupling

## Code Structure

```
ams2-overlays/
├── src/
│   ├── App.tsx              # Main control window
│   ├── overlay.tsx          # Overlay entry point
│   └── pages/
│       └── Overlay.tsx      # Overlay video player component
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs           # App initialization
│   │   ├── commands.rs      # show_overlay, hide_overlay
│   │   └── telemetry_bridge.rs  # Future: AMS2 integration
│   ├── tauri.conf.json      # Window configuration
│   └── Cargo.toml           # Rust dependencies
├── overlay.html             # Overlay HTML template
├── public/
│   └── videos/
│       └── stories/         # Test videos (150MB Big Buck Bunny)
└── TRANSPARENCY-RESEARCH.md # This file
```

## Testing Checklist

### Basic Functionality
- [x] Overlay window appears transparent
- [x] Green test button visible and clickable
- [x] Button sends message to main window
- [x] Main window receives and displays messages
- [x] Video playback triggers from main window
- [x] ESC key skips video
- [x] Video auto-hides on completion

### Transparency Quality
- [x] HTML background fully transparent
- [x] React component backgrounds transparent
- [ ] Window border removed (KNOWN ISSUE)
- [ ] Window shadow removed (PARTIALLY SOLVED)

### Performance (To Be Tested)
- [ ] GPU usage during video < 10%
- [ ] CPU usage during video < 5%
- [ ] Frame time impact < 2ms
- [ ] Memory stable during playback

## References

### Tauri Documentation
- [Window Configuration](https://tauri.app/v2/reference/config/#windowconfig)
- [Transparent Windows](https://tauri.app/v2/guides/features/transparent-windows/)
- [Multi-Window Setup](https://tauri.app/v2/guides/features/multi-window/)

### Windows API Documentation
- [Window Styles](https://learn.microsoft.com/en-us/windows/win32/winmsg/window-styles)
- [Extended Window Styles](https://learn.microsoft.com/en-us/windows/win32/winmsg/extended-window-styles)
- [DWM Functions](https://learn.microsoft.com/en-us/windows/win32/api/dwmapi/)

### Similar Projects
- [OBS Studio Overlays](https://github.com/obsproject/obs-studio)
- [Electron Transparent Windows](https://www.electronjs.org/docs/latest/tutorial/window-customization#create-transparent-windows)
- [Game Overlay Libraries](https://github.com/Codeusa/Borderless-Gaming)

## Conclusion

**Current State**: Functional transparent overlay with minor visual artifacts (border/shadow)

**Recommendation**: 
1. Accept 1-2px border for POC phase
2. Document limitation in user guide
3. Research Windows API integration for production
4. Consider Electron alternative if complete transparency is critical

**Next Steps**:
1. Performance profiling with real racing videos
2. Telemetry bridge integration (Phase 3)
3. Investigate Windows API solutions (see "Future Research" above)
4. Test with AMS2 running in background
