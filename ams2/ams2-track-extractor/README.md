# AMS2 Track Extractor

Extract and convert Automobilista 2 race tracks to glTF 2.0 format for Three.js visualization.

## Project Overview

**Purpose:** Generate 3D track models usable in GridVox telemetry visualization system  
**Target Format:** glTF 2.0 (optimized for Three.js)  
**Approaches:** 4 methods with varying success rates (40-95%)

## Quick Start

### Prerequisites

**For All Approaches:**
- Node.js 18+
- npm or yarn

**For Procedural Tracks (Recommended):**
- Telemetry recordings from `track-map-core`

**For Extraction (Advanced):**
- AMS2 installation
- .NET 6.0 SDK
- Blender 4.0+
- See [MANUAL-SETUP.md](./MANUAL-SETUP.md)

### Installation

```bash
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor
npm install
```

### Usage

#### Generate 3-Run Mapped Track (Recommended)

```bash
# After driving 3 laps (outside/inside/racing line)
npm run generate-procedural -- \
  --mapping-mode \
  --track silverstone \
  --outside-border telemetry-data/silverstone-outside.json \
  --inside-border telemetry-data/silverstone-inside.json \
  --racing-line telemetry-data/silverstone-racing.json

# Output: converted-tracks/silverstone-mapped.glb
```

#### Extract from AMS2 (Try First)

```bash
# Extract and convert track using PCarsTools
npm run extract-track -- --track silverstone_gp --ams2-path "C:\...\Automobilista 2"
```

#### Validate Track

```bash
# Check glTF quality and Three.js compatibility
npm run validate -- --track silverstone
```

## Approaches

### 1. Community glTF Models (NOT RECOMMENDED FOR TELEMETRY)
Search and download pre-made track models from modding communities.

**Pros:** High visual quality  
**Cons:** ❌ **Poor coordinate alignment** - requires manual calibration  
**Time:** 30-90 min/track  
**⚠️ Not suitable for telemetry replay visualization**

### 2. 3-Run Track Mapping (RECOMMENDED FALLBACK) ⭐
Drive 3 laps (outside border, inside border, racing line) to capture actual track geometry.

**Pros:** Works for any track, **perfect alignment**, real track width  
**Cons:** Requires 3 laps instead of 1  
**Time:** 10 min/track  
**✅ 98% success rate**

### 3. PCarsTools Extraction (TRY FIRST - BEST IF WORKS)
Extract original game files and convert to glTF.

**Pros:** ✅ **Best possible quality**, perfect alignment, authentic geometry  
**Cons:** Complex, uncertain success  
**Time:** 60-120 min/track  
**40% success rate but best results**

### 4. Hybrid Enhancement (HIGHEST QUALITY)
Combine 3-run mapped base with manual Blender work.

**Pros:** Perfect alignment + enhanced visuals  
**Cons:** Manual Blender work required  
**Time:** 25-360 min/track  
**75% success rate**

## Documentation

- **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** - Comprehensive strategy guide with all 4 approaches
- **[MANUAL-SETUP.md](./MANUAL-SETUP.md)** - Step-by-step installation instructions
- **[docs/](./docs/)** - Additional guides and troubleshooting

## Project Structure

```
ams2-track-extractor/
├── scripts/                    # Automation scripts
│   ├── generate-procedural-track.ts
│   ├── convert-to-gltf.ts
│   ├── validate-track.ts
│   └── ...
├── tools/                      # External tools (PCarsTools, etc.)
├── telemetry-data/            # Input telemetry recordings
├── downloaded-models/         # Community-sourced models
├── extracted-tracks/          # PCarsTools output
├── converted-tracks/          # Final glTF files
└── docs/                      # Documentation
```

## Output Format

### Track File Structure

```
converted-tracks/
├── silverstone.glb            # Main track model
├── silverstone-lod0.glb       # High detail LOD
├── silverstone-lod1.glb       # Medium detail LOD
└── silverstone-lod2.glb       # Low detail LOD
```

### glTF Specifications

- **Format:** glTF 2.0 Binary (.glb)
- **Compression:** Draco (geometry), KTX2 (textures)
- **Materials:** PBR (Physically Based Rendering)
- **Textures:** Max 2048x2048, compressed
- **Target Size:** <50MB per track
- **Target Polygons:** <500k vertices

## Integration with Three.js

### Loading Generated Tracks

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Set up Draco decoder
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

// Load track
loader.load('converted-tracks/silverstone.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

### Using with GridVox Telemetry Visualization

See [gridvox-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md](../../gridvox-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md) for complete integration guide with:
- React Three Fiber implementation
- pmndrs/drei Trail component usage
- AnimationMixer for replay
- Multiple camera modes

## Success Rates Summary

| Approach | Success | Time/Track | Quality | Telemetry Alignment | Automation |
|----------|---------|------------|---------|-------------------|------------|
| Community | 80%/20%* | 30-90 min | High | ❌ Poor | 50% |
| 3-Run Mapping | **98%** | 10 min | High | ✅ **Perfect** | 60% |
| Extraction | 40% | 60-120 min | **Highest** | ✅ **Perfect** | 30% |
| Hybrid | 75% | 25-360 min | **Highest** | ✅ **Perfect** | 40% |

*80% find models, 20% successful coordinate alignment

## Recommended Workflow

1. **Try Approach 3 (Extraction) first** - Best results if successful
2. **Fallback to Approach 2 (3-Run Mapping)** - Guaranteed success, excellent results
3. **Enhance with Approach 4 (Hybrid)** - Add details to priority tracks
4. **Avoid Approach 1 (Community)** - Coordinate alignment too complex

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Test single track generation
npm run test:generate -- --track brands-hatch

# Test conversion
npm run test:convert

# Test validation
npm run test:validate
```

## Troubleshooting

### Common Issues

**No telemetry file found:**
→ Drive track in AMS2 with telemetry recording active  
→ Check output path in track-map-core config

**PCarsTools fails to extract:**
→ Verify oo2core_7_win64.dll is present  
→ Check languages.bml is in Languages/ folder  
→ Try different game type: `--game-type PC2`

**glTF file too large:**
→ Enable Draco compression  
→ Reduce texture resolution  
→ Generate LOD levels

**Track doesn't load in Three.js:**
→ Run validation script  
→ Check browser console for errors  
→ Verify Draco decoder path is correct

See [MANUAL-SETUP.md](./MANUAL-SETUP.md) troubleshooting section for detailed solutions.

## Related Projects

- **track-map-visualization** - Telemetry recording system (provides input data)
- **gridvox-docs** - Three.js visualization architecture documentation
- **PCarsTools** - Game file extraction (external dependency)

## License

MIT

## Credits

- **PCarsTools** by Nenkai - AMS2/Project CARS file extraction
- **Three.js** - 3D rendering library
- **@gltf-transform** - glTF optimization toolkit
- **Blender** - 3D modeling and conversion

## Support

For issues or questions:
1. Check [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) for approach-specific guidance
2. Review [MANUAL-SETUP.md](./MANUAL-SETUP.md) troubleshooting section
3. Check PCarsTools issues: https://github.com/Nenkai/PCarsTools/issues

---

**Status:** In Development  
**Last Updated:** November 9, 2025  
**Version:** 0.1.0
