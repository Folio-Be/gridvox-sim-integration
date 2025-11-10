# Development Plan: AMS2 Telemetry Track Generator

**Project**: Generate accurate 3D track models from AMS2 telemetry using 3-run mapping method
**Current Status**: Documentation complete, basic scaffolding in place, implementation needed
**Total Estimated Time**: 50 hours (~1.5-2 weeks)

---

## 📋 Overview

This plan breaks down the implementation into **7 phases** with clear checkboxes for tracking progress. Each phase builds on previous work and includes time estimates.

### Phase Summary

| Phase | Description | Duration | Status |
|-------|-------------|----------|--------|
| **Phase 1** | Core Alignment & Start/Finish Detection | 5 hrs | ⬜ Not Started |
| **Phase 2** | Track Surface Generation | 3 hrs | ⬜ Not Started |
| **Phase 3** | Automatic Feature Detection | 17 hrs | ⬜ Not Started |
| **Phase 4** | Additional Features (Temperature, Weather) | 5 hrs | ⬜ Not Started |
| **Phase 5** | Metadata & Export Enhancement | 4 hrs | ⬜ Not Started |
| **Phase 6** | Testing & Validation | 11 hrs | ⬜ Not Started |
| **Phase 7** | Documentation & Examples | 5 hrs | ⬜ Not Started |

---

## 🎯 Phase 1: Core Alignment (5 hours) - CRITICAL

**Goal**: Align all 3 telemetry runs to common start/finish point with uniform sampling

### Dependencies Setup
- [ ] Install missing dependencies (commander, chalk, ora)
  ```bash
  npm install commander chalk ora
  ```
- [ ] Create src directory structure
  ```
  src/
  ├── lib/
  │   ├── alignment/
  │   ├── detection/
  │   ├── geometry/
  │   ├── export/
  │   └── types/
  ```

### Type Definitions (30 min)
- [ ] Create `src/lib/types/telemetry.ts`
  - [ ] Define `TelemetryFrame` interface (all AMS2 fields)
  - [ ] Define `TelemetryRun` interface
  - [ ] Define `AlignedRuns` interface
- [ ] Create `src/lib/types/metadata.ts`
  - [ ] Define `TrackMetadata` interface
  - [ ] Define feature interfaces (Corner, Sector, BrakingZone, etc.)

### Start/Finish Detection (2 hours)
- [ ] Create `src/lib/alignment/findStartFinish.ts`
  - [ ] Implement `findStartFinishByLapDistance()`
    - [ ] Detect `mCurrentLapDistance` reset (trackLength → 0)
    - [ ] Return position + confidence score
  - [ ] Implement `findStartFinishByLapNumber()`
    - [ ] Detect `mCurrentLap` increment
    - [ ] Return position + confidence score
  - [ ] Implement `findStartFinishBySector()`
    - [ ] Detect `mCurrentSector` reset (3 → 0)
    - [ ] Return position + confidence score
  - [ ] Implement `findStartFinish()` (main function)
    - [ ] Call all 3 detection methods
    - [ ] Cross-validate results
    - [ ] Return median/average position
    - [ ] Return confidence (1.0 if all agree within 5m)
  - [ ] Add unit tests for each method

### Run Alignment (2 hours)
- [ ] Create `src/lib/alignment/rotateToStart.ts`
  - [ ] Implement `rotateToStart(frames, startIndex)`
    - [ ] Rotate array to start at detected start/finish
    - [ ] Preserve all data fields
    - [ ] Return rotated array
  - [ ] Add tests
- [ ] Create `src/lib/alignment/resampleData.ts`
  - [ ] Implement `resampleToUniformDensity(frames, targetCount)`
    - [ ] Linear interpolation between points
    - [ ] Preserve position, elevation, speed, brake, etc.
    - [ ] Default target: 1000 points per lap
  - [ ] Add tests
- [ ] Create `src/lib/alignment/alignRuns.ts`
  - [ ] Implement `alignRuns(outside, inside, racingLine)`
    - [ ] Find start/finish for each run
    - [ ] Rotate all runs to start/finish
    - [ ] Resample to same point count
    - [ ] Validate alignment quality
    - [ ] Return `AlignedRuns` object
  - [ ] Add alignment diagnostics logging
  - [ ] Add tests

### Integration (30 min)
- [ ] Update `scripts/generate-track.ts`
  - [ ] Import alignment functions
  - [ ] Add CLI options for 3 input files
  - [ ] Call `alignRuns()` before mesh generation
  - [ ] Add progress indicators

