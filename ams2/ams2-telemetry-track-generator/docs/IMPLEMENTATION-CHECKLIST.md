# Implementation Checklist - Automatic Feature Detection

**Task list for implementing all automatic features in the 3-run mapping generator**

---

## Phase 0: Recording Pipeline Guardrails (Priority: HIGH)

### ✅ Stop Workflow
- [x] Export run recordings on stop *Stop & Save triggers exportRunTypeRecordings so laps land in telemetry-data.*

## Phase 1: Core Alignment (Priority: CRITICAL)

### ✅ Start/Finish Line Detection
- [ ] Implement `findStartFinishByLapDistance()`
  - Detect `mCurrentLapDistance` reset (trackLength → 0)
- [ ] Implement `findStartFinishByLapNumber()`
  - Detect `mCurrentLap` increment
- [ ] Implement `findStartFinishBySector()`
  - Detect `mCurrentSector` reset (3 → 0)
- [ ] Implement cross-validation
  - Compare all 3 methods
  - Use median/average of results
  - Return confidence score (1.0 if all agree)
- [ ] Add start/finish line marker to glTF
  - Checkered flag texture
  - Perpendicular to track direction
  - Metadata: `startFinishLine: { position, distance: 0.0, confidence }`

**Estimated Time**: 2 hours

---

### ✅ Run Alignment
- [ ] Implement `rotateToStart()`
  - Rotate telemetry array to start at detected start/finish
  - Preserve all data fields
- [ ] Implement `resampleToUniformDensity()`
  - Resample all 3 runs to same point count (1000 points)
  - Use linear interpolation between points
  - Preserve position, elevation, speed, etc.
- [ ] Implement `alignRuns()`
  - Call findStartFinish on all 3 runs
  - Call rotateToStart on all 3 runs
  - Call resampleToUniformDensity
  - Verify alignment quality (check distances match)
- [ ] Add alignment diagnostics
  - Log start/finish positions for each run
  - Log alignment confidence scores
  - Warn if runs don't align well (<0.7 confidence)

**Estimated Time**: 3 hours

**Total Phase 1**: 5 hours

---

## Phase 2: Track Surface Generation (Priority: HIGH)

### ✅ Track Mesh Creation
- [ ] Implement `createTrackSurface()`
  - Create CatmullRomCurve3 from inside border points
  - Create CatmullRomCurve3 from outside border points
  - Sample both curves at 500 segments
  - Generate triangulated mesh (quad strips between curves)
  - Set normals (pointing up)
  - Set UVs (for texturing)
- [ ] Implement track material
  - Dark asphalt color (0x333333)
  - Roughness: 0.8
  - Metalness: 0.1
- [ ] Add to glTF scene

**Estimated Time**: 2 hours

---

### ✅ Racing Line Overlay
- [ ] Implement `createRacingLineGeometry()`
  - Create BufferGeometry from racing line points
  - Green color (0x00FF00)
  - LineBasicMaterial with linewidth: 2
  - Position slightly above track surface (+0.1m Y)
- [ ] Add to glTF scene

**Estimated Time**: 1 hour

**Total Phase 2**: 3 hours

---

## Phase 3: Automatic Feature Detection (Priority: HIGH)

### ✅ Sector Boundaries
- [ ] Implement `detectSectorBoundaries()`
  - Loop through frames, detect `mCurrentSector` changes
  - Record position, distance, frameIndex
  - Create array of 3 sector boundaries
- [ ] Create sector markers
  - Vertical colored planes across track
  - S1 = Blue, S2 = Yellow, S3 = Red
  - Labels: "Sector 1", "Sector 2", "Sector 3"
- [ ] Add to metadata JSON
  - `sectors: [{ number, boundary: { distance, position } }]`
- [ ] Add to glTF scene

**Estimated Time**: 2 hours

---

