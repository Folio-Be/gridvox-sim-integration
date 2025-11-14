# Assetto Corsa Car Model Extractor

**TypeScript library + CLI** for extracting Assetto Corsa car models (.kn5) and converting to GLTF/GLB format for use in SimVox livery designer.

## Features

- ✅ **Fully automated pipeline**: .kn5 → FBX → GLTF
- ✅ **Command-line tools**: No manual GUI steps required
- ✅ **TypeScript library**: Programmatic API for SimVox integration
- ✅ **Batch processing**: Extract entire car library (178 base cars)
- ✅ **Draco compression**: 90% file size reduction
- ✅ **UV mapping preserved**: Ready for livery texture application
- ✅ **PBR materials**: glTF 2.0 compliant output

## Why Assetto Corsa?

Compared to other racing sims (AMS2, ACC, iRacing):
- ✅ **100% automation**: Command-line tools exist for both conversion steps
- ✅ **Better tooling**: kn5-converter + FBX2glTF are battle-tested
- ✅ **Fast extraction**: 15-25 minutes for 200 cars
- ✅ **Large content library**: 178 base cars + hundreds of mods

See [docs/RESEARCH-COMPARISON.md](docs/RESEARCH-COMPARISON.md) for detailed analysis.

## Quick Start

### Prerequisites

