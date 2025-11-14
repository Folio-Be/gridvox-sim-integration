# Quick Start Guide

Get up and running with the AC Car Model Extractor in **5 minutes**.

## Prerequisites

- ✅ **Assetto Corsa** installed (Steam or standalone)
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **PowerShell 5.1+** (Windows built-in)

## Step 1: Install Dependencies

```bash
cd C:\DATA\SimVox\simvox-sim-integration\ac\car-model-extractor
npm install
```

## Step 2: Download Tools

### Option A: Manual Download (Recommended)

1. **Download kn5-converter**:
   - Visit: https://github.com/RaduMC/kn5-converter
   - Download or build `kn5conv.exe`
   - Place in: `tools/kn5-converter/kn5conv.exe`

2. **Download FBX2glTF**:
   - Visit: https://github.com/facebookincubator/FBX2glTF/releases
   - Download `FBX2glTF-windows-x86_64.zip`
   - Extract `FBX2glTF.exe` to: `tools/FBX2glTF/FBX2glTF.exe`

### Option B: Build kn5-converter from Source

If no precompiled binary exists:

```bash
# Clone repository
git clone https://github.com/RaduMC/kn5-converter.git temp-kn5

# Build with .NET
cd temp-kn5
dotnet build -c Release

# Copy executable
cp "kn5 converter/bin/Release/net6.0/kn5conv.exe" ../tools/kn5-converter/
cd ..
rm -rf temp-kn5
```

## Step 3: Configure

```bash
# Copy environment template
cp .env.example .env

# Edit .env
notepad .env
```

**Update this line** with your AC installation path:
```env
AC_INSTALL_PATH=C:\Program Files (x86)\Steam\steamapps\common\assettocorsa
```

## Step 4: Verify Setup

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

## Step 5: Extract Your First Car

```bash
# Extract Ferrari 488 GT3
npm run extract:single -- --car ks_ferrari_488_gt3
```

Expected output:
```
[1/1] (100%) ks_ferrari_488_gt3
  ✓ Converted to FBX
  ✓ Converted to GLTF (1.2 MB)

Extraction Complete
Total:      1
Successful: 1
Failed:     0
```

**Output location**: `output/gltf/ks_ferrari_488_gt3.glb`

## Step 6: Test with Multiple Cars

```bash
# Extract 5 sample cars
npm run test
```

This extracts:
- Ferrari 488 GT3
- Porsche 911 GT3 R 2016
- Lamborghini Huracán GT3
- Mercedes-AMG GT3
- Audi R8 LMS 2016

**Duration**: ~1-2 minutes

## Step 7: View 3D Model

