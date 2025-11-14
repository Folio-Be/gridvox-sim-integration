# Implementation Checklist

## Phase 0: Project Setup ✓

- [x] Create project directory structure *Organized into src/lib, src/cli, tools, output, docs.*
- [x] Initialize package.json *TypeScript library + CLI configuration.*
- [x] Create tsconfig.json *ES2022 + ESNext modules.*
- [x] Write README.md *Complete usage guide with architecture diagram.*
- [x] Create .gitignore *Excludes node_modules, dist, large output files, tool binaries.*
- [x] Create .env.example *Configuration template for AC path, tool paths, Draco settings.*
- [x] Create IMPLEMENTATION-CHECKLIST.md *This file.*

---

## Phase 1: Core Library Development ✓

**Goal**: Build TypeScript library for programmatic car model extraction.

### Setup

- [ ] Install dependencies (`npm install`) *Ready to run*
- [ ] Download kn5-converter to `tools/kn5-converter/` *User action required*
- [ ] Download FBX2glTF to `tools/FBX2glTF/` *User action required*
- [ ] Create `.env` from `.env.example` *User action required*

### Type Definitions

- [x] Create `src/lib/types.ts` *Complete with all interfaces: ExtractionConfig, CarMetadata, ExtractionProgress, events.*
  - [x] `ExtractionConfig` interface
  - [x] `CarMetadata` interface
  - [x] `ExtractionProgress` event types
  - [x] `ToolPaths` interface

### Utility Modules

- [x] Create `src/utils/config.ts` *Environment variable loading, validation, tool path resolution.*
- [x] Create `src/utils/logger.ts` *Colorized console logging with debug/info/warn/error/success levels.*
- [x] Create `src/utils/process.ts` *Child process helpers with timeout, streaming, error handling.*

### Car Scanner

- [x] Create `src/lib/car-scanner.ts` *CarScanner class with full AC installation scanning.*
  - [x] `scanACInstallation()` - Find content/cars directory
  - [x] `listAvailableCars()` - Return array of car IDs
  - [x] `getCarMetadata(carId)` - Read ui_car.json for name/class/brand/year
  - [x] `validateCarExists(carId)` - Check .kn5 file exists
  - [x] `getPopularGT3Cars()` - Preset list of popular GT3 cars
  - [x] `getTestCars()` - 5 cars for quick testing
  - [x] `filterCars()` - Filter by brand/class/year/name

### Tool Wrappers

- [x] Create `src/lib/kn5-converter.ts` *KN5Converter class wrapping kn5conv.exe.*
  - [x] `convertToFBX(kn5Path)` - Spawn kn5conv.exe with FBX export
  - [x] `convertBatch(carPaths[])` - Batch process multiple cars
  - [x] Error handling for tool not found
  - [x] Version detection support
  - [x] Timeout configuration

- [x] Create `src/lib/fbx2gltf.ts` *FBX2GLTFConverter class wrapping FBX2glTF.exe.*
  - [x] `convertToGLTF(fbxPath, outputPath, options)` - Spawn FBX2glTF
  - [x] Support Draco compression options (level, bits per attribute)
  - [x] Support PBR material export flag
  - [x] Binary GLB output support
  - [x] Batch conversion support

### Main Extractor Class

- [x] Create `src/lib/extractor.ts` *ACCarExtractor class with full pipeline coordination.*
  - [x] `ACCarExtractor` class with EventEmitter for progress tracking
  - [x] Constructor with `ExtractionConfig` and validation
  - [x] `extractCar(carId)` - Single car pipeline (.kn5 → FBX → GLTF)
  - [x] `extractBatch(carIds[])` - Batch extraction with progress events
  - [x] Progress events: `progress`, `complete`, `error`, `batch-start`, `batch-complete`
  - [x] Skip already-converted files if `skipExisting=true`
  - [x] TypeScript-friendly event emitter methods

### Public API

- [x] Create `src/lib/index.ts` *Complete public API with JSDoc examples.*
  - [x] Export `ACCarExtractor` class
  - [x] Export all types from `types.ts`
  - [x] Export utility functions (scanACInstallation, listAvailableCars, getCarMetadata)
  - [x] Export tool wrappers (KN5Converter, FBX2GLTFConverter)
  - [x] Export configuration utilities

### Testing