**Phase 1 Deliverable**: ✅ 3 runs aligned to common start/finish with uniform sampling

---

## 🛤️ Phase 2: Track Surface Generation (3 hours) - HIGH PRIORITY

**Goal**: Generate realistic track mesh from aligned boundary runs

### Track Surface Mesh (2 hours)
- [ ] Create `src/lib/geometry/createTrackSurface.ts`
  - [ ] Implement `createTrackSurface(alignedRuns)`
    - [ ] Create CatmullRomCurve3 from inside border points
    - [ ] Create CatmullRomCurve3 from outside border points
    - [ ] Sample both curves at 500+ segments
    - [ ] Generate triangulated mesh (quad strips)
    - [ ] Calculate normals (pointing up)
    - [ ] Generate UVs for texturing
    - [ ] Return THREE.Mesh
  - [ ] Implement track material
    - [ ] Dark asphalt color (0x333333)
    - [ ] Roughness: 0.8, Metalness: 0.1
  - [ ] Add to glTF scene

### Racing Line Overlay (1 hour)
- [ ] Create `src/lib/geometry/createRacingLine.ts`
  - [ ] Implement `createRacingLineGeometry(racingLineRun)`
    - [ ] Create BufferGeometry from points
    - [ ] Green color (0x00FF00)
    - [ ] Position slightly above track (+0.1m Y)
    - [ ] LineBasicMaterial with linewidth: 2
    - [ ] Return THREE.Line
  - [ ] Add to glTF scene

### Integration
- [ ] Update `scripts/generate-track.ts`
  - [ ] Call `createTrackSurface()`
  - [ ] Call `createRacingLine()`
  - [ ] Add both to scene
  - [ ] Update progress indicators

**Phase 2 Deliverable**: ✅ Visual track mesh with racing line overlay

---

## 🔍 Phase 3: Automatic Feature Detection (17 hours) - HIGH PRIORITY

**Goal**: Automatically detect and visualize all track features from telemetry

### 3.1 Sector Boundaries (2 hours)
- [ ] Create `src/lib/detection/detectSectors.ts`
  - [ ] Implement `detectSectorBoundaries(racingLineRun)`
    - [ ] Loop through frames, detect `mCurrentSector` changes
    - [ ] Record position, distance, frameIndex for each sector
    - [ ] Return array of 3 sector boundaries
  - [ ] Implement `createSectorMarkers(sectors)`
    - [ ] Create vertical colored planes across track
    - [ ] S1=Blue, S2=Yellow, S3=Red
    - [ ] Add text labels
    - [ ] Return THREE.Group
  - [ ] Add to metadata JSON
  - [ ] Add to glTF scene

### 3.2 Curb Detection (3 hours)
- [ ] Create `src/lib/detection/detectCurbs.ts`
  - [ ] Implement `detectCurbs(racingLineRun)`
    - [ ] Method 1: Elevation spikes in `mTyreY[4]` (>5cm threshold)
    - [ ] Method 2: `mTerrain[4]` = 7 (rumble) or 9 (kerbs)
    - [ ] Cross-validate both methods
    - [ ] Return array of curb positions
  - [ ] Implement `createCurbGeometry(curbs)`
    - [ ] Red/white alternating pattern
    - [ ] Box geometry (0.5m wide × 0.1m tall)
    - [ ] Return THREE.Group
  - [ ] Add to metadata
  - [ ] Add to glTF scene

### 3.3 Pit Lane Extraction (3 hours)
- [ ] Create `src/lib/detection/extractPitLane.ts`
  - [ ] Implement `extractPitLane(racingLineRun)`
    - [ ] Detect `mPitMode` changes (0→1 entry, 3→0 exit)
    - [ ] Record pit lane path while `mPitMode` ∈ {1,2,3}
    - [ ] Calculate pit lane length
    - [ ] Return pit lane data
  - [ ] Implement `createPitLaneGeometry(pitLane)`
    - [ ] Gray asphalt mesh (narrower than main track)
    - [ ] Entry marker (green arrow)
    - [ ] Exit marker (yellow arrow)
    - [ ] Return THREE.Group
  - [ ] Add to metadata
  - [ ] Add to glTF scene

