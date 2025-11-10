# Video Assets for AMS2 Overlay POC

## Current Test Videos

### test-cutscene.mp4
- **Source:** Big Buck Bunny (public domain sample)
- **Size:** ~150 MB
- **Duration:** ~9 minutes
- **Note:** This is a placeholder for testing video playback functionality
- **Status:** ✅ Downloaded and ready for testing

## Recommended: Replace with Racing-Specific Videos

For better POC demonstration, download shorter racing videos from these free sources:

### Option 1: Pexels (Free, No Attribution Required)
Visit: https://www.pexels.com/search/videos/racing/

**Recommended videos:**
1. Racing car on track (10-15 seconds)
2. Pit stop sequence (5-10 seconds)
3. Victory celebration (5-10 seconds)

**How to download:**
1. Visit Pexels racing videos
2. Choose HD (1920x1080) version
3. Download as MP4
4. Rename to: `test-lap-complete.mp4`, `test-race-start.mp4`, etc.
5. Place in this directory

### Option 2: Pixabay (Free, No Attribution Required)
Visit: https://pixabay.com/videos/search/racing/

### Option 3: Coverr (Free Stock Videos)
Visit: https://coverr.co/search?q=racing

## Quick Test with Current Video

You can test the overlay immediately with the downloaded `test-cutscene.mp4`:

1. Run: `npm run tauri dev`
2. Click "Play Test Video"
3. Overlay should appear with video playing
4. Press ESC to skip

**Note:** The video is long (9 min), so you'll want to press ESC to skip quickly for testing purposes.

## For Production

Replace with actual racing cutscenes:
- Driver introduction sequences
- Rival encounters
- Championship moments
- Career progression milestones
- Dramatic race incidents

Duration: 10-30 seconds recommended for gameplay immersion.
