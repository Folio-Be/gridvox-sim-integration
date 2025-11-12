# PSD Manipulation Technology Stack

**Created:** 2025-11-12  
**Purpose:** Enable programmatic PSD editing for livery builder app

## Core Requirements

For the livery builder to work with AMS2/ACC/AC templates, we need to:

1. **Read PSD files** - Parse layer structure, metadata, wireframes
2. **Render layers** - Display individual layers on canvas
3. **Draw/Paint** - Allow users to draw custom liveries on layers
4. **Manipulate layers** - Move, resize, rotate, adjust opacity
5. **Export to DDS** - Convert final result to game-compatible DDS format

## Library Options

### 1. @webtoon/psd ⭐ RECOMMENDED for READING

**Package:** `@webtoon/psd`  
**Version:** 0.4.0  
**Size:** ~100 KiB minified (zero dependencies!)  
**License:** MIT  

**Capabilities:**
- ✅ Read PSD/PSB files (including large 8K+ templates)
- ✅ Parse layer tree and metadata
- ✅ Decode pixel data to `ImageData`/Canvas
- ✅ Extract layer properties (opacity, blend modes, names)
- ✅ Works in browser AND Node.js
- ✅ WebAssembly-accelerated decoding
- ✅ Supports text layers (string value extraction)
- ✅ Guides and slices support
- ❌ Cannot WRITE PSD files
- ❌ No layer effects (shadows, overlays) yet

**Use Case:** Perfect for **loading** AMS2 templates and extracting wireframe/AO/guide layers

**Example:**
```typescript
import Psd from "@webtoon/psd";

// Load PSD template
const psdData = await fetch('AMS2_bmw_m4_gt3_template.psd');
const arrayBuffer = await psdData.arrayBuffer();
const psdFile = Psd.parse(arrayBuffer);

// Get composite image
const compositeBuffer = await psdFile.composite();
const imageData = new ImageData(compositeBuffer, psdFile.width, psdFile.height);

// Traverse layers
for (const layer of psdFile.layers) {
  console.log(`Layer: ${layer.name}, Opacity: ${layer.opacity}`);
  if (layer.name === 'Wireframe') {
    const wireframePixels = await layer.composite(false); // No effects
    // Render wireframe as guide overlay
  }
}
```

---

### 2. ag-psd - FULL READ/WRITE Support

**Package:** `ag-psd`  
**Version:** 28.4.1  
**Size:** ~200 KiB (includes node-canvas in Node.js)  
**License:** MIT  

**Capabilities:**
- ✅ Read PSD files with full layer support
- ✅ **WRITE PSD files** - Create/modify/export PSDs
- ✅ Text layer creation and modification
- ✅ Layer effects (incomplete)
- ✅ Blend modes support
- ✅ Works in browser AND Node.js
- ✅ Smart objects (limited)
- ⚠️ Does NOT auto-generate composite image from layers
- ⚠️ Text layers need manual invalidation on write
- ❌ No 16-bit support
- ❌ No CMYK/LAB color modes (converts to RGB)

**Use Case:** For **editing and exporting** PSDs (if we want to save user projects as PSD)

**Example:**
```typescript
import { readPsd, writePsdBuffer } from 'ag-psd';
import 'ag-psd/initialize-canvas'; // For Node.js

// Read PSD
const buffer = fs.readFileSync('template.psd');
const psd = readPsd(buffer);

// Modify layer
psd.children[0].name = 'User Livery Layer';
psd.children[0].opacity = 0.8;

// Add new text layer
psd.children.push({
  name: 'Car Number',
  text: {
    text: '42',
    transform: [1, 0, 0, 1, 100, 100],
    style: {
      font: { name: 'Arial-BoldMT' },
      fontSize: 72,
      fillColor: { r: 255, g: 255, b: 255 }
    }
  }
});

// Write modified PSD
const outputBuffer = writePsdBuffer(psd, { invalidateTextLayers: true });
fs.writeFileSync('output.psd', outputBuffer);
```

---

## Recommended Workflow

### Phase 1: Template Loading (Use @webtoon/psd)
```typescript
// 1. Load AMS2 template
const template = Psd.parse(await loadFile('AMS2_bmw_m4_gt3_template.psd'));

// 2. Extract guide layers
const wireframeLayer = template.layers.find(l => l.name === 'WIREFRAME');
const aoLayer = template.layers.find(l => l.name === 'AMBIENT OCCLUSION');
const decalZonesLayer = template.layers.find(l => l.name === 'DECAL ZONES');

// 3. Render guides to separate canvases
const wireframeCanvas = createCanvasFromImageData(
  await wireframeLayer.composite(false)
);
const aoCanvas = createCanvasFromImageData(
  await aoLayer.composite(false)
);
```

