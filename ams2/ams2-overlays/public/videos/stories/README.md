# SimVox.ai Story Video Assets

This directory contains video cutscenes for story-driven racing moments.

## Test Videos Needed

Place test video files here for POC development:

### Recommended Test Videos

1. **test-cutscene.mp4** - Generic test cutscene (15-30 seconds)
   - Resolution: 1920x1080 (16:9)
   - Format: H.264/MP4
   - Bitrate: 5-10 Mbps
   - Audio: AAC stereo

2. **test-lap-complete.mp4** - Celebration video for completing a lap
3. **test-race-start.mp4** - Intro video for race start
4. **test-overtake.mp4** - Dynamic video for successful overtakes

## Video Specifications

- **Format:** MP4 (H.264 video + AAC audio)
- **Resolution:** 1920x1080 (Full HD, 16:9 aspect ratio)
- **Frame Rate:** 30 fps or 60 fps
- **Bitrate:** 5-10 Mbps (good quality without excessive file size)
- **Duration:** 10-30 seconds (short cutscenes to avoid disrupting gameplay)
- **Audio:** Stereo AAC, 128-256 kbps

## Placeholder for Development

If you don't have test videos yet, you can:

1. **Download free stock racing videos** from:
   - Pexels: https://www.pexels.com/search/videos/racing/
   - Pixabay: https://pixabay.com/videos/search/racing/

2. **Create a simple test video** using:
   - OBS Studio (record a short clip)
   - Any video editor

3. **Use placeholder text video**:
   - Create a 15-second video with "TEST CUTSCENE" text
   - Use online tools like Kapwing or Canva

## Usage in POC

Videos are referenced in the overlay system like:

```typescript
await emit("play-overlay-video", { 
  src: "/videos/stories/test-cutscene.mp4" 
});
```

The overlay will:
- Display the video centered on screen
- Auto-hide when video ends
- Allow ESC key to skip
- Pause game action (in future telemetry integration)

## Future Story Videos

Once POC is validated, create story-specific cutscenes:
- Driver introduction sequences
- Rival encounters
- Championship moments
- Career progression milestones
- Dramatic race incidents
