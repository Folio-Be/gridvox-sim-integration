# Track Recorder - How To Use

## Overview

The track recorder creates track layouts from **actual telemetry data**, just like professional tools like Fast-F1. This is much more accurate than using pre-made SVG files.

## Why We Removed iRacing Tracks

The iRacing tracks from Virtual Pitwall were **incomplete SVG path segments** - not full track layouts. They only contained 1-12 points per track, which is why you saw weird disconnected lines instead of proper tracks.

**Professional approach (Fast-F1, etc.):** Plot actual GPS/telemetry positions from a real lap.

## How to Record a Track

### Step 1: Start AMS2 and Enter a Session

1. Launch Automobilista 2
2. Select any track
3. Enter Practice or Test Drive mode
4. **Important:** Make sure your car has telemetry enabled

### Step 2: Record the Track

1. Open the Track Map Demo (http://localhost:3000)
2. Start Demo Mode to verify the renderer is working
3. Click "🔴 Record Track (Drive 1 Lap)"
4. Enter a track name (e.g., "Spa-Francorchamps")
5. **Drive ONE clean lap in AMS2**
6. The recorder will automatically stop when you cross the start/finish line
7. A JSON file will download automatically

### Step 3: Use Your Recorded Track

1. Copy the downloaded JSON file to `packages/track-map-demo/public/recorded-tracks/ams2/`
2. Add it to the track catalog in `trackLoader.ts`:

```typescript
export const TRACK_CATALOG: TrackMetadata[] = [
    { 
        id: 'recorded_spa_francorchamps',  // Same as filename
        name: 'Spa-Francorchamps (Recorded)', 
        source: 'ams2', 
        category: 'F1' 
    },
];
```

3. Refresh the browser
4. Select your track from the dropdown

## How It Works

The recorder samples your car's world position (X, Y, Z coordinates) every 50ms during the lap. When you complete the lap:

1. **Normalization:** All coordinates are scaled to fit the 1920x1080 canvas
2. **Centering:** The track is centered with 100px padding
3. **Sector Detection:** Sectors are calculated from lap percentage
4. **Track Length:** Estimated from point-to-point distances

## Recording Tips

✅ **DO:**
- Drive a clean, consistent lap
- Stay on the racing line
- Complete the full lap (cross start/finish)
- Use Practice mode for unlimited time

❌ **DON'T:**
- Cut corners or go off-track
- Pit during the recording lap
- Drive slowly (it will work but track won't look smooth)

## Demo Mode vs Real Telemetry

**Demo Mode** (Current):
- Uses mock car positions on an oval track
- Good for testing the recorder
- Creates simple oval tracks

**Real Telemetry** (Future - when POC-02 is ready):
- Reads actual AMS2 shared memory
- Creates accurate real-world track layouts
- Can record any AMS2 track

## Troubleshooting

**"Recording not stopping"**
- Make sure you cross the start/finish line
- The recorder detects lap completion when lapPercentage wraps from ~1.0 to ~0.0

**"Track looks wrong"**
- You may have cut corners or gone off-track
- Delete the file and record again with a cleaner lap

**"Not enough points"**
- Increase the sample rate in `trackRecorder.ts` (default: 50ms)
- Lower number = more points (but larger files)

## Next Steps

Once you have POC-02 (AMS2 shared memory) working:
1. The recorder will automatically use real telemetry
2. You can record all AMS2 tracks with accurate layouts
3. The tracks will show real corner speeds and racing lines

This is the **correct way** to build track maps - the same approach used by Fast-F1, iRacing SDK tools, and professional telemetry systems!