### Phase 2: User Drawing (Use HTML5 Canvas API)
```typescript
// Create main editing canvas (4096x4096 for GT3)
const editCanvas = document.createElement('canvas');
editCanvas.width = template.width;
editCanvas.height = template.height;
const ctx = editCanvas.getContext('2d');

// Composite base layers
ctx.drawImage(baseColorCanvas, 0, 0); // User's base color
ctx.globalAlpha = 0.3;
ctx.globalCompositeOperation = 'multiply';
ctx.drawImage(aoCanvas, 0, 0); // AO for depth
ctx.globalAlpha = 0.2;
ctx.globalCompositeOperation = 'overlay';
ctx.drawImage(wireframeCanvas, 0, 0); // Wireframe guide

// User draws with brush/shapes/text
ctx.globalAlpha = 1.0;
ctx.globalCompositeOperation = 'source-over';
ctx.fillStyle = '#FF0000';
ctx.fillRect(userSelection.x, userSelection.y, userSelection.w, userSelection.h);

// Add sponsor logos
const logoImg = await loadImage('sponsor-logo.png');
ctx.drawImage(logoImg, 1024, 768, 256, 128);
```

### Phase 3: Export to DDS (Use existing tools)
```typescript
// Get final pixel data
const finalPixels = ctx.getImageData(0, 0, editCanvas.width, editCanvas.height);

// Convert to PNG first (Sharp already in project)
import sharp from 'sharp';
const pngBuffer = await sharp(finalPixels.data, {
  raw: {
    width: editCanvas.width,
    height: editCanvas.height,
    channels: 4
  }
}).png().toBuffer();

// Convert PNG to DDS using existing Python backend
// (Or implement DDS writer in TypeScript - see nvidia-texture-tools binding)
await convertPNGtoDDS(pngBuffer, 'bmw_m4_gt3_42_diff.dds', {
  format: 'BC3', // DXT5 compression
  generateMipmaps: true,
  sRGB: true
});
```

---

## Alternative: Canvas-Only Approach (No PSD Library)

Since AMS2 templates are delivered as RAR archives with both PSD **and** example DDS files, we could:

### Extract DDS Examples with UTEX.js (Already Implemented!)
```typescript
// Load example DDS to see UV layout
import UTEX from './vendor/utex/UTEX.js';

const ddsBuffer = await fs.readFile('example-bmw_m4_gt3_rim_diff.dds');
const dds = UTEX.parseDDS(ddsBuffer.buffer);
const rgba = UTEX.decode(dds.data, dds.width, dds.height, dds.format);

// Create canvas from DDS
const canvas = document.createElement('canvas');
canvas.width = dds.width;
canvas.height = dds.height;
const ctx = canvas.getContext('2d');
ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), dds.width, dds.height), 0, 0);

// Now use this as base template!
```

**Pros:**
- ✅ No PSD parsing needed
- ✅ UTEX.js already working in `ams2-content-listing` project
- ✅ Lighter weight (no PSD library dependency)

**Cons:**
- ❌ Lose layered structure (wireframe, AO, decals are merged)
- ❌ Can't toggle guide layers on/off
- ❌ Example DDS may have branded livery we need to remove

---

## Drawing Tools Stack

### Core Canvas Manipulation
- **HTML5 Canvas API** - Native browser drawing (rectangles, paths, text, images)
- **fabric.js** - Advanced canvas library with object model, transformations, events
- **Konva.js** - Similar to fabric.js, stage/layer architecture

### Brush/Painting Tools
- **Literally Canvas** - Simple drawing board library
- **Atrament.js** - Smooth drawing with pressure sensitivity
- **p5.js** - Creative coding framework with brush tools

### Vector Graphics
- **Paper.js** - Vector graphics scripting with SVG export
- **SVG.js** - Lightweight SVG manipulation

### Text Rendering
- **opentype.js** - Parse and render TrueType/OpenType fonts
- **FontFace API** - Native browser font loading

---

## Export Pipeline

### DDS Export Options

#### Option 1: Python Backend (Already Exists!)
```python
# ams2-ai-livery-designer/python-backend/services/dds_exporter.py
from PIL import Image
import subprocess

def export_to_dds(texture: np.ndarray, output_path: str):
    # Save as PNG first
    img = Image.fromarray(texture)
    png_path = output_path.replace('.dds', '.png')
    img.save(png_path)
    
    # Use nvidia-texture-tools CLI
    subprocess.run([
        'nvcompress',
        '-bc3',  # DXT5 compression
        '-mipmap',  # Generate mipmaps
        png_path,
        output_path
    ])
```

#### Option 2: JavaScript DDS Writer
```typescript
// Use dds-writer library (if exists) or implement BC3 compression
import { writeDDS } from 'dds-writer';

const ddsBuffer = writeDDS(imageData, {
  format: 'BC3',
  width: 4096,
  height: 4096,
  mipmaps: true
});

await fs.writeFile('output.dds', Buffer.from(ddsBuffer));
```