### ✅ Curb Detection
- [ ] Implement `detectCurbs()`
  - Method 1: Elevation spikes in `mTyreY[4]` (>5cm threshold)
  - Method 2: `mTerrain[4]` = 7 (rumble) or 9 (kerbs)
  - Cross-validate both methods
  - Record curb positions
- [ ] Create curb geometry
  - Red/white alternating pattern
  - Box geometry (0.5m wide × 0.1m tall × track width)
  - Position at detected locations
- [ ] Add to glTF scene
- [ ] Add to metadata
  - `curbs: [{ position, height, type }]`

**Estimated Time**: 3 hours

---

### ✅ Pit Lane Extraction
- [ ] Implement `extractPitLane()`
  - Detect `mPitMode` changes (0→1 = entry, 3→0 = exit)
  - Record pit lane path while `mPitMode` ∈ {1, 2, 3}
  - Calculate pit lane length
- [ ] Create pit lane geometry
  - Separate track mesh (gray asphalt)
  - Narrower than main track (8m wide)
  - Entry marker (green arrow)
  - Exit marker (yellow arrow)
- [ ] Add to glTF scene
- [ ] Add to metadata
  - `pitLane: { entry, exit, length, speedLimit: 80 }`

**Estimated Time**: 3 hours

---

### ✅ Corner Detection
- [ ] Implement `calculateCurvature(p1, p2, p3)`
  - Calculate radius of circle through 3 points
  - Return curvature (1/radius)
- [ ] Implement `detectCorners()`
  - Loop through frames with window size 5
  - Calculate curvature at each point
  - Detect corner entry (curvature > 0.008 rad/m)
  - Detect corner exit (curvature < 0.008 rad/m)
  - Record entry, apex (slowest point), exit
- [ ] Implement `classifyCorner()`
  - Calculate average speed
  - Calculate total turn angle
  - Classify: flat-out, fast-sweeper, medium-speed, slow-corner, hairpin, chicane, kink
- [ ] Implement `estimateRadius()`
  - Average curvature over corner frames
  - Return radius in meters
- [ ] Create corner markers
  - Number labels (T1, T2, T3...)
  - Entry/apex/exit markers (small spheres)
  - Color by type (fast=red, medium=yellow, slow=blue)
- [ ] Add to metadata
  ```json
  corners: [{
    number, name, type,
    entry: { distance, position },
    apex: { distance, position, speed },
    exit: { distance, position },
    radius, averageSpeed
  }]
  ```
- [ ] Add to glTF scene

**Estimated Time**: 4 hours

---

### ✅ Braking Zones
- [ ] Implement `detectBrakingZones()`
  - Calculate deceleration: `(prevSpeed - currSpeed) * 60`
  - Detect braking: deceleration > 3.0 m/s² AND `mBrake` > 0.3
  - Record start/end of braking
  - Calculate speed loss, duration
- [ ] Create braking markers
  - Red cones/markers at braking points
  - Size based on deceleration intensity
  - Distance lines showing braking zone
- [ ] Add to metadata
  ```json
  brakingZones: [{
    corner, distance,
    speedBefore, speedAfter,
    deceleration, duration
  }]
  ```
- [ ] Add to glTF scene

**Estimated Time**: 2 hours

---

### ✅ Speed Zones
- [ ] Implement `generateSpeedZones()`
  - Loop through all frames
  - Classify by speed: >200 (high), 100-200 (medium), <100 (low)
  - Record positions for each zone
  - Calculate statistics (length, percentage)
- [ ] Create speed zone visualization
  - Color track surface by speed
  - Red = high, Yellow = medium, Blue = low
  - Or use colored lines along track edges
- [ ] Add to metadata
  ```json
  speedZones: {
    highSpeed: { length, percentage },
    mediumSpeed: { length, percentage },
    lowSpeed: { length, percentage }
  }
  ```
- [ ] Optional: Add to glTF (colored sections)

**Estimated Time**: 2 hours

---