### 3.4 Corner Detection & Classification (4 hours)
- [ ] Create `src/lib/detection/detectCorners.ts`
  - [ ] Implement `calculateCurvature(p1, p2, p3)`
    - [ ] Calculate radius through 3 points
    - [ ] Return curvature (1/radius)
  - [ ] Implement `detectCorners(racingLineRun)`
    - [ ] Loop with sliding window (size 5)
    - [ ] Calculate curvature at each point
    - [ ] Detect entry (curvature > 0.008 rad/m)
    - [ ] Detect apex (slowest point in corner)
    - [ ] Detect exit (curvature < 0.008 rad/m)
    - [ ] Return array of corners
  - [ ] Implement `classifyCorner(corner)`
    - [ ] Calculate average speed through corner
    - [ ] Calculate total turn angle
    - [ ] Classify: flat-out, fast-sweeper, medium-speed, slow-corner, hairpin, chicane, kink
    - [ ] Return classification
  - [ ] Implement `estimateRadius(corner)`
    - [ ] Average curvature over corner frames
    - [ ] Return radius in meters
  - [ ] Implement `createCornerMarkers(corners)`
    - [ ] Number labels (T1, T2, T3...)
    - [ ] Entry/apex/exit markers (small spheres)
    - [ ] Color by type (fast=red, medium=yellow, slow=blue)
    - [ ] Return THREE.Group
  - [ ] Add to metadata
  - [ ] Add to glTF scene

### 3.5 Braking Zones (2 hours)
- [ ] Create `src/lib/detection/detectBraking.ts`
  - [ ] Implement `detectBrakingZones(racingLineRun)`
    - [ ] Calculate deceleration: `(prevSpeed - currSpeed) * 60`
    - [ ] Detect braking: decel > 3.0 m/s² AND `mBrake` > 0.3
    - [ ] Record start/end, speed loss, duration
    - [ ] Return array of braking zones
  - [ ] Implement `createBrakingMarkers(brakingZones)`
    - [ ] Red cones at braking points
    - [ ] Size based on deceleration intensity
    - [ ] Distance lines showing zone
    - [ ] Return THREE.Group
  - [ ] Add to metadata
  - [ ] Add to glTF scene

### 3.6 Speed Zones (2 hours)
- [ ] Create `src/lib/detection/detectSpeedZones.ts`
  - [ ] Implement `generateSpeedZones(racingLineRun)`
    - [ ] Loop through frames
    - [ ] Classify by speed: >200 (high), 100-200 (med), <100 (low)
    - [ ] Record positions per zone
    - [ ] Calculate statistics (length, percentage)
    - [ ] Return speed zone data
  - [ ] Implement `createSpeedVisualization(speedZones)` (optional)
    - [ ] Color track surface or edge lines by speed
    - [ ] Red=high, Yellow=medium, Blue=low
    - [ ] Return THREE.Group
  - [ ] Add to metadata

### 3.7 Elevation Profile (1 hour)
- [ ] Create `src/lib/detection/extractElevation.ts`
  - [ ] Implement `extractElevationProfile(racingLineRun)`
    - [ ] Extract `mWorldPosition[1]` (Y coordinate)
    - [ ] Calculate min, max, range
    - [ ] Return elevation data
  - [ ] Implement `detectBankedCorners(corners, racingLineRun)`
    - [ ] Check lateral elevation changes (>30cm)
    - [ ] Identify banked corners
    - [ ] Return banking data
  - [ ] Add to metadata

**Phase 3 Deliverable**: ✅ All automatic features detected and visualized

---

## 🌡️ Phase 4: Additional Features (5 hours) - MEDIUM PRIORITY

**Goal**: Add environmental and surface type detection

### 4.1 Runoff Areas (2 hours)
- [ ] Create `src/lib/detection/detectRunoff.ts`
  - [ ] Implement `detectRunoffAreas(racingLineRun)`
    - [ ] Check `mTerrain[4]` per frame
    - [ ] Grass = 3 or 4
    - [ ] Gravel = 5 or 6
    - [ ] Record positions per type
    - [ ] Return runoff data
  - [ ] Implement `createRunoffGeometry(runoff)` (optional)
    - [ ] Green patches for grass
    - [ ] Gray patches for gravel
    - [ ] Return THREE.Group
  - [ ] Add to metadata