#### Option 3: NVIDIA Texture Tools Bindings
```typescript
// Node.js native binding to nvidia-texture-tools
import { compressDDS } from 'nvidia-texture-tools';

const dds = compressDDS(rgbaPixels, {
  width: 4096,
  height: 4096,
  format: 'BC3',
  quality: 'highest',
  generateMipmaps: true
});
```

---

## Project Structure Recommendation

```
simvox-livery-builder/
├── src/
│   ├── psd-loader/
│   │   ├── template-parser.ts        # @webtoon/psd wrapper
│   │   ├── layer-extractor.ts        # Extract wireframe/AO/guides
│   │   └── dds-reader.ts             # UTEX.js wrapper (fallback)
│   ├── canvas-editor/
│   │   ├── livery-canvas.ts          # Main editing canvas
│   │   ├── tools/
│   │   │   ├── brush-tool.ts
│   │   │   ├── shape-tool.ts
│   │   │   ├── text-tool.ts
│   │   │   └── logo-import-tool.ts
│   │   └── layers/
│   │       ├── layer-manager.ts      # User layer stack
│   │       └── blend-modes.ts        # Canvas composite operations
│   ├── exporters/
│   │   ├── dds-exporter.ts           # Call Python backend or native
│   │   └── preview-exporter.ts       # PNG/JPEG preview
│   └── templates/
│       └── ams2-template-db.ts       # Template metadata/paths
├── python-backend/                    # Existing DDS exporter
│   └── services/
│       └── dds_exporter.py
└── templates/                         # Extracted PSD templates
    └── AMS2/
        ├── extracted/
        │   ├── BMW_M4_GT3/
        │   │   ├── AMS2_bmw_m4_gt3_template.psd
        │   │   ├── example-BMW_M4_GT3_01_plate_diff.dds
        │   │   └── ...
        │   └── ...
        └── psd-metadata/
            └── bmw_m4_gt3_layers.json  # Pre-parsed layer info
```

---

## Implementation Priority

### MVP (Minimum Viable Product)
1. ✅ **Load PSD template** with @webtoon/psd
2. ✅ **Extract wireframe layer** as overlay guide
3. ✅ **Basic canvas drawing** (brush, fill, shapes)
4. ✅ **Export to PNG** first (validate UV layout)
5. ✅ **Convert PNG to DDS** via Python backend

### Phase 2 (Enhanced Editor)
6. **Text tool** with font selection
7. **Logo import** (SVG/PNG with transparency)
8. **Layer system** (base color, patterns, decals, numbers)
9. **AO blending** for realistic depth
10. **Undo/Redo** with canvas history

### Phase 3 (Advanced Features)
11. **Pattern library** (stripes, gradients, carbon fiber)
12. **Smart decal zones** (auto-fit sponsor logos to wireframe guides)
13. **Multi-template support** (body + wheels + numberplate editing)
14. **Real-time 3D preview** (apply texture to 3D car model)

---

## Next Steps

1. **Install @webtoon/psd:**
   ```bash
   npm install @webtoon/psd
   ```

2. **Test PSD loading** with AMS2 BMW M4 GT3 template:
   ```typescript
   import Psd from '@webtoon/psd';
   import { readFile } from 'fs/promises';
   
   const buffer = await readFile('AMS2_bmw_m4_gt3_template.psd');
   const psd = Psd.parse(buffer.buffer);
   console.log('Layers:', psd.layers.map(l => l.name));
   ```

3. **Create proof-of-concept canvas editor** that:
   - Loads BMW M4 GT3 PSD
   - Renders wireframe layer as semi-transparent overlay
   - Allows basic brush drawing
   - Exports to PNG

4. **Test DDS export** using existing Python backend

5. **Validate in AMS2** - Replace `bmw_m4_gt3_01_diff.dds` and check in-game

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **PSD Reading** | @webtoon/psd | Zero dependencies, 100KB, browser + Node.js |
| **PSD Writing** | NOT NEEDED | Export to DDS, don't save as PSD |
| **Drawing Engine** | HTML5 Canvas API | Native, fast, well-documented |
| **UI Framework** | TBD (React/Vue/Svelte) | Need component state management |
| **DDS Export** | Python backend | Already implemented, nvidia-texture-tools reliable |
| **Template Storage** | Pre-extracted PSDs | RAR extracted once, PSDs cached |

---

## Questions to Resolve

1. **Do we need to save projects as PSD?**
   - If YES → Use ag-psd for write support
   - If NO → @webtoon/psd sufficient (export to DDS only)

2. **Should we support opening user-created PSDs?**
   - Photoshop-created liveries imported into app?

3. **3D preview integration?**
   - three.js with texture mapping?
   - Pre-rendered camera angles?

4. **Multi-car support priority?**
   - GT3 only for MVP?
   - Or all 4 classes (LMDh, GT3, Formula, Stock Car)?
