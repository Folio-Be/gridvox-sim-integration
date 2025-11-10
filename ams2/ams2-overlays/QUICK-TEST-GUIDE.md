# Quick Test Guide - AMS2 Overlay POC

**Ready to Test:** ✅ Video playback is implemented and test video is downloaded

---

## What's Ready

1. ✅ Transparent overlay window
2. ✅ Video playback with HTML5 player
3. ✅ Auto-hide when video ends
4. ✅ ESC key to skip
5. ✅ Test video downloaded (`test-cutscene.mp4` - 150MB)

---

## How to Test (Step by Step)

### 1. Start the Application
The dev server is already running in the background. If not, run:
```bash
npm run tauri dev
```

### 2. Test Basic Overlay
- Click **"Show Overlay"** button
- Transparent overlay window should appear on top
- Click **"Hide Overlay"** to dismiss

### 3. Test Video Playback
- Click **"▶ Play Test Video"** button (green button)
- Overlay should appear with video playing
- Video should have audio
- Press **ESC** to skip (recommended - video is 9 min long)
- Video should auto-hide when finished (or skipped)

### 4. Verify Functionality
- [ ] Overlay appears centered on screen
- [ ] Video plays with audio
- [ ] ESC key skips the video
- [ ] Overlay auto-hides after video ends
- [ ] Can re-play video multiple times
- [ ] "Press ESC to skip" instruction appears

---

## Expected Behavior

**On "Play Test Video" click:**
1. Overlay window shows
2. Video starts playing automatically
3. Dark semi-transparent background appears
4. "Press ESC to skip" text shows in bottom-right corner

**On ESC press:**
1. Video stops
2. Overlay hides
3. Can play again

**On video end:**
1. Overlay auto-hides
2. Can play again

---

## Known Notes

### Test Video Info
- **File:** `test-cutscene.mp4` (Big Buck Bunny - public domain)
- **Size:** ~150 MB
- **Duration:** ~9 minutes ⚠️ (use ESC to skip)
- **Location:** `public/videos/stories/test-cutscene.mp4`

### Recommendation
Replace with shorter racing videos (10-30 sec) for better testing:
- Download from: https://www.pexels.com/search/videos/racing/
- Place in: `public/videos/stories/`
- Update video path in App.tsx if using different filename

---

## Troubleshooting

### Video doesn't play
- Check browser console for errors (F12)
- Verify video file exists in `public/videos/stories/test-cutscene.mp4`
- Check video codec (should be H.264 MP4)

### ESC doesn't work
- Make sure overlay window has focus
- Click on overlay window first, then press ESC

### Overlay doesn't appear
- Check if Tauri dev server is running
- Look for errors in terminal
- Try clicking "Show Overlay" first

### Video has no audio
- Check system volume
- Verify video file has audio track
- Test video in VLC or media player first

---

## Next Steps After Testing

1. **Performance Check** - Monitor GPU/CPU usage during playback
2. **Multi-monitor Test** - Check overlay positioning on different displays
3. **Replace with Racing Videos** - Download shorter, racing-specific clips
4. **Begin Phase 3** - Implement telemetry integration for automatic triggers

---

## Testing Checklist

- [ ] Overlay shows/hides correctly
- [ ] Video plays with audio
- [ ] ESC skip works
- [ ] Auto-hide after video ends works
- [ ] Can replay video multiple times
- [ ] Performance is acceptable (no lag)
- [ ] Overlay stays on top of other windows

---

**Status:** Ready for immediate testing! 🚀

See `OVERLAY-POC-PLAN.md` for full implementation plan and next phases.