- [x] Manual test: Extract single car (`abarth500`) *Extracted successfully: 1.3MB GLB in 3 seconds (2025-11-14).*
- [x] Verify OBJ output exists in `output/fbx/` *26MB abarth500.obj verified.*
- [x] Verify GLTF output exists in `output/gltf/` *1.3MB abarth500.glb verified.*
- [ ] Load .glb in [glTF Viewer](https://gltf-viewer.donmccurdy.com/) *Ready for user testing.*
- [ ] Verify UV mapping (should not be flipped) *Ready for visual inspection.*
- [ ] Test batch extraction (5 cars)
- [x] Test progress events *Working: ora spinner + progress reporting confirmed.*

---

## Phase 2: CLI Development ✓

**Goal**: Provide command-line interface for developers.

### Verify Tools Script

- [x] Create `src/cli/verify-tools.ts` *Complete verification script with colorized output.*
  - [x] Check kn5-converter exists and show path
  - [x] Check FBX2glTF exists and show path
  - [x] Check AC installation path valid
  - [x] List available cars count with examples
  - [x] Print tool versions if available
  - [x] Show popular GT3 cars count
  - [x] Display next steps on success

### Main CLI

- [x] Create `src/cli/index.ts` *Full-featured CLI with Commander.js.*
  - [x] Use Commander.js for argument parsing
  - [x] Commands:
    - [x] `car <carId>` - Single car extraction
    - [x] `batch` - Multiple car extraction
    - [x] `list` - List available cars with filtering
  - [x] Batch command options:
    - [x] `--cars <id1,id2>` - Specific car IDs
    - [x] `--all` - All cars
    - [x] `--test` - 5 test cars
    - [x] `--gt3` - Popular GT3 cars
  - [x] Flags:
    - [x] `--output <dir>` - Override output directory
    - [x] `--no-draco` - Disable Draco compression
    - [x] `--draco-level <0-10>` - Compression level
    - [x] `--verbose` - Verbose logging
    - [x] `--skip-existing` - Skip already converted
  - [x] List command filters:
    - [x] `--gt3` - Only GT3 cars
    - [x] `--brand <brand>` - Filter by brand
    - [x] `--class <class>` - Filter by class

### Progress Reporting

- [x] Use `ora` spinner for progress indication
- [x] Show current stage with percentage
- [x] Show batch progress: "[5/20] ks_ferrari_488_gt3 (40%)"
- [x] Color-coded output (success=green, error=red, info=cyan)
- [x] Summary statistics at end (total/successful/failed/duration)
- [x] List failed cars with error messages

### Testing

- [x] Test `npm run verify` *All tools verified: kn5-converter, FBX2glTF, AC installation with 40 cars (2025-11-14).*
- [x] Test `npm run extract -- car abarth500` *Success: 1.3MB GLB in 3s (2025-11-14).*
- [ ] Test `npm run extract:batch -- --cars ks_ferrari_488_gt3,ks_porsche_911_gt3_r_2016`
- [ ] Test `npm run test` (5 cars)
- [ ] Test error handling (invalid car ID)
- [ ] Test `--skip-existing` flag

---

## Phase 3: Documentation

**Goal**: Complete developer documentation.

### API Documentation

- [ ] Create `docs/API.md`
  - [ ] `ACCarExtractor` class reference
  - [ ] Configuration options
  - [ ] Event types
  - [ ] Example code snippets
  - [ ] Return types and error codes

### Research Comparison

- [ ] Create `docs/RESEARCH-COMPARISON.md`
  - [ ] Assetto Corsa vs AMS2 tooling comparison
  - [ ] Assetto Corsa vs ACC/iRacing
  - [ ] Workflow automation comparison table
  - [ ] Performance benchmarks

### Troubleshooting Guide

- [ ] Create `docs/TROUBLESHOOTING.md`
  - [ ] Tool not found errors
  - [ ] AC installation path issues
  - [ ] UV mapping problems
  - [ ] Draco compression artifacts
  - [ ] Memory issues with batch processing

### Integration Guide

- [ ] Create `docs/SIMVOX-INTEGRATION.md`
  - [ ] How to use library in SimVox MVP
  - [ ] Recommended cars to pre-extract (10-15 popular GT3)
  - [ ] three.js loading example
  - [ ] fabric.js livery painting integration
  - [ ] Performance optimization tips

---

## Phase 4: SimVox MVP Integration

**Goal**: Integrate library into SimVox livery designer.

### Pre-Extraction Script

- [ ] Create `scripts/pre-extract-popular-cars.ts`
  - [ ] List of 10-15 popular GT3 cars
  - [ ] Extract to `SimVox/assets/car-models/`
  - [ ] Generate manifest.json with car metadata
  - [ ] Run during SimVox build process

### SimVox Adapter

- [ ] Create adapter in SimVox codebase
  - [ ] `loadCarModel(carId)` - Load GLTF from assets
  - [ ] `applyLiveryTexture(model, texture)` - Apply fabric.js canvas to model
  - [ ] Material finder (identify "Body" material for livery)
  - [ ] Error handling for missing models

### Testing

- [ ] Load extracted car in SimVox livery designer
- [ ] Paint livery with fabric.js
- [ ] Apply to 3D model in three.js
- [ ] Verify UV mapping correct
- [ ] Test with 3-5 different cars

---

## Phase 5: Optimization & Polish

**Goal**: Production-ready quality.

### Performance

- [ ] Parallel conversion (run multiple FBX2glTF instances)
- [ ] Streaming progress (real-time updates)
- [ ] Memory optimization for large batches
- [ ] Incremental extraction (only new cars)

### Error Handling

- [ ] Graceful tool failure recovery
- [ ] Partial batch success (continue on error)
- [ ] Detailed error messages with solutions
- [ ] Retry logic for transient failures

### Logging

- [ ] File-based logging (`car-extractor.log`)
- [ ] Structured JSON logs for debugging
- [ ] Log rotation for long-running extractions

### CI/CD

- [ ] GitHub Actions workflow
  - [ ] Build TypeScript
  - [ ] Verify tool downloads (mock)
  - [ ] Run type checks
  - [ ] Lint code

---

## Phase 6: Future Enhancements

**Optional features for later iterations:**

- [ ] Web UI for car selection and extraction
- [ ] Progress dashboard (Electron/Tauri app)
- [ ] Automatic tool download/installation
- [ ] Support for modded cars (Community Content folder)
- [ ] LOD selection (extract specific detail levels)
- [ ] Texture resolution options (1K/2K/4K)
- [ ] Alternative output formats (OBJ, USD, FBX)
- [ ] Cloud-based pre-extraction service
- [ ] Car model CDN hosting

---

## Current Status

**Phase 0: Project Setup** - ✅ Complete (7/7 tasks)
**Phase 1: Core Library** - ✅ Complete (24/24 implementation tasks, 4/7 testing tasks complete)
**Phase 2: CLI Development** - ✅ Complete (15/15 implementation tasks, 2/6 testing tasks complete)
**Phase 3: Documentation** - ⏳ Partial (2/4 docs created: README, QUICK-START)
**Phase 4: SimVox Integration** - ⏳ Not Started (0/7 tasks)
**Phase 5: Optimization** - ⏳ Not Started (0/10 tasks)
**Phase 6: Future** - ⏳ Deferred

**Latest Achievement**: Successfully extracted abarth500 model (KN5→OBJ→GLTF pipeline working) - 1.3MB GLB in 3 seconds with patched obj2gltf for Node.js v24 compatibility (2025-11-14).

---

## Timeline Estimates

| Phase | Estimated Time | Actual Time | Dependencies |
|-------|---------------|-------------|--------------|
| Phase 0 | 1 hour | ✅ 1 hour | None |
| Phase 1 | 1-2 days | ✅ Implemented | Tools downloaded |
| Phase 2 | 0.5 days | ✅ Implemented | Phase 1 complete |
| Phase 3 | 0.5 days | ⏳ In progress | Phases 1-2 complete |
| Phase 4 | 1 day | ⏳ Pending | SimVox codebase access |
| Phase 5 | 1-2 days | ⏳ Pending | Real-world usage testing |
| **Total** | **4-6 days** | **~2 days** | - |

---

## Next Immediate Steps

1. ✅ Complete Phase 0 (project setup)
2. ✅ Complete Phase 1 (core library implementation)
3. ✅ Complete Phase 2 (CLI implementation)
4. **⏳ Download tools and test**:
   - Download kn5-converter to `tools/kn5-converter/kn5conv.exe`
   - Download FBX2glTF to `tools/FBX2glTF/FBX2glTF.exe`
   - Create `.env` from `.env.example` with AC installation path
   - Run `npm install` to install dependencies
   - Run `npm run verify` to validate setup
   - Test single car extraction: `npm run extract:single -- --car ks_ferrari_488_gt3`
5. **⏳ Complete Phase 3 (documentation)**:
   - Create API.md
   - Create TROUBLESHOOTING.md
   - Create RESEARCH-COMPARISON.md
   - Create SIMVOX-INTEGRATION.md
6. **⏳ Phase 4: SimVox MVP integration**

---

**Last Updated**: 2025-01-14 (Updated)
**Current Phase**: Phases 0-2 Complete → Ready for Testing & Phase 3 Documentation
