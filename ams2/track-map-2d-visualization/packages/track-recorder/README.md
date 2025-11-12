# Track Recorder

**IMPORTANT**: This package is a placeholder for future AMS2 track recording functionality.

## Current Status

🚧 **Not yet functional** - Requires native AMS2 memory reading capability.

## Prerequisites

To make this work, you need:

1. **POC-02 Native Addon**: The AMS2 memory reader from `simvox-desktop/pocs/poc-02-direct-memory`
2. **Build Tools**: Visual Studio Build Tools for compiling native modules

## Alternative Solutions (Use These Instead)

Since building the native addon is complex, here are **3 easier alternatives**:

### Option 1: Use the Demo's Mock Track (Current)
The demo already works with a generated oval track. This is sufficient for:
- Testing the Pixi.js renderer
- Verifying lap distance % positioning
- Demonstrating sector coloring
- Proving the concept

### Option 2: Extract iRacing SVG Paths
Virtual Pitwall has pre-made SVG paths for iRacing tracks:
```bash
# Download RivalTrackerPaths.1.0.js from:
# https://github.com/kart7990/virtualpitwall/blob/main/Pitwall.Web.App/public/js/RivalTrackerPaths.1.0.js

# Extract track paths and convert to SimVox.ai JSON format
# These can serve as templates for AMS2 tracks
```

### Option 3: Manual Track Definition
Create track JSON files manually using approximate coordinates:

```json
{
  "name": "Silverstone Grand Prix",
  "codeName": "silverstone_grand_prix",
  "length": 5891,
  "coordinates": [
    { "x": 100, "y": 500, "lapPercent": 0.0 },
    { "x": 150, "y": 450, "lapPercent": 0.05 },
    // ... trace the track roughly
  ],
  "svgPath": "M 100 500 L 150 450 ...",
  "sectors": [0.315, 0.707]  // From Race-Element data
}
```

## Future Implementation Plan

When ready to build the actual recorder:

1. **Integrate POC-02**:
   ```bash
   cd c:\DATA\SimVox.ai\simvox-desktop\pocs\poc-02-direct-memory
   npm install
   npm run build
   ```

2. **Link Native Addon**: Copy `ams2_memory.node` to this package

3. **Implement Recorder Logic**:
   - Read `mWorldPosition` (X, Y, Z) from shared memory
   - Track lap completion via `mCurrentLap`
   - Sample coordinates every 5-10 meters
   - Generate normalized JSON output

4. **Run Recorder**:
   ```bash
   npm run record
   # Drive one clean lap in AMS2
   # Track JSON saved automatically
   ```

## What the Final Tool Will Do

- ✅ Connect to AMS2 shared memory
- ✅ Wait for lap to start
- ✅ Sample world coordinates adaptively (every 5-10m based on speed)
- ✅ Track lap distance and percentage
- ✅ Detect lap completion
- ✅ Generate normalized coordinates (0-1000 range)
- ✅ Create SVG path for Pixi.js
- ✅ Save to `recorded-tracks/{track-name}.json`
- ✅ Include metadata (length, sectors, bounds)

## Current Recommendation

**For now**: Stick with the demo's generated oval track. It fully demonstrates:
- ✅ Pixi.js WebGL rendering (10x performance boost)
- ✅ Lap distance % → 2D position mapping
- ✅ Sector-based coloring
- ✅ Real-time car animation at 60+ FPS
- ✅ Position numbers on cars

**Later**: Once you need real tracks, choose:
1. Extract from Race-Element (has corner data already)
2. Use iRacing SVG paths as templates
3. Or build this recorder tool with POC-02 integration

---

**Status**: Placeholder / Future Enhancement  
**Priority**: Low (demo works without it)  
**Complexity**: High (requires native addon compilation)

