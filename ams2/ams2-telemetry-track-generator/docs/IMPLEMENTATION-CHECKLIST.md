# Implementation Checklist - Automatic Feature Detection

**Task list for implementing all automatic features in the 3-run mapping generator**

---

## Phase 0: Recording Pipeline Guardrails (Priority: HIGH)

### ✅ Stop Workflow
- [x] Export run recordings on stop *Stop & Save triggers exportRunTypeRecordings so laps land in telemetry-data.*

## Phase 1: Core Alignment (Priority: CRITICAL) ✅

### ✅ Start/Finish Line Detection
- [x] Implement `findStartFinishByLapDistance()` *Multi-method detection with lapDistance reset (trackLength → 0)*
- [x] Implement `findStartFinishByLapNumber()` *Detects mCurrentLap increment*
- [x] Implement `findStartFinishBySector()` *Detects mCurrentSector reset (3 → 0)*
- [x] Implement cross-validation *Cross-validates all 3 methods with confidence scoring*
- [ ] Add start/finish line marker to glTF
  - Checkered flag texture
  - Perpendicular to track direction
  - Metadata: `startFinishLine: { position, distance: 0.0, confidence }`

---

### ✅ Run Alignment
- [x] Implement `rotateToStart()` *Rotates telemetry array to detected start/finish index*
- [x] Implement `resampleToUniformDensity()` *Resamples all 3 runs to same point count with linear interpolation*
- [x] Implement `alignRuns()` *Complete alignment pipeline with start/finish detection, rotation, and resampling*
- [x] Add alignment diagnostics *Logs start/finish positions, confidence scores, alignment quality warnings*

**Total Phase 1**: ✅ COMPLETE

---

## Phase 2: Track Surface Generation (Priority: HIGH) ✅

### ✅ Track Mesh Creation
- [x] Implement `createTrackSurface()` *Complete with CatmullRom curves, quad strips, normals, UVs*
- [x] Implement track material *MeshStandardMaterial with asphalt properties (0x333333, roughness 0.8, metalness 0.1)*
- [x] Add to glTF scene *Exported via gltf-transform with optimization*

---

### ✅ Racing Line Overlay
- [x] Implement `createRacingLineGeometry()` *Basic line and tube variants with green color*
- [x] Add to glTF scene *Both Line and TubeGeometry variants supported*

**Total Phase 2**: ✅ COMPLETE

---

## Phase 2b: UI Integration & Real Data Testing (Priority: CRITICAL) ✅

### ✅ Data Validation with Real Telemetry
- [x] Create validation test script *Created test-with-real-data.ts for end-to-end testing*
- [x] Load Brands Hatch Indy data from AppData *Loads 3 runs: outside, inside, racing*
- [x] Updated loadRunsFromFiles() to handle wrapped JSON format *Handles both raw arrays and {telemetry: [...]} structure*
- [x] Validate track generation pipeline *Successfully generates track surface + racing line from real data*

---

### ✅ glTF Export Fixes
- [x] Fixed "GLB must have 0–1 buffers" error *Modified exportGLTF.ts to use single shared buffer for all geometry*
- [x] Fixed track surface closure gap *Added curve smoothing with point duplication for smooth CatmullRom interpolation*
- [x] Fixed overlapping geometry at start/finish *Modified vertex loop to process exactly `segments` points for closed curves*
- [x] Extracted smoothing into reusable helper *Created smoothClosedCurve.ts with applyCurveSmoothing() function*

---

### ✅ Smoothing Configuration
- [x] Created smoothClosedCurve.ts helper *Reusable smoothing utilities with CurveSmoothingOptions interface*
- [x] Added smoothing options to TrackSurfaceOptions *Can toggle smoothing on/off and adjust intensity*
- [x] Added smoothing options to RacingLineOptions *Smoothing configurable for racing line tube geometry*
- [x] Updated createTrackSurface() to use helper *Refactored from manual loop to applyCurveSmoothing()*
- [x] Updated createRacingLineTube() to use helper *Consistent smoothing across all geometry*

---

### 🎯 Test Results (Brands Hatch Indy)
- **Track Length**: 1931m
- **Generated Files**: brandshatch-indy.glb + .json metadata
- **Track Quality**: Track shape correct, racing line visible, smooth closure at start/finish
- **Alignment**: 9.78m start delta (car spawn point to start line - expected for single-lap recordings)
- **Visual Quality**: No gaps, no z-fighting, smooth continuous surface

**Total Phase 2b**: ✅ COMPLETE