### ✅ Elevation Profile
- [ ] Implement `extractElevationProfile()`
  - Already done during track surface creation
  - Use `mWorldPosition[1]` (Y coordinate)
  - Record min, max, range
- [ ] Implement `detectBankedCorners()`
  - Check for lateral elevation changes (>30cm)
  - Identify which corners are banked
- [ ] Add to metadata
  ```json
  elevation: {
    min, max, range,
    bankedCorners: [{ corner, banking, position }]
  }
  ```
- [ ] Track surface already uses real elevation

**Estimated Time**: 1 hour

**Total Phase 3**: 17 hours

---

## Phase 4: Additional Features (Priority: MEDIUM)

### ✅ Runoff Areas
- [ ] Implement `detectRunoffAreas()`
  - Check `mTerrain[4]` for each frame
  - Grass = 3, 4
  - Gravel = 5, 6
  - Record positions per type
- [ ] Create runoff geometry
  - Green patches for grass
  - Gray patches for gravel
  - Slightly below track level
- [ ] Add to metadata
  ```json
  surfaceTypes: {
    asphalt, curbs, grass, gravel
  }
  ```
- [ ] Add to glTF scene

**Estimated Time**: 2 hours

**Note**: Only detects runoff you drive over. For complete runoff mapping, need additional "runoff exploration" lap.

---

### ✅ Track Temperature Heatmap
- [ ] Implement `mapTrackTemperature()`
  - Record `mTrackTemperature` per position
  - Calculate min, max, range
  - Generate color gradient (blue to red)
- [ ] Create temperature visualization
  - Vertex colors on track surface
  - Or separate overlay geometry
- [ ] Add to metadata
  ```json
  temperature: {
    min, max, average,
    heatmap: [{ position, temp, normalized }]
  }
  ```
- [ ] Optional: Add to glTF

**Estimated Time**: 2 hours

---

### ✅ Weather Conditions
- [ ] Implement `extractWeatherData()`
  - Get first frame's weather data
  - Record: rain, snow, wind, cloud, temps
- [ ] Add to metadata
  ```json
  weather: {
    conditions: "Dry" | "Light Rain" | "Heavy Rain",
    rainDensity, snowDensity,
    ambientTemp, trackTemp,
    windSpeed, windDirection: [x, y],
    cloudCover
  }
  ```

**Estimated Time**: 1 hour

**Total Phase 4**: 5 hours

---

## Phase 5: Metadata & Export (Priority: HIGH)

### ✅ Metadata JSON Generation
- [ ] Create metadata structure (see AUTO-FEATURES-SUMMARY.md)
- [ ] Populate all detected features
- [ ] Include track info (name, variation, length)
- [ ] Include recording info (date, game version)
- [ ] Export to `.json` file alongside `.glb`

**Estimated Time**: 2 hours

---

### ✅ glTF Export Enhancement
- [ ] Organize scene hierarchy
  ```
  scene
  ├── trackSurface (mesh)
  ├── racingLine (line)
  ├── curbs (group)
  ├── sectors (group)
  ├── corners (group)
  ├── brakingZones (group)
  ├── pitLane (group)
  └── markers (group)
  ```
- [ ] Add descriptive names to all objects
- [ ] Ensure proper materials
- [ ] Optimize geometry (reduce vertices if needed)
- [ ] Export with GLTFExporter
- [ ] Run Draco compression

**Estimated Time**: 2 hours

**Total Phase 5**: 4 hours

---

## Phase 6: Testing & Validation (Priority: CRITICAL)

### ✅ Unit Tests
- [ ] Test `findStartFinishByLapDistance()`
- [ ] Test `findStartFinishByLapNumber()`
- [ ] Test `findStartFinishBySector()`
- [ ] Test `rotateToStart()`
- [ ] Test `resampleToUniformDensity()`
- [ ] Test `alignRuns()`
- [ ] Test `createTrackSurface()`
- [ ] Test `detectSectorBoundaries()`
- [ ] Test `detectCurbs()`
- [ ] Test `detectCorners()` and `classifyCorner()`
- [ ] Test `detectBrakingZones()`
- [ ] Test `generateSpeedZones()`