### 4.2 Track Temperature Heatmap (2 hours)
- [ ] Create `src/lib/detection/mapTemperature.ts`
  - [ ] Implement `mapTrackTemperature(racingLineRun)`
    - [ ] Record `mTrackTemperature` per position
    - [ ] Calculate min, max, average
    - [ ] Generate color gradient (blue→red)
    - [ ] Return temperature data
  - [ ] Implement `createTemperatureVisualization(tempData)` (optional)
    - [ ] Vertex colors on track surface
    - [ ] Return THREE.Mesh
  - [ ] Add to metadata

### 4.3 Weather Conditions (1 hour)
- [ ] Create `src/lib/detection/extractWeather.ts`
  - [ ] Implement `extractWeatherData(racingLineRun)`
    - [ ] Get first frame's weather data
    - [ ] Extract: rain, snow, wind, cloud, temps
    - [ ] Classify conditions: Dry, Light Rain, Heavy Rain
    - [ ] Return weather object
  - [ ] Add to metadata

**Phase 4 Deliverable**: ✅ Environmental and surface data captured

---

## 📦 Phase 5: Metadata & Export Enhancement (4 hours) - HIGH PRIORITY

**Goal**: Generate comprehensive metadata and optimize glTF export

### 5.1 Metadata JSON Generation (2 hours)
- [ ] Create `src/lib/export/generateMetadata.ts`
  - [ ] Implement `generateMetadata(alignedRuns, features)`
    - [ ] Track info (name, variation, length)
    - [ ] Recording info (date, game version, car)
    - [ ] All detected features (sectors, corners, curbs, etc.)
    - [ ] Statistics (lap time, speeds, elevations)
    - [ ] Return complete metadata object
  - [ ] Implement JSON schema validation
  - [ ] Add pretty-printing
  - [ ] Export to `{trackName}-metadata.json`

### 5.2 glTF Export Enhancement (2 hours)
- [ ] Create `src/lib/export/exportGLTF.ts`
  - [ ] Implement scene hierarchy organization
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
  - [ ] Optimize geometry (merge similar meshes)
  - [ ] Apply proper materials
  - [ ] Export with GLTFExporter
  - [ ] Optional Draco compression

**Phase 5 Deliverable**: ✅ Complete metadata JSON + organized glTF export

---

## 🧪 Phase 6: Testing & Validation (11 hours) - CRITICAL

**Goal**: Ensure all features work correctly with real and synthetic data

### 6.1 Unit Tests (4 hours)
- [ ] Set up testing framework (Jest or Vitest)
  - [ ] Install test dependencies
  - [ ] Configure test runner
  - [ ] Create test directory structure
- [ ] Test alignment functions
  - [ ] `findStartFinishByLapDistance()`
  - [ ] `findStartFinishByLapNumber()`
  - [ ] `findStartFinishBySector()`
  - [ ] `rotateToStart()`
  - [ ] `resampleToUniformDensity()`
  - [ ] `alignRuns()`
- [ ] Test geometry functions
  - [ ] `createTrackSurface()`
  - [ ] `createRacingLine()`
- [ ] Test detection functions
  - [ ] `detectSectorBoundaries()`
  - [ ] `detectCurbs()`
  - [ ] `detectCorners()` and `classifyCorner()`
  - [ ] `detectBrakingZones()`
  - [ ] `generateSpeedZones()`
- [ ] Achieve >80% code coverage

### 6.2 Integration Tests (3 hours)
- [ ] Create synthetic test data
  - [ ] Generate simple circular track
  - [ ] 3 runs with slight variations
  - [ ] Known start/finish position
  - [ ] Predefined corners and features
- [ ] Run full pipeline
  - [ ] Alignment
  - [ ] Surface generation
  - [ ] Feature detection
  - [ ] Export
- [ ] Verify outputs
  - [ ] glTF loads correctly in Three.js
  - [ ] Track surface exists and is closed loop
  - [ ] Racing line visible
  - [ ] Features detected at expected positions
  - [ ] Metadata JSON has all fields
  - [ ] Values match expected

### 6.3 Real Track Test (4 hours)
- [ ] Record real telemetry
  - [ ] Pick test track (e.g., Silverstone GP)
  - [ ] Record outside border lap in AMS2
  - [ ] Record inside border lap in AMS2
  - [ ] Record racing line lap in AMS2
  - [ ] Save as JSON files
- [ ] Run generator with real data
  ```bash
  npm run generate -- \
    --track-name silverstone-gp \
    --outside telemetry-data/silverstone-outside.json \
    --inside telemetry-data/silverstone-inside.json \
    --racing-line telemetry-data/silverstone-racing.json
  ```