---

## Phase 2c: 3D Track Viewer Integration (Priority: CRITICAL)

### Three.js GLB Viewer Component
- [ ] Create `TrackViewer3D.tsx` component *Three.js scene with GLTFLoader, lighting, and OrbitControls*
- [ ] Implement GLB file loading *Use GLTFLoader to load .glb files from Tauri file:// protocol*
- [ ] Setup scene lighting *Ambient + directional lights for proper track visibility*
- [ ] Add OrbitControls *Camera manipulation: orbit, zoom, pan*
- [ ] Implement layer visibility toggles *Show/hide racing line, track surface, sectors, etc.*
- [ ] Auto-center camera on track bounds *Calculate bounds and position camera for optimal view*

**Estimated Time**: 1.5 hours

---

### Tauri Backend Track Generation Command
- [ ] Create `track_generation.rs` module *Rust module for track generation command*
- [ ] Implement `generate_track` command *Execute Node.js script via std::process::Command*
- [ ] Parse script output *Extract .glb and .json file paths from stdout*
- [ ] Emit progress events *Real-time progress updates during generation*
- [ ] Register command in lib.rs *Make command available to frontend*

**Estimated Time**: 1 hour

---

### ProcessingScreen Backend Integration
- [ ] Wire to real track generation *Replace mock start_processing with generate_track command*
- [ ] Pass telemetry file paths *Use exportedFiles from initialPayload*
- [ ] Pass track metadata *trackKey, location, variation from initialPayload*
- [ ] Handle progress events *Display real progress from backend*
- [ ] Store .glb path in result *Save returned file path to pass to PreviewScreen*

**Estimated Time**: 1 hour

---

### PreviewScreen Viewer Integration
- [ ] Replace placeholder image *Remove <img> placeholder, add <TrackViewer3D>*
- [ ] Pass .glb file path to viewer *Use glbPath from processingResult*
- [ ] Wire layer toggle controls *Connect existing UI toggles to viewer visibility*
- [ ] Update export functionality *Copy .glb + .json to user-selected location*

**Estimated Time**: 0.5 hours

---