**Estimated Time**: 4 hours

---

### ✅ Integration Tests
- [ ] Create synthetic test data
  - Simple circular track
  - 3 runs with slight variations
  - Known start/finish position
- [ ] Run full pipeline
- [ ] Verify output glTF
  - Track surface exists
  - Racing line exists
  - Features detected correctly
- [ ] Verify metadata JSON
  - All fields populated
  - Correct values

**Estimated Time**: 3 hours

---

### ✅ Real Track Test
- [ ] Record 3 laps on real track (e.g., Silverstone)
  - Outside border
  - Inside border
  - Racing line
- [ ] Run generator with real data
- [ ] Load output in Three.js viewer
- [ ] Verify:
  - Track looks correct
  - Corners numbered properly
  - Curbs in right places
  - Sectors aligned
  - Pit lane (if recorded)
- [ ] Compare with reference images/videos
- [ ] Fix any issues

**Estimated Time**: 4 hours

**Total Phase 6**: 11 hours

---

## Phase 7: Documentation & Examples (Priority: MEDIUM)

### ✅ Update Documentation
- [ ] Update GETTING-STARTED.md with new features
- [ ] Update IMPLEMENTATION-PLAN.md with automatic detection details
- [ ] Update README.md with feature list
- [ ] Update 3-RUN-MAPPING-METHOD.md (already done)
- [ ] Add TELEMETRY-FEATURES.md reference (already done)
- [ ] Add AUTO-FEATURES-SUMMARY.md (already done)

**Estimated Time**: 2 hours

---

### ✅ Create Examples
- [ ] Example: Load track in Three.js with all features visible
- [ ] Example: Telemetry replay on generated track
- [ ] Example: Corner info overlay
- [ ] Example: Speed zone visualization
- [ ] Example: Braking point markers

**Estimated Time**: 3 hours

**Total Phase 7**: 5 hours

---

## Total Estimated Time

| Phase | Hours |
|-------|-------|
| Phase 1: Core Alignment | 5 |
| Phase 2: Track Surface | 3 |
| Phase 3: Auto Features | 17 |
| Phase 4: Additional Features | 5 |
| Phase 5: Metadata & Export | 4 |
| Phase 6: Testing | 11 |
| Phase 7: Documentation | 5 |
| **TOTAL** | **50 hours** |

**~1.5 weeks of development work** to implement all automatic features.

---

## Priority Order

### Week 1: MVP (Core Features)
1. ✅ Phase 1: Core Alignment (5 hrs)
2. ✅ Phase 2: Track Surface (3 hrs)
3. ✅ Phase 3 (partial): Sectors, Curbs, Corners (9 hrs)
4. ✅ Phase 5: Basic Metadata (2 hrs)
5. ✅ Phase 6 (partial): Integration Test (3 hrs)

**Week 1 Total**: 22 hours → **Functional 3-run mapping with basic features**

### Week 2: Full Features
6. ✅ Phase 3 (complete): Pit Lane, Braking, Speed, Elevation (8 hrs)
7. ✅ Phase 4: Runoff, Temperature, Weather (5 hrs)
8. ✅ Phase 5: Complete Metadata (2 hrs)
9. ✅ Phase 6: Full Testing (8 hrs)
10. ✅ Phase 7: Documentation & Examples (5 hrs)

**Week 2 Total**: 28 hours → **All features, tested, documented**

---

## Quick Wins (Implement First)

These features are easiest to implement and provide immediate value:

1. **Start/Finish Detection** (2 hrs) - Critical for alignment
2. **Sector Boundaries** (2 hrs) - Direct from telemetry
3. **Track Surface** (2 hrs) - Core feature
4. **Racing Line** (1 hr) - Simple line geometry
5. **Metadata Export** (2 hrs) - Enables all other features