Open extracted model in [glTF Viewer](https://gltf-viewer.donmccurdy.com/):

1. Visit: https://gltf-viewer.donmccurdy.com/
2. Drag `output/gltf/ks_ferrari_488_gt3.glb` into browser
3. Rotate/zoom to inspect model
4. Check "Materials" tab for PBR properties

**Expected**: 3D car model with correct geometry and UV mapping

---

## Next Steps

### Extract More Cars

```bash
# Extract specific cars
npm run extract:batch -- --cars ks_porsche_911_gt3_r_2016,ks_mercedes_amg_gt3

# Extract ALL cars (178 base game cars, ~15-25 minutes)
npm run extract:batch -- --all
```

### Use in SimVox Livery Designer

```typescript
import { ACCarExtractor } from '@simvox/ac-car-model-extractor';

const extractor = new ACCarExtractor({
  acInstallPath: 'C:\\assettocorsa',
  outputDir: './output'
});

// Extract popular GT3 cars for livery designer
await extractor.extractBatch([
  'ks_ferrari_488_gt3',
  'ks_porsche_911_gt3_r_2016',
  'ks_lamborghini_huracan_gt3',
  'ks_mercedes_amg_gt3',
  'ks_audi_r8_lms_2016'
]);
```

### Load in three.js

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

loader.load('output/gltf/ks_ferrari_488_gt3.glb', (gltf) => {
  const carModel = gltf.scene;
  scene.add(carModel);

  console.log('Car loaded!', {
    meshes: gltf.scene.children.length,
    materials: gltf.scene.children[0].material
  });
});
```

---

## Troubleshooting

### kn5-converter not found

**Error**: `✖ kn5-converter not found: tools/kn5-converter/kn5conv.exe`

**Solution**:
1. Download from https://github.com/RaduMC/kn5-converter
2. Place `kn5conv.exe` in `tools/kn5-converter/`
3. Run `npm run verify` again

### FBX2glTF not found

**Error**: `✖ FBX2glTF not found: tools/FBX2glTF/FBX2glTF.exe`

**Solution**:
1. Download from https://github.com/facebookincubator/FBX2glTF/releases
2. Extract `FBX2glTF.exe` to `tools/FBX2glTF/`
3. Run `npm run verify` again

### AC installation not found

**Error**: `✖ AC cars directory not found`

**Solution**:
1. Open `.env` file
2. Update `AC_INSTALL_PATH` to your AC installation
3. Common paths:
   - Steam: `C:\Program Files (x86)\Steam\steamapps\common\assettocorsa`
   - Standalone: `C:\Games\assettocorsa`
4. Run `npm run verify` again

### .NET Runtime required

**Error**: `The application requires .NET 6.0 Runtime`

**Solution**:
1. Download: https://dotnet.microsoft.com/download/dotnet/6.0
2. Install "Desktop Runtime" (x64)
3. Restart terminal

### Visual C++ Redistributable missing

**Error**: `VCRUNTIME140.dll was not found`

**Solution**:
1. Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Install and restart

---

## Common Use Cases

### Pre-extract popular cars for SimVox MVP

```bash
# Create list of popular GT3/GT4 cars
npm run extract:batch -- --cars \
  ks_ferrari_488_gt3,\
  ks_porsche_911_gt3_r_2016,\
  ks_lamborghini_huracan_gt3,\
  ks_mercedes_amg_gt3,\
  ks_audi_r8_lms_2016,\
  ks_bmw_m6_gt3,\
  ks_nissan_gtr_gt3,\
  ks_mclaren_650_gt3,\
  ks_porsche_918_spyder,\
  ks_ferrari_laferrari
```

**Duration**: ~2-3 minutes
**Output size**: ~20-30 MB (with Draco compression)

### Extract all DLC cars

```bash
# List all kunos_* (Kunos DLC) cars
npm run extract:batch -- --all --filter kunos_
```

### Skip already converted files

```bash
# Add --skip-existing flag
npm run extract:batch -- --all --skip-existing
```

This speeds up re-runs by only converting new cars.

---

## Performance Tips

### Batch Processing

Extract multiple cars at once instead of one-by-one:

```bash
# Slower (1 car at a time)
npm run extract:single -- --car ks_ferrari_488_gt3
npm run extract:single -- --car ks_porsche_911_gt3_r_2016

# Faster (batch)
npm run extract:batch -- --cars ks_ferrari_488_gt3,ks_porsche_911_gt3_r_2016
```

### Draco Compression

Adjust compression level for size vs quality tradeoff:

```env
# In .env file
DRACO_COMPRESSION_LEVEL=10  # Max compression (slowest, smallest)
DRACO_COMPRESSION_LEVEL=7   # Balanced (default)
DRACO_COMPRESSION_LEVEL=0   # Min compression (fastest, largest)
```

**Recommendation**: Level 7 provides 90% size reduction with minimal quality loss.

---

## What's Next?

1. ✅ Extract popular cars for SimVox livery designer
2. ✅ Load models in three.js
3. ✅ Apply custom livery textures from fabric.js
4. ✅ Build livery preview/editor UI

See [README.md](README.md) for full documentation.

---

**Need help?** Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) or open an issue.
