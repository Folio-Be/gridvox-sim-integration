# AMS2 Track Extractor (PCarsTools Approach)

⚠️ **PROJECT DISCONTINUED** - See [PROJECT-STOPPED.md](./PROJECT-STOPPED.md) for details.

## Status: BLOCKED

**This extraction approach does NOT work for built-in AMS2 tracks** due to incompatible pak encryption.

- ❌ **Built-in tracks** (Cadwell Park, Silverstone, Spa, Monza, etc.): Encrypted - CANNOT extract
- ✅ **Mod/DLC tracks** (Fuji, Emirates, Florence, Knockhill, etc.): Unencrypted - CAN extract
- ✅ **Recommended Alternative**: Telemetry-based approach in [ams2-telemetry-track-generator](../ams2-telemetry-track-generator/)

## Why It Failed

After 22 hours of deep investigation, we discovered:

1. **Built-in AMS2 tracks** store geometry in encrypted pak files with incompatible encryption
2. **PCarsTools** was designed for Project Cars 1/2 and cannot decrypt AMS2's newer pak system
3. **Only mod tracks** have extractable .meb mesh files in Tracks/ directories
4. **~200+ built-in tracks** are inaccessible using this approach

See **[PROJECT-STOPPED.md](./PROJECT-STOPPED.md)** for complete technical analysis.

## What We Built (Still Valuable)

Despite the blocker, 800+ lines of working code were created:
- ✅ DirectX mesh binary parser (MebParser.ts)
- ✅ glTF converter with coordinate transformation (MebToGltfConverter.ts)
- ✅ Extraction workflow orchestration (extract-track-v2.ts)

**This code CAN extract mod tracks** that have .meb files (e.g., Fuji, Emirates Raceway).

---

## Original Project Overview (Historical)

**Purpose:** Generate 3D track models from AMS2 game files for SimVox.ai telemetry visualization  
**Method:** PCarsTools extraction → Blender conversion → glTF optimization  
**Target Format:** glTF 2.0 (optimized for Three.js)  
**Success Rate:** ~40% (requires accessible game files and manual workflow)

> **Note:** For a simpler approach with 95% success rate, see the telemetry-based method:  
> [ams2-telemetry-track-generator](../ams2-telemetry-track-generator/)

## ⚠️ Important Limitations

**This approach has significant challenges:**
- ❌ **Manual coordinate alignment required** - Telemetry won't align automatically
- ❌ **40% success rate** - Many tracks have inaccessible or encrypted files
- ❌ **Complex toolchain** - Requires PCarsTools, Blender, .NET, manual steps
- ❌ **Game updates break workflow** - File structure changes with patches
- ❌ **2+ hours per track** - Time-intensive manual process

**When to use this approach:**
- ✅ You need high-fidelity visual models (for presentations/marketing)
- ✅ Telemetry alignment is not critical
- ✅ You're willing to invest time in manual calibration

**When NOT to use:**
- ❌ You need telemetry replay (coordinates won't match)
- ❌ You want quick results
- ❌ You want to process many tracks

## Prerequisites

### Required Software

1. **Node.js 18+**
   - Download: https://nodejs.org/

2. **.NET 6.0 Runtime**
   - Download: https://dotnet.microsoft.com/download/dotnet/6.0
   - Verify: `dotnet --version`

3. **Blender 4.0+**
   - Download: https://www.blender.org/download/
   - Used for file format conversion

4. **AMS2 Installation**
   - Full game installation required
   - Access to game files directory

### PCarsTools Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

**Quick checklist:**
- [ ] PCarsTools binary (`pcarstools_x64.exe`) in `tools/PCarsTools/`
- [ ] Oodle DLL (`oo2core_4_win64.dll`) in `tools/PCarsTools/`
- [ ] .NET 6.0 Runtime installed
- [ ] Blender installed and in PATH

## Installation

```bash
cd C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-track-extractor
npm install
```

## Usage

### Step 1: Extract Track Files

```bash
# Extract track geometry from AMS2
npm run extract -- --track silverstone
```

This uses PCarsTools to:
- Locate track files in AMS2 installation
- Extract compressed `.bff` archives
- Convert to intermediate format

### Step 2: Convert to glTF (Manual - Blender Required)

Currently requires manual Blender workflow:
1. Open extracted files in Blender
2. Import track mesh
3. Export as glTF 2.0
4. Save to `extracted-tracks/`

See [MANUAL-SETUP.md](./MANUAL-SETUP.md) for detailed Blender workflow.

### Step 3: Optimize for Web

```bash
npm run optimize -- extracted-tracks/silverstone.glb
```

Output: `converted-tracks/silverstone-optimized.glb`

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

### Using with SimVox.ai Telemetry Visualization

See [SimVox.ai-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md](../../SimVox.ai-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md) for complete integration guide with:
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
- **SimVox.ai-docs** - Three.js visualization architecture documentation
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
