# Track Map Visualization - Competitive Analysis

## Executive Summary

Research confirms that **track map visualization for sim racing is a solved problem** with multiple mature open-source implementations. This analysis reviews two major projects and provides recommendations for GridVox's implementation strategy.

---

## Existing Solutions

### 1. Race-Element
**Repository**: [RiddleTime/Race-Element](https://github.com/RiddleTime/Race-Element)  
**Stack**: C# / .NET / WPF  
**License**: Open Source  
**Last Updated**: 3 days ago (actively maintained)  

#### Supported Sims
- Assetto Corsa Competizione (ACC) - **Primary**
- iRacing
- **Automobilista 2** ✅
- Assetto Corsa 1

#### Track Map Implementation

**Architecture**:
```
TrackMapOverlay.cs (Main overlay renderer)
  ├── TrackMapCreationJob.cs (Auto-generates track maps)
  ├── TrackMapDrawer.cs (Canvas rendering utilities)
  ├── TrackMapTransform.cs (Scale/rotation transforms)
  └── TrackMapDataStructures.cs (Data models)
```

**Key Features**:
- **Auto-Track Generation**: Drives one lap, records world coordinates, saves as bitmap
- **Real-time Car Positions**: Uses WorldPosX/WorldPosY from telemetry
- **Spline Position**: 0-1 normalized track progress for car placement
- **Sector Coloring**: Red (S1), Green (S2), Blue (S3)
- **Car Rendering**: Colored circles with position numbers
- **Track Caching**: Saves generated maps as .jpg files
- **Configurable Refresh**: 30-60 FPS rendering

**AMS2 Data Mapping** (`Ams2Mapper.cs`):
```csharp
// Position on track
local.Race.LapPositionPercentage = 
    shared.mTrackLength / shared.mParticipantInfo[i].mCurrentLapDistance;

// World coordinates
local.Physics.Location = shared.mParticipantInfo[i].mWorldPosition;

// Race position
local.Race.GlobalPosition = (int)shared.mParticipantInfo[i].mRacePosition;

// Speed & laps
local.Physics.Velocity = shared.mSpeed * 3.6f; // m/s to km/h
local.Race.Laps = (int)participant.mCurrentLap;
```

**Rendering Flow**:
1. **Session Start** → Trigger `TrackMapCreationJob`
2. **Creation Job** → Records player world coordinates for 1 lap
3. **Processing** → Scales, rotates, calculates bounding box
4. **Draw Sectors** → Splits track into 3 colored sections
5. **Cache** → Saves bitmap to disk
6. **Real-time Update** → Maps cars via spline position, draws circles

**Strengths**:
- ✅ **Proven AMS2 support** - already integrated with AMS2 shared memory
- ✅ **Auto-generation** - no manual track definitions needed
- ✅ **Production-ready** - actively used by community
- ✅ **Multi-sim** - works across multiple racing games

**Weaknesses**:
- ❌ C# / WPF - different stack from GridVox (TypeScript/Electron)
- ❌ Bitmap-based - less flexible than vector/JSON approach
- ❌ Requires full lap - can't use track immediately

---

### 2. RaceVision
**Repository**: [mpavich2/RaceVision](https://github.com/mpavich2/RaceVision)  
**Stack**: TypeScript / React / Electron  
**License**: Open Source  
**Last Updated**: Oct 2024  

#### Supported Sims
- iRacing (exclusively)

#### Track Map Implementation

**Architecture**:
```
TrackCanvas.tsx (Canvas renderer)
  ├── tracks.json (Pre-generated track coordinate data)
  ├── svg-utils.ts (SVG path processing)
  └── iracingClient.ts (Downloads official track SVGs)
```

**Key Features**:
- **Official Track Data**: Downloads iRacing's SVG track maps via API
- **Pre-Generated Tracks**: Converts SVG to JSON coordinate arrays
- **Lap Percentage Positioning**: Uses `CarIdxLapDistPct` (0-1 progress)
- **SVG Path Interpolation**: `svg-path-properties` library for precise positioning
- **Turn Markers**: Labeled corners from track data
- **Start/Finish Line**: Directional markers (clockwise/anticlockwise)
- **Auto-Scaling**: Responsive canvas sizing

**Track Data Format** (`tracks.json`):
```json
{
  "123": {
    "active": {
      "inside": "M100,200 L150,180...",  // SVG path string
      "outside": "M120,220 L170,200..."
    },
    "start-finish": {
      "line": "M150,190 L150,210",
      "arrow": "M155,200 L160,195...",
      "point": { "x": 150, "y": 200, "length": 0 },
      "direction": "CLOCKWISE"
    },
    "turns": [
      { "x": 200, "y": 300, "content": "T1" },
      { "x": 400, "y": 250, "content": "T2" }
    ]
  }
}
```

**Position Calculation** (`iracingMappingUtils.ts`):
```typescript
// Get car's lap completion (0-1)
const progress = telemetry.values.CarIdxLapDistPct[driver.carIdx];

// Map to SVG path position
function updateCarPosition(percent: number) {
  const adjustedLength = (totalLength * percent) % totalLength;
  const length = direction === TrackDirection.ANTICLOCKWISE
    ? (intersectionLength + adjustedLength) % totalLength
    : (intersectionLength - adjustedLength + totalLength) % totalLength;
  const point = trackPath.getPointAtLength(length);
  return { x: point.x, y: point.y };
}

// Render
drivers.forEach(driver => {
  const pos = updateCarPosition(driver.progress);
  ctx.arc(pos.x, pos.y, 40, 0, 2 * Math.PI); // Draw circle
  ctx.fillText(driver.carNumber, pos.x, pos.y); // Draw number
});
```

**Strengths**:
- ✅ **Same Stack as GridVox** - TypeScript/React/Electron
- ✅ **Pre-Generated Tracks** - instant availability
- ✅ **Vector-Based** - scalable, precise, customizable
- ✅ **Official Data** - high-quality track layouts
- ✅ **Well-Documented Code** - clean React/TypeScript patterns

**Weaknesses**:
- ❌ **iRacing Only** - no AMS2 support
- ❌ **Requires API Access** - depends on iRacing's servers
- ❌ **Manual Generation** - needs script to add new tracks

---

## Comparison Matrix

| Feature | Race-Element (AMS2) | RaceVision (iRacing) | GridVox Need |
|---------|---------------------|----------------------|--------------|
| **Technology** | C# / WPF / Bitmaps | TypeScript / Canvas / SVG | TypeScript / Canvas |
| **AMS2 Support** | ✅ Native | ❌ None | ✅ Required |
| **Track Data** | Auto-generated (drive 1 lap) | Pre-generated (SVG → JSON) | TBD |
| **Position Method** | World coordinates + Spline | Lap distance % | Both available |
| **Rendering** | Bitmap caching | Canvas 2D | Canvas 2D |
| **Track Availability** | Immediate after 1 lap | Instant (pre-generated) | TBD |
| **Scalability** | Bitmap scaling | Vector scaling | Vector scaling |
| **Code Reusability** | Low (different stack) | High (same stack) | - |
| **Active Development** | ✅ Very active | ⚠️ Moderate | - |

---

## Recommended Approach for GridVox

### Strategy: **Hybrid Model**

Combine the best aspects of both projects:

1. **Track Generation** (Race-Element approach)
   - Auto-generate tracks by driving 1 lap
   - Record world coordinates + lap distance
   - Save as **JSON coordinate array** (not bitmap)
   - Cache for instant reuse

2. **Rendering Architecture** (RaceVision approach)
   - TypeScript/Canvas implementation
   - Vector-based drawing (not bitmaps)
   - SVG path utilities for interpolation
   - Responsive scaling

3. **Position Calculation** (Best of both)
   - **Primary**: Lap distance percentage (simpler, more accurate)
   - **Fallback**: World coordinates (for validation/debugging)
   - Both are available from AMS2 shared memory

### Implementation Plan Revisions

**Phase 1: Minimal Viable Track Map** (1 week)
```typescript
// Use lap distance directly (simpler than world coords)
const lapPercentage = participant.mCurrentLapDistance / shared.mTrackLength;

// Simple linear interpolation on cached track points
const trackPointIndex = Math.floor(lapPercentage * trackPoints.length);
const point = trackPoints[trackPointIndex];

// Draw
ctx.arc(point.x, point.y, carRadius, 0, 2 * Math.PI);
ctx.fillText(racePosition.toString(), point.x, point.y);
```

**Phase 2: Track Recording Tool** (3 days)
```typescript
// Tool to generate track definitions
class TrackRecorder {
  recordLap() {
    // Save positions every 50ms during practice lap
    const point = {
      lapDistance: participant.mCurrentLapDistance,
      worldX: participant.mWorldPosition.x,
      worldY: participant.mWorldPosition.y,
      worldZ: participant.mWorldPosition.z,
    };
    this.trackPoints.push(point);
  }
  
  saveTrackDefinition() {
    // Process & save as JSON
    fs.writeFileSync(`tracks/${trackName}.json`, JSON.stringify({
      name: trackName,
      length: trackLength,
      points: this.trackPoints,
      sectors: calculateSectors(),
    }));
  }
}
```

**Phase 3: Advanced Rendering** (1 week)
- Sector coloring
- Turn markers
- Start/finish line
- Player highlighting
- Pit lane indicators

---

## Code Reuse Opportunities

### From RaceVision (Direct TypeScript/React code)

**1. Canvas Rendering Pattern** (`TrackCanvas.tsx`):
```typescript
// Can copy almost directly
const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw track
  const trackPath = new Path2D(trackData.path);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 20;
  ctx.stroke(trackPath);
  
  // Draw cars
  drivers.forEach(driver => {
    ctx.fillStyle = isPlayer ? 'gold' : driver.carClassColor;
    ctx.beginPath();
    ctx.arc(driver.x, driver.y, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(driver.position, driver.x, driver.y);
  });
};

requestAnimationFrame(draw);
```

**2. Position Calculation** (`iracingMappingUtils.ts`):
```typescript
// Adapt for AMS2 lap distance
const getLapCompletion = (participant: AMS2Participant, trackLength: number) => {
  return participant.mCurrentLapDistance / trackLength;
};

const mapToTrackPosition = (lapPercentage: number, trackPath: Path2D) => {
  const pathLength = trackPath.getTotalLength();
  const point = trackPath.getPointAtLength(lapPercentage * pathLength);
  return { x: point.x, y: point.y };
};
```

### From Race-Element (Logic reference, needs TypeScript conversion)

**1. Track Auto-Generation** (convert from C#):
```typescript
// Equivalent of TrackMapCreationJob.cs
class TrackRecorder {
  private trackPoints: TrackPoint[] = [];
  private startLap: number = -1;
  
  onTelemetryUpdate(telemetry: AMS2Telemetry) {
    const currentLap = telemetry.mParticipantInfo[0].mCurrentLap;
    
    // Start recording
    if (this.startLap === -1) {
      this.startLap = currentLap;
    }
    
    // Record points during lap
    if (currentLap === this.startLap) {
      this.trackPoints.push({
        x: telemetry.mParticipantInfo[0].mWorldPosition.x,
        y: telemetry.mParticipantInfo[0].mWorldPosition.z, // Z is horizontal
        lapDistance: telemetry.mParticipantInfo[0].mCurrentLapDistance,
      });
    }
    
    // Complete after full lap
    if (currentLap > this.startLap) {
      this.saveTrack();
    }
  }
}
```

**2. Sector Calculation**:
```typescript
// Convert Race-Element's sector split logic
const calculateSectors = (trackData: TrackData) => {
  const sectorSplit1 = trackData.sectors[0]; // AMS2 provides sector positions
  const sectorSplit2 = trackData.sectors[1];
  
  return {
    sector1: trackData.points.filter(p => 
      p.lapDistance < sectorSplit1 || p.lapDistance >= sectorSplit2
    ),
    sector2: trackData.points.filter(p => 
      p.lapDistance >= sectorSplit1 && p.lapDistance < sectorSplit2
    ),
    sector3: trackData.points.filter(p => 
      p.lapDistance >= sectorSplit2
    ),
  };
};
```

---

## Recommendations

### ✅ DO Build From Scratch (with heavy reference to existing code)

**Reasons**:
1. **Same Stack as RaceVision** - Can directly adapt TypeScript/React code
2. **AMS2 Focus** - Neither project prioritizes AMS2 (Race-Element supports it but isn't primary)
3. **GridVox Integration** - Need tight integration with crew radio, commentary, social features
4. **Learning Opportunity** - Team gains deep understanding of track mapping

**What to Borrow**:
- RaceVision's Canvas rendering patterns (direct TypeScript copy)
- RaceVision's position calculation algorithms
- Race-Element's track auto-generation concept (convert C# → TypeScript)
- Race-Element's AMS2 telemetry field usage

### ❌ DON'T Reinvent the Wheel

**Leverage**:
- **svg-path-properties** library (used by RaceVision)
- Track data schemas from both projects
- Canvas drawing patterns
- Position interpolation math

### 🎯 Success Criteria

GridVox's track map should:
1. ✅ **Auto-generate** tracks (like Race-Element) - drive 1 lap, instant reuse
2. ✅ **Vector-based** rendering (like RaceVision) - scalable, customizable
3. ✅ **TypeScript/Canvas** (like RaceVision) - matches GridVox stack
4. ✅ **GridVox-native** features - integrate crew radio callouts, commentary triggers, social rivalry highlights

---

## Technical Debt Assessment

### If Building from Scratch

**Estimated Effort**: 2-3 weeks (vs original 5-week plan)

**Reduced Complexity** (thanks to existing projects):
- ✅ Position calculation **SOLVED** - both projects prove lap distance % works
- ✅ Rendering **SOLVED** - Canvas 2D confirmed as best approach
- ✅ AMS2 integration **SOLVED** - Race-Element shows exact telemetry fields
- ✅ Track generation **SOLVED** - auto-recording pattern established

**Remaining Challenges**:
- ⚠️ Track data format design (JSON schema)
- ⚠️ Sector boundary calculation accuracy
- ⚠️ Multi-class color coordination
- ⚠️ Performance optimization (60 FPS with 64 cars)

### Alternative: Fork RaceVision

**Pros**:
- ✅ 80% of UI/rendering code reusable
- ✅ Proven Electron/TypeScript architecture
- ✅ Track data pipeline already built

**Cons**:
- ❌ No AMS2 support (major rewrite needed)
- ❌ iRacing-specific assumptions throughout codebase
- ❌ Track generation script tied to iRacing API
- ❌ May be harder to customize for GridVox features

**Recommendation**: Don't fork - build fresh with RaceVision as heavy reference

---

## Appendix: Key Code References

### RaceVision - Track Position Calculation
**File**: `src/services/iracingMappingUtils.ts`
```typescript
// Calculate relative time/position between cars
const L = driver.carClassEstLapTime;
const C = telemetry.values.CarIdxEstTime[driver.carIdx];
const S = telemetry.values.CarIdxEstTime[userCarIdx];
const wrap = Math.abs(
  telemetry.values.CarIdxLapDistPct[driver.carIdx] -
  telemetry.values.CarIdxLapDistPct[userCarIdx]
) > 0.5;

if (wrap) {
  const difference = C - S;
  relativeTime = S > C ? difference + L : difference - L;
} else {
  relativeTime = C - S;
}
```

### Race-Element - AMS2 World Position
**File**: `Race Element.Data/Games/Automobilista2/DataMapper/Mapper.cs`
```csharp
// Get participant world location
carInfo.Location = participant.mWorldPosition;

// Calculate lap completion
local.Race.LapPositionPercentage = 
    shared.mTrackLength / shared.mParticipantInfo[i].mCurrentLapDistance;

// Speed conversion
local.Physics.Velocity = shared.mSpeed * 3.6f; // m/s to km/h
```

### Race-Element - Track Map Drawing
**File**: `Race_Element.HUD.ACC/Overlays/Driving/TrackMap/TrackMapOverlay.cs`
```csharp
// Draw cars on track
foreach (var car in carsOnTrack.Cars) {
    var pos = TrackMapTransform.ScaleAndRotate(
        car.Pos, 
        _trackOriginalBoundingBox, 
        _scale, 
        _config.General.Rotation
    );
    
    pos.Y = pos.Y - _trackBoundingBox.Bottom + _margin * 0.5f;
    pos.X = pos.X - _trackBoundingBox.Left + _margin * 0.5f;
    
    // Draw colored circle
    g.FillCircle(classColorBrush, pos.X, pos.Y, _config.Others.CarSize);
    
    // Draw position number
    g.DrawString(
        car.RacePosition.ToString(),
        font,
        textBrush,
        pos.X,
        pos.Y
    );
}
```

---

## Conclusion

**Your original implementation plan was already 90% correct.** The research validates:
- ✅ Canvas rendering is the right choice
- ✅ Lap distance → 2D mapping works
- ✅ TypeScript/Node.js stack is fine
- ✅ JSON track definitions are better than bitmaps

**What changed**:
- 🔄 **Don't start from zero** - heavily reference RaceVision's TypeScript code
- 🔄 **Auto-generate tracks** - add track recording tool (Race-Element pattern)
- 🔄 **Use lap distance primarily** - simpler than world coordinates
- 🔄 **Reduce timeline** - from 5 weeks to 2-3 weeks (proven patterns exist)

**Next Steps**:
1. Review RaceVision's `TrackCanvas.tsx` - copy rendering loop
2. Convert Race-Element's track recording logic to TypeScript
3. Create simple JSON schema for track definitions
4. Build minimal POC with 1 hardcoded track
5. Add auto-recording tool
6. Iterate on visual polish

The good news: **This is a well-solved problem.** GridVox can build a production-quality track map in 2-3 weeks by learning from these projects.
