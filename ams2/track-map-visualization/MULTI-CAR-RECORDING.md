# Multi-Car Track Recording

## Overview

The track recorder now uses **multi-car averaging** to create more accurate track layouts. Instead of following just the player or a single car, it records the racing lines of **the first 10 cars to complete a lap**, then averages their paths to create the final track definition.

## Why Multi-Car Averaging?

1. **More Accurate**: Single car recordings can include mistakes, cutting corners, or going wide
2. **Smoother Lines**: Averaging multiple paths smooths out individual variations
3. **Better Racing Line**: The averaged path represents the optimal racing line used by most drivers
4. **No Driver Input**: You don't need to drive - just spectate the race!

## How It Works

### Recording Process

1. **Start Recording**: Click "🔴 Record Track (Drive 1 Lap)" and enter track name
2. **Automatic Tracking**: The system monitors ALL cars in the race
3. **Lap Detection**: Detects when each car completes a lap (lap percentage wraps from ~1.0 to ~0.0)
4. **First 10 Cars**: Records data from the first 10 cars to complete a clean lap
5. **Path Averaging**: After 10 cars finish, averages all their paths by lap percentage
6. **Auto-Complete**: Recording stops automatically and downloads the JSON file

### What Gets Recorded Per Car

- World position (X, Z coordinates) sampled every 50ms
- Lap percentage (0.0 - 1.0) for alignment
- Current sector (1, 2, or 3)
- ~200 points per lap per car

### Path Averaging Algorithm

1. **Reference Grid**: Creates 200 evenly-spaced target lap percentages (0.0, 0.005, 0.01, ...)
2. **Point Matching**: For each target percentage, finds the closest point from each car
3. **Coordinate Averaging**: Averages X/Y positions across all cars at each percentage
4. **Final Track**: Results in ~200 smoothed points representing the average racing line

## Usage

### In AMS2 Live Mode

```typescript
// 1. Connect to AMS2
btnConnectAMS2.click();

// 2. Load Spa-Francorchamps in AMS2 and start a race with AI

// 3. Start recording
btnRecordTrack.click();
// Enter "Spa-Francorchamps" when prompted

// 4. Wait for 10 cars to complete first lap
// Console output will show:
//    🚗 Tracking car #1 (Driver Name)
//    🚗 Tracking car #5 (Driver Name)
//    ✅ Car #1 completed lap (1/10)
//    ✅ Car #5 completed lap (2/10)
//    ...
//    🏁 All 10 cars completed! Averaging paths...
//    📊 Averaging 10 car paths...
//    ✅ Created 200 averaged track points

// 5. JSON auto-downloads: "recorded_spa-francorchamps.json"
```

### In Demo Mode (Testing)

Demo mode generates 12 mock cars on an oval track. You can test the multi-car recording:

```typescript
// 1. Start demo mode
btnDemoMode.click();

// 2. Start recording
btnRecordTrack.click();
// Enter "Test Oval"

// 3. Wait ~10 seconds for 10 cars to lap
// Recording auto-stops when complete
```

## Console Output Example

```
🔴 Started multi-car recording: Spa-Francorchamps
   Tracking first 10 cars to complete a lap
   🚗 Tracking car #1 (Max Verstappen)
   🚗 Tracking car #44 (Lewis Hamilton)
   🚗 Tracking car #16 (Charles Leclerc)
   ✅ Car #1 completed lap (1/10)
      Recorded 187 points
   🚗 Tracking car #11 (Sergio Perez)
   ✅ Car #44 completed lap (2/10)
      Recorded 192 points
   ...
   ✅ Car #5 completed lap (10/10)
      Recorded 189 points

🏁 All 10 cars completed! Averaging paths...

📊 Averaging 10 car paths...
   ✅ Created 200 averaged track points
```

## Technical Details

### Modified Files

**`packages/track-map-core/src/utils/trackRecorder.ts`**
- Added `CarLapData` interface to track individual car progress
- Updated `RecordingSession` with multi-car tracking fields
- New `averageCarPaths()` method for path averaging
- New `findClosestPoint()` helper for lap percentage alignment
- `recordSample()` now accepts any car, not just player
- Tracks up to 10 cars (configurable via `targetCarCount` parameter)