**Total Quick Wins**: 9 hours → Basic functional system

---

## Dependencies

```
Phase 2 depends on Phase 1 (need aligned runs)
Phase 3 depends on Phase 1 (need aligned runs)
Phase 4 depends on Phase 1 (need aligned runs)
Phase 5 depends on Phase 3 & 4 (need features to export)
Phase 6 depends on all previous (testing implementation)
Phase 7 depends on Phase 6 (document tested features)
```

**Cannot parallelize phases, must be sequential.**

---

## Success Criteria

### Minimum Viable Product (MVP)
- [ ] Aligned 3-run track surface generated
- [ ] Start/finish line detected automatically
- [ ] Sectors detected and marked
- [ ] Curbs detected
- [ ] Output as glTF + metadata JSON
- [ ] Loads correctly in Three.js

### Full Release
- [ ] All 11 automatic features implemented
- [ ] Comprehensive metadata JSON
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Examples working
- [ ] Tested on 3+ real tracks

---

## Current Status

- [x] Documentation complete (3-RUN-MAPPING-METHOD.md, TELEMETRY-FEATURES.md, AUTO-FEATURES-SUMMARY.md)
- [ ] Implementation (0% - not started)
- [ ] Testing (0% - not started)
- [ ] Examples (0% - not started)

**Next Action**: Begin Phase 1 - Core Alignment implementation

---

## Notes

### Telemetry Format Assumptions

The implementation assumes telemetry data is in this format:

```typescript
interface TelemetryFrame {
  // Core position
  mWorldPosition: [number, number, number]; // [x, y, z]
  mCurrentLapDistance: number;
  
  // Track info
  mTrackLength: number;
  mTrackLocation: string;
  mTrackVariation: string;
  
  // Lap/sector info
  mCurrentLap: number;
  mCurrentSector: number; // 0, 1, 2, or 3
  
  // Vehicle state
  mSpeed: number; // m/s
  mBrake: number; // 0.0-1.0
  mGear: number;
  
  // Wheels
  mTyreY: [number, number, number, number]; // [FL, FR, RL, RR]
  mTerrain: [number, number, number, number];
  
  // Pit
  mPitMode: number; // 0-5
  
  // Temperature
  mTrackTemperature: number;
  mAmbientTemperature: number;
  
  // Weather
  mRainDensity: number;
  
  // ... more fields available
}
```

Verify POC telemetry output matches this structure before implementation.

---

## Implementation Files

### New Files to Create
- `src/lib/alignment/findStartFinish.ts`
- `src/lib/alignment/rotateToStart.ts`
- `src/lib/alignment/resampleData.ts`
- `src/lib/alignment/alignRuns.ts`
- `src/lib/detection/detectSectors.ts`
- `src/lib/detection/detectCurbs.ts`
- `src/lib/detection/detectCorners.ts`
- `src/lib/detection/detectBraking.ts`
- `src/lib/detection/detectSpeedZones.ts`
- `src/lib/detection/extractPitLane.ts`
- `src/lib/detection/extractElevation.ts`
- `src/lib/geometry/createTrackSurface.ts`
- `src/lib/geometry/createRacingLine.ts`
- `src/lib/geometry/createCurbGeometry.ts`
- `src/lib/geometry/createMarkers.ts`
- `src/lib/export/generateMetadata.ts`
- `src/lib/export/exportGLTF.ts`
- `src/lib/types/telemetry.ts`
- `src/lib/types/metadata.ts`

### Files to Modify
- `scripts/generate-procedural-track.ts` - Main orchestration
- `package.json` - Add new script commands
- `tsconfig.json` - Ensure paths correct

**Total new code**: ~3000-4000 lines estimated

---

**Ready to start implementation!** 🚀