- [ ] Visual validation
  - [ ] Load output glTF in Blender or Three.js viewer
  - [ ] Verify track shape matches real Silverstone
  - [ ] Check corners numbered correctly
  - [ ] Verify curbs in right places
  - [ ] Verify sectors aligned properly
  - [ ] Check pit lane (if recorded)
- [ ] Compare with reference
  - [ ] Compare with real track layout images
  - [ ] Compare with AMS2 in-game track
  - [ ] Verify coordinate alignment
- [ ] Fix any issues discovered
  - [ ] Document bugs
  - [ ] Implement fixes
  - [ ] Re-test

**Phase 6 Deliverable**: ✅ Tested and validated with real AMS2 data

---

## 📚 Phase 7: Documentation & Examples (5 hours) - MEDIUM PRIORITY

**Goal**: Complete documentation and provide usage examples

### 7.1 Update Documentation (2 hours)
- [ ] Update README.md
  - [ ] Add feature list with screenshots
  - [ ] Update quick start guide
  - [ ] Add troubleshooting section
- [ ] Update GETTING-STARTED.md
  - [ ] Add Phase 1-5 implementation details
  - [ ] Update CLI options
  - [ ] Add example commands
- [ ] Create API documentation
  - [ ] Document all public functions
  - [ ] Add JSDoc comments
  - [ ] Generate API reference (optional)
- [ ] Update IMPLEMENTATION-CHECKLIST.md
  - [ ] Mark completed tasks
  - [ ] Add implementation notes

### 7.2 Create Examples (3 hours)
- [ ] Example 1: Load track in Three.js
  - [ ] Create HTML viewer
  - [ ] Load generated glTF
  - [ ] Show all features toggle
  - [ ] Camera controls
  - [ ] Save to `examples/viewer/`
- [ ] Example 2: Telemetry replay
  - [ ] Animate car along racing line
  - [ ] Show live telemetry overlay
  - [ ] Speed, brake, gear indicators
  - [ ] Save to `examples/replay/`
- [ ] Example 3: Corner info overlay
  - [ ] Display corner details on hover
  - [ ] Show entry/apex/exit markers
  - [ ] Show speed, radius, classification
  - [ ] Save to `examples/corner-info/`
- [ ] Example 4: Speed zone visualization
  - [ ] Color-coded track sections
  - [ ] Speed heatmap
  - [ ] Statistics overlay
  - [ ] Save to `examples/speed-zones/`
- [ ] Example 5: Braking point markers
  - [ ] Red cones at braking zones
  - [ ] Deceleration graph
  - [ ] Interactive visualization
  - [ ] Save to `examples/braking-points/`

**Phase 7 Deliverable**: ✅ Complete documentation and working examples

---

## 🎯 Recommended Implementation Order

### Week 1: MVP (22 hours)
**Goal**: Functional 3-run mapping with basic features

1. **Day 1-2**: Phase 1 - Core Alignment (5 hrs)
2. **Day 2**: Phase 2 - Track Surface (3 hrs)
3. **Day 3-4**: Phase 3 (partial) - Sectors, Curbs, Corners (9 hrs)
4. **Day 4**: Phase 5 (partial) - Basic Metadata (2 hrs)
5. **Day 5**: Phase 6 (partial) - Integration Test (3 hrs)

✅ **Week 1 Deliverable**: Working track generator with basic features

### Week 2: Full Features (28 hours)
**Goal**: All features, tested, documented

6. **Day 6-7**: Phase 3 (complete) - Pit, Braking, Speed, Elevation (8 hrs)
7. **Day 7-8**: Phase 4 - Runoff, Temperature, Weather (5 hrs)
8. **Day 8**: Phase 5 (complete) - Full Metadata (2 hrs)
9. **Day 9-10**: Phase 6 (complete) - Full Testing (8 hrs)
10. **Day 10**: Phase 7 - Documentation & Examples (5 hrs)

✅ **Week 2 Deliverable**: Production-ready track generator

---

## 📦 Quick Wins (Start Here!)

These tasks provide immediate value and are easiest to implement:

- [ ] **1. Dependencies & Setup** (1 hr)
  - Install missing npm packages
  - Create src directory structure
  - Set up TypeScript types

- [ ] **2. Start/Finish Detection** (2 hrs)
  - Critical for all other features
  - Relatively straightforward logic
  - High confidence validation