1. **Assetto Corsa** installed (Steam or standalone)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **kn5-converter** - [Download](https://github.com/RaduMC/kn5-converter/releases) or build from source
4. **FBX2glTF** - [Download](https://github.com/facebookincubator/FBX2glTF/releases)

### Installation

```bash
cd C:\DATA\SimVox\simvox-sim-integration\ac\car-model-extractor

# Install dependencies
npm install

# Copy example environment
cp .env.example .env

# Edit .env to set your AC installation path
# AC_INSTALL_PATH=C:\Program Files (x86)\Steam\steamapps\common\assettocorsa
```

### Download Tools

1. **kn5-converter** (C# .NET tool):
   - Download from [RaduMC/kn5-converter releases](https://github.com/RaduMC/kn5-converter/releases)
   - OR build from source (requires .NET 6.0)
   - Place `kn5conv.exe` in `tools/kn5-converter/`

2. **FBX2glTF** (Meta/Facebook tool):
   - Download from [FBX2glTF releases](https://github.com/facebookincubator/FBX2glTF/releases)
   - Extract `FBX2glTF.exe` to `tools/FBX2glTF/`

### Verify Setup

```bash
npm run verify
```

Expected output:
```
✓ kn5-converter found: tools/kn5-converter/kn5conv.exe
✓ FBX2glTF found: tools/FBX2glTF/FBX2glTF.exe
✓ Assetto Corsa installation: C:\...\assettocorsa
✓ Found 178 cars in content/cars/
```

## Usage

### CLI Usage

```bash
# Extract single car
npm run extract:single -- --car ks_ferrari_488_gt3

# Extract multiple cars
npm run extract:batch -- --cars ks_ferrari_488_gt3,ks_porsche_911_gt3_r_2016

# Extract all cars
npm run extract:batch -- --all

# Test with 5 cars
npm run test
```

**Output**: GLTF models in `output/gltf/{car-id}.glb`

### Library Usage (Programmatic)

```typescript
import { ACCarExtractor } from '@simvox/ac-car-model-extractor';

const extractor = new ACCarExtractor({
  acInstallPath: 'C:\\assettocorsa',
  outputDir: './output',
  dracoCompression: true,
  dracoLevel: 7
});

// Extract single car
await extractor.extractCar('ks_ferrari_488_gt3');

// Extract batch
await extractor.extractBatch([
  'ks_ferrari_488_gt3',
  'ks_porsche_911_gt3_r_2016'
]);

// Extract all cars
const cars = await extractor.listAvailableCars();
await extractor.extractBatch(cars);

// Get extraction progress
extractor.on('progress', (event) => {
  console.log(`${event.stage}: ${event.current}/${event.total}`);
});
```

## Architecture

### Workflow

```
Assetto Corsa Installation
  └─ content/cars/
      ├─ ks_ferrari_488_gt3/
      │   └─ ks_ferrari_488_gt3.kn5  ───┐
      │                                  │
      ├─ ks_porsche_911_gt3_r_2016/     │ Step 1: kn5-converter
      │   └─ ks_porsche_*.kn5  ─────────┤ .kn5 → .fbx
      │                                  │ (C# tool)
      └─ ...                             │
                                         ▼
                                   output/fbx/
                                      ├─ ks_ferrari_488_gt3.fbx
                                      └─ ks_porsche_911_gt3_r_2016.fbx
                                         │
                                         │ Step 2: FBX2glTF
                                         │ .fbx → .glb
                                         │ (with Draco compression)
                                         ▼
                                   output/gltf/
                                      ├─ ks_ferrari_488_gt3.glb
                                      └─ ks_porsche_911_gt3_r_2016.glb
                                         │
                                         │ SimVox Livery Designer
                                         ▼
                                   three.js + fabric.js
                                   (3D model + livery painting)
```

### Library Structure

```
src/
├── lib/
│   ├── index.ts              # Public API exports
│   ├── extractor.ts          # ACCarExtractor class
│   ├── kn5-converter.ts      # kn5-converter wrapper
│   ├── fbx2gltf.ts           # FBX2glTF wrapper
│   ├── car-scanner.ts        # Scan AC installation for cars
│   └── types.ts              # TypeScript types
├── cli/
│   ├── index.ts              # CLI entry point
│   └── verify-tools.ts       # Verify prerequisites
└── utils/
    ├── process.ts            # Child process helpers
    ├── logger.ts             # Logging utilities
    └── config.ts             # Environment config
```

## Performance

| Phase | Tool | Duration (200 cars) | Output Size |
|-------|------|---------------------|-------------|
| .kn5 → FBX | kn5-converter | 10-15 min | ~20GB |
| FBX → GLTF | FBX2glTF | 5-10 min | ~2GB (Draco) |
| **Total** | | **15-25 min** | **2GB** |

**Single car**: ~5-10 seconds

## Output Format

GLTF/GLB files include:
- ✅ Mesh geometry (vertices, faces, normals)
- ✅ UV coordinates (V-flipped for glTF compliance)
- ✅ PBR materials (metallic-roughness workflow)
- ✅ Embedded textures
- ✅ Draco-compressed buffers (90% size reduction)

**Ready for three.js**:
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('ks_ferrari_488_gt3.glb', (gltf) => {
  const carModel = gltf.scene;
  scene.add(carModel);

  // Apply custom livery texture
  const texture = new THREE.TextureLoader().load('livery.png');
  carModel.traverse((child) => {
    if (child.isMesh && child.material.name === 'Body') {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
});
```

## Integration with SimVox MVP

This library will be consumed by the SimVox livery designer:

```typescript
// In SimVox livery designer
import { ACCarExtractor } from '@simvox/ac-car-model-extractor';

// On first launch, extract popular cars
const extractor = new ACCarExtractor();
await extractor.extractBatch([
  'ks_ferrari_488_gt3',
  'ks_porsche_911_gt3_r_2016',
  // ... 10-15 popular GT3 cars
]);

// User selects car in livery designer
const carModel = await loadGLTF(`models/${selectedCar}.glb`);

// User paints livery with fabric.js
const liveryTexture = fabricCanvas.toDataURL();

// Apply to 3D model
applyLiveryTexture(carModel, liveryTexture);
```

## Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev

# Clean output
npm run clean
```

## Troubleshooting

### kn5-converter not found

**Problem**: `Error: kn5conv.exe not found`

**Solution**:
1. Download from [RaduMC/kn5-converter releases](https://github.com/RaduMC/kn5-converter/releases)
2. Place in `tools/kn5-converter/kn5conv.exe`
3. Run `npm run verify`

### FBX2glTF not found

**Problem**: `Error: FBX2glTF.exe not found`

**Solution**:
1. Download from [FBX2glTF releases](https://github.com/facebookincubator/FBX2glTF/releases)
2. Extract to `tools/FBX2glTF/FBX2glTF.exe`
3. Run `npm run verify`

### Assetto Corsa not found

**Problem**: `Error: AC installation not found`

**Solution**:
1. Edit `.env` file
2. Set `AC_INSTALL_PATH` to your AC installation
3. Example: `AC_INSTALL_PATH=D:\Games\assettocorsa`

### UV mapping incorrect

**Problem**: Livery texture appears flipped/rotated

**Solution**:
- FBX2glTF automatically flips V-coordinates for glTF compliance
- Ensure you're using `texture.flipY = false` in three.js
- See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for details

## Documentation

- [IMPLEMENTATION-CHECKLIST.md](docs/IMPLEMENTATION-CHECKLIST.md) - Development roadmap
- [RESEARCH-COMPARISON.md](docs/RESEARCH-COMPARISON.md) - Why Assetto Corsa vs AMS2/ACC
- [API.md](docs/API.md) - Library API documentation
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues

## License

MIT

## Related Projects

- [ams2-car-image-extractor](../ams2/ams2-car-image-extractor) - Extracts 2D car preview images from AMS2
- [kn5-converter](https://github.com/RaduMC/kn5-converter) - Assetto Corsa .kn5 to FBX converter
- [FBX2glTF](https://github.com/facebookincubator/FBX2glTF) - Meta's FBX to glTF converter

## Credits

- **kn5-converter** by RaduMC
- **FBX2glTF** by Meta/Facebook
- **SimVox Team** - Integration and library wrapper