### File Path & Tauri Context Handling
- [ ] Configure output directory *Set to <AppData>/track-models/<track-key>/*
- [ ] Handle Tauri file:// protocol *Convert paths for Three.js asset loading*
- [ ] Cross-platform path handling *Use @tauri-apps/api/path for Windows/Mac/Linux*
- [ ] Test file access permissions *Verify Tauri can read generated files*

**Estimated Time**: 0.5 hours

---

### Testing & Validation
- [ ] Test with Brands Hatch Indy data *End-to-end: Record → Process → View*
- [ ] Verify 3D model rendering *Track surface and racing line visible*
- [ ] Test camera controls *Orbit, zoom, pan work smoothly*
- [ ] Test layer toggles *Show/hide track elements*
- [ ] Test export functionality *Save .glb + .json to chosen location*

**Estimated Time**: 0.5 hours

**Total Phase 2c**: 5 hours

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

| Phase | Hours | Status |
|-------|-------|--------|
| Phase 1: Core Alignment | 5 | ✅ COMPLETE |
| Phase 2: Track Surface | 3 | ✅ COMPLETE |
| Phase 2b: UI Integration & Testing | 4 | ✅ COMPLETE |
| Phase 2c: 3D Track Viewer | 5 | 🔄 NEXT |
| Phase 3: Auto Features | 17 | ⏳ PENDING |
| Phase 4: Additional Features | 5 | ⏳ PENDING |
| Phase 5: Metadata & Export | 4 | ⏳ PENDING |
| Phase 6: Testing | 11 | ⏳ PENDING |
| Phase 7: Documentation | 5 | ⏳ PENDING |
| **TOTAL** | **59 hours** | **20% Complete (12/59 hrs)** |

**~2 weeks of development work** to implement all features.

---

## Priority Order

### Week 1: MVP (Core Features)
1. ✅ Phase 1: Core Alignment (5 hrs) - **DONE**
2. ✅ Phase 2: Track Surface (3 hrs) - **DONE**
3. ✅ Phase 2b: UI Integration & Testing (4 hrs) - **DONE**
4. 🔄 Phase 2c: 3D Track Viewer (5 hrs) - **NEXT** ← Critical for viewing tracks in app
5. ⏳ Phase 3 (partial): Sectors, Curbs, Corners (9 hrs)
6. ⏳ Phase 5: Basic Metadata (2 hrs)
7. ⏳ Phase 6 (partial): Integration Test (3 hrs)

**Week 1 Total**: 31 hours → **12 hrs complete, 19 hrs remaining**

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
- [x] Phase 1: Core Alignment ✅ COMPLETE
- [x] Phase 2: Track Surface Generation ✅ COMPLETE
- [x] Phase 2b: UI Integration & Real Data Testing ✅ COMPLETE
- [ ] Phase 2c: 3D Track Viewer Integration (0% - next up)
- [ ] Phase 3: Automatic Feature Detection (0% - pending)
- [ ] Phase 4-7: Additional features, testing, examples (0% - not started)

**Current Progress**: 20% (12/59 hours)

**Next Action**: Implement Phase 2c - 3D Track Viewer Integration
- Create TrackViewer3D.tsx component with Three.js + GLTFLoader
- Add Tauri backend command for track generation
- Wire ProcessingScreen to real track generation
- Integrate viewer into PreviewScreen

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

### ✅ Files Created (Phase 1, 2, 2b)
- ✅ `src/lib/alignment/findStartFinish.ts` - Multi-method start/finish detection
- ✅ `src/lib/alignment/rotateToStart.ts` - Rotate runs to start position
- ✅ `src/lib/alignment/resampleData.ts` - Uniform density resampling
- ✅ `src/lib/alignment/alignRuns.ts` - Complete alignment pipeline
- ✅ `src/lib/geometry/createTrackSurface.ts` - Track surface mesh generation
- ✅ `src/lib/geometry/createRacingLine.ts` - Racing line geometry (line + tube)
- ✅ `src/lib/geometry/smoothClosedCurve.ts` - Reusable curve smoothing helper
- ✅ `src/lib/geometry/types.ts` - Geometry type definitions
- ✅ `src/lib/export/exportGLTF.ts` - glTF export with gltf-transform
- ✅ `src/lib/export/types.ts` - Export configuration types
- ✅ `src/lib/generateTrack.ts` - Main track generation orchestration
- ✅ `scripts/test-with-real-data.ts` - Real data validation script

### ⏳ Files to Create (Phase 2c: 3D Viewer)
- `src/components/TrackViewer3D.tsx` - Three.js GLB viewer component (~200 lines)
- `src-tauri/src/commands/track_generation.rs` - Tauri track generation command (~150 lines)

### ⏳ Files to Modify (Phase 2c: 3D Viewer)
- `src-tauri/src/lib.rs` - Register track generation command
- `src/components/screens/ProcessingScreen.tsx` - Wire to real backend
- `src/components/screens/PreviewScreen.tsx` - Integrate TrackViewer3D
- `src/lib/processing-types.ts` - Add glbPath field to ProcessingResult

### ⏳ Files to Create (Phase 3+: Auto Features)
- `src/lib/detection/detectSectors.ts`
- `src/lib/detection/detectCurbs.ts`
- `src/lib/detection/detectCorners.ts`
- `src/lib/detection/detectBraking.ts`
- `src/lib/detection/detectSpeedZones.ts`
- `src/lib/detection/extractPitLane.ts`
- `src/lib/detection/extractElevation.ts`
- `src/lib/geometry/createCurbGeometry.ts`
- `src/lib/geometry/createMarkers.ts`
- `src/lib/export/generateMetadata.ts`
- `src/lib/types/telemetry.ts`
- `src/lib/types/metadata.ts`

### ✅ Files Modified
- ✅ `package.json` - Added "test:real-data" script

**Total code created**: ~2000 lines
**Phase 2c estimate**: ~350 lines
**Total remaining**: ~2350-3350 lines estimated

---

## Summary

✅ **Phases 1, 2, and 2b are COMPLETE!**

Core alignment, track surface generation, and real data validation are fully functional. You can now:
- Load Brands Hatch Indy telemetry from AppData
- Generate aligned 3D track models with racing line
- Export to glTF with optimizations
- Test with `npm run test:real-data`

🔄 **Phase 2c: NEXT PRIORITY**

The generated tracks work perfectly but can only be viewed externally. Phase 2c adds in-app 3D viewing:
- TrackViewer3D component with Three.js + GLTFLoader
- Tauri backend command for real track generation
- ProcessingScreen wired to actual generation (not mock)
- PreviewScreen shows interactive 3D track with orbit controls

**After Phase 2c**: Complete MVP with end-to-end workflow: Record → Process → View → Export

**Then**: Phase 3 - Automatic feature detection (sectors, curbs, corners) 🚀