**`packages/track-map-demo/src/main.ts`**
- Updated telemetry callback to pass ALL cars to recorder
- Updated demo mode to pass ALL mock cars to recorder
- Auto-stops recording when 10 cars complete laps

### Data Structures

```typescript
interface CarLapData {
    carIndex: number;           // Unique car ID
    points: TrackPoint[];       // Recorded world positions
    lastLapPercentage: number;  // For lap wrap detection
    lapCompleted: boolean;      // Has this car finished a lap?
}

interface RecordingSession {
    trackName: string;
    sim: 'ams2' | 'iracing' | 'acc' | 'ac' | 'rf2';
    points: TrackPoint[];       // Legacy (unused in multi-car)
    startTime: number;
    lapComplete: boolean;       // True when 10 cars finish
    carData: Map<number, CarLapData>;  // Per-car tracking
    targetCarCount: number;     // Default: 10
    completedCarCount: number;  // How many finished
}
```

## Configuration

### Change Number of Cars Tracked

In `packages/track-map-demo/src/main.ts`:

```typescript
// Record with 5 cars instead of 10
trackRecorder.startRecording(trackName, 'ams2', 5);
```

### Change Sample Rate

In `packages/track-map-core/src/utils/trackRecorder.ts`:

```typescript
private sampleInterval = 50; // 50ms = 20 samples/sec
// Lower = more points, larger file
// Higher = fewer points, faster processing
```

### Change Final Point Count

In `averageCarPaths()`:

```typescript
const numSamples = Math.min(200, referenceCar.points.length);
// Increase to 300 for more detailed tracks
// Decrease to 100 for simpler tracks
```

## Advantages Over Single-Car Recording

| Aspect | Single Car | Multi-Car Average |
|--------|-----------|-------------------|
| **Accuracy** | One driver's line | Consensus racing line |
| **Errors** | All mistakes included | Mistakes averaged out |
| **Corners** | May cut or go wide | Optimal apex/exit |
| **Driver Skill** | Dependent on driver | Independent |
| **Effort** | Must drive perfectly | Just spectate |
| **Consistency** | Varies by lap | Highly consistent |

## Troubleshooting

**"Only 3 cars completed, not 10"**
- Race session may be too short
- Cars retired/crashed
- Lower `targetCarCount` to 5 or 3

**"Recording never completes"**
- Make sure it's a race, not qualifying (need multiple cars)
- Check console for lap completion messages
- Verify world position data is available

**"Track looks jagged"**
- Increase `numSamples` in `averageCarPaths()` to 300
- Decrease `sampleInterval` to 30ms for more data

**"File too large"**
- Decrease `numSamples` to 100
- Points are already normalized to 0-1920 x 0-1080 canvas

## Future Enhancements

- [ ] Weighted averaging (faster cars have more influence)
- [ ] Corner detection from speed data
- [ ] Sector boundary refinement
- [ ] Variable point density (more points in corners)
- [ ] Track limits validation
- [ ] Racing line heat maps

## Example Output

Recorded track JSON includes:

```json
{
  "id": "recorded_spa-francorchamps",
  "name": "Spa-Francorchamps",
  "sim": "ams2",
  "length": 7004.2,
  "points": [
    { "x": 960, "y": 100, "lapPercentage": 0.000, "sector": 1 },
    { "x": 961, "y": 102, "lapPercentage": 0.005, "sector": 1 },
    ...
  ],
  "sectors": { "sector1End": 0.33, "sector2End": 0.67 },
  "metadata": {
    "generatedBy": "auto",
    "generatedDate": "2025-11-08T19:45:00.000Z",
    "version": "1.0"
  }
}
```

## Summary

✅ **No more driving laps yourself!**  
✅ **More accurate racing lines**  
✅ **Automatic lap detection**  
✅ **Smoothed, averaged paths**  
✅ **Just start a race and record**