- [ ] **3. Sector Boundaries** (2 hrs)
  - Direct from telemetry data
  - Easy to visualize
  - No complex calculations

- [ ] **4. Track Surface** (2 hrs)
  - Core visual feature
  - Uses existing THREE.js code
  - Immediate visual feedback

- [ ] **5. Racing Line** (1 hr)
  - Simple line geometry
  - Quick visual validation
  - Uses existing scaffolding

- [ ] **6. Basic Metadata** (2 hrs)
  - Foundation for all features
  - Easy to extend later
  - Enables debugging

**Total Quick Wins: 10 hours** → Basic functional system

---

## 🚨 Dependencies & Blockers

### Phase Dependencies
```
Phase 2 → depends on → Phase 1 (need aligned runs)
Phase 3 → depends on → Phase 1 (need aligned runs)
Phase 4 → depends on → Phase 1 (need aligned runs)
Phase 5 → depends on → Phase 3 & 4 (need features to export)
Phase 6 → depends on → All previous (testing implementation)
Phase 7 → depends on → Phase 6 (document tested features)
```

### External Dependencies
- [ ] AMS2 telemetry output format verified
- [ ] Sample telemetry data available for testing
- [ ] Three.js viewer/Blender for visual validation

---

## ✅ Success Criteria

### Minimum Viable Product (MVP)
- [ ] Accepts 3 telemetry JSON files (outside, inside, racing line)
- [ ] Aligns runs to common start/finish automatically
- [ ] Generates realistic track surface mesh
- [ ] Detects start/finish, sectors, curbs
- [ ] Outputs glTF + metadata JSON
- [ ] Loads correctly in Three.js viewer

### Full Release
- [ ] All 11 automatic features implemented
- [ ] Comprehensive metadata JSON with all fields
- [ ] All tests passing (unit + integration + real track)
- [ ] Documentation complete and accurate
- [ ] Working examples for all major features
- [ ] Tested on 3+ real AMS2 tracks
- [ ] Performance: <60 seconds for full track generation
- [ ] File size: <10MB for optimized glTF

---

## 📊 Progress Tracking

### Current Status (Starting Point)
- [x] Documentation complete
- [x] Project structure scaffolded
- [x] Basic generate script exists
- [ ] Implementation: 0%
- [ ] Testing: 0%
- [ ] Examples: 0%

### How to Use This Plan
1. Work through phases sequentially
2. Check off boxes as tasks are completed
3. Run tests after each phase
4. Update this document with notes/issues
5. Track time spent vs. estimates

### Time Tracking
| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| Phase 1 | 5 hrs | - | |
| Phase 2 | 3 hrs | - | |
| Phase 3 | 17 hrs | - | |
| Phase 4 | 5 hrs | - | |
| Phase 5 | 4 hrs | - | |
| Phase 6 | 11 hrs | - | |
| Phase 7 | 5 hrs | - | |
| **Total** | **50 hrs** | **-** | |

---

## 🎯 Next Actions

**Immediate next steps:**

1. [ ] Install missing dependencies (commander, chalk, ora)
2. [ ] Create src directory structure
3. [ ] Define TypeScript interfaces in `src/lib/types/`
4. [ ] Implement start/finish detection (Phase 1.1)
5. [ ] Write unit tests for start/finish detection
6. [ ] Move to run alignment (Phase 1.2)

**Start with:** Phase 1 → Core Alignment (5 hours)

---

## 📝 Notes

### Telemetry Format Assumptions
The implementation assumes AMS2 telemetry JSON format:
```typescript
interface TelemetryFrame {
  mWorldPosition: [number, number, number]; // [x, y, z]
  mCurrentLapDistance: number;
  mTrackLength: number;
  mCurrentLap: number;
  mCurrentSector: number; // 0-3
  mSpeed: number;
  mBrake: number;
  mTyreY: [number, number, number, number];
  mTerrain: [number, number, number, number];
  mPitMode: number;
  // ... more fields
}
```

### Known Challenges
- **Alignment accuracy**: Need robust start/finish detection with >95% confidence
- **Curb detection**: May require fine-tuning thresholds for different tracks
- **Pit lane**: Only detectable if user drives through pit during recording
- **Corner classification**: Speed thresholds may vary by car/setup

### Performance Targets
- Track generation: <60 seconds
- File size (unoptimized): <50MB
- File size (optimized): <10MB
- Memory usage: <2GB

---

**Ready to start implementation!** 🚀

*Last updated: 2025-11-09*
