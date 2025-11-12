# LMU TGA Livery Analysis

## Overview

Le Mans Ultimate (LMU) uses **TGA (Targa) image files** for liveries, not PSD templates. These are finished livery textures that can be edited directly in image editors.

## Extracted Files Summary

### File Structure

Each livery package contains:
- `customskin.tga` - Main livery texture
- `customskin_region.tga` - Region/team identification texture (separate texture for number plates, team logos, etc.)

### File Details

| Vehicle | Main Livery Size | Region Texture Size | Resolution | Format |
|---------|-----------------|---------------------|------------|--------|
| Aston Martin GT3 (Toy Story) | 2.17 MB | 1.72 MB | 4096x4096 | TGA 24-bit |
| BMW M4 EVO (Drift Brother) | 3.31 MB | 1.81 MB | 4096x4096 | TGA 24-bit |
| LIGIER JS P325 LMP3 (Jordan 191) | 48.00 MB | 48.00 MB | 4096x4096 | TGA 24-bit |

**Note**: LIGIER files are uncompressed (48 MB each = 4096 x 4096 x 3 bytes), while Aston/BMW appear to use RLE compression.

## TGA Format Specifications

### Technical Details
- **Format**: Targa (TGA) uncompressed or RLE compressed
- **Color Depth**: 24-bit RGB (3 bytes per pixel)
- **Resolution**: 4096x4096 (standard for modern racing sims)
- **Channels**: RGB only (no alpha channel in these examples)
- **Compression**: Variable (RLE or uncompressed)

### File Purpose
- **`customskin.tga`**: Main car body livery texture (UV mapped to 3D model)
- **`customskin_region.tga`**: Additional texture for region-specific elements (team names, flags, number plates)

## Differences from AMS2 PSD Templates

| Aspect | AMS2 (PSD) | LMU (TGA) |
|--------|-----------|-----------|
| **Format** | Adobe Photoshop Document | Targa Image |
| **Layers** | Multiple layers (wireframe, AO, decals) | Single flattened image |
| **Editability** | Template with guides/helpers | Finished livery texture |
| **File Size** | 23-78 MB (with layers) | 2-48 MB (flattened) |
| **Purpose** | Starting template for creation | Ready-to-use livery |
| **Workflow** | Design → Export → DDS conversion | Direct use or modify → DDS conversion |

## What We Can Do with LMU TGA Files

### ✅ Supported Operations

1. **Direct Display**
   - Load TGA in browser using HTML5 Canvas
   - Display as reference for livery design
   - Use as background/base layer

2. **Image Editing**
   - Paint/draw over existing livery
   - Add text, logos, decals
   - Color adjustments (hue, saturation, brightness)
   - Filters and effects

3. **Conversion**
   - Export to PNG (for preview)
   - Convert to DDS (for game use)
   - Save as TGA with modifications

4. **Analysis**
   - Extract color palettes
   - Identify UV mapping regions
   - Compare livery variations

### ❌ Limited Operations

1. **No Layer Separation**
   - Cannot isolate wireframe/AO layers (already baked in)
   - No individual sponsor decals to toggle
   - Cannot adjust layer blend modes

2. **No Template Guides**
   - No UV wireframe overlay
   - No decal zone markers
   - No ambient occlusion layer

### 🔧 Workflow Recommendations

#### Option 1: Direct Editing (Simple)
```
Load TGA → Draw/Paint → Export PNG/TGA → Convert to DDS
```

#### Option 2: Layered Editing (Advanced)
```
Load TGA as base → Create new layers → Add decals/text → Flatten → Export
```

#### Option 3: Reference-Based Design
```
Load TGA for reference → Create blank canvas → Design from scratch → Export
```

## Browser TGA Support

### Native Support: ❌ No
- Browsers do not natively support TGA format
- Cannot use `<img src="file.tga">` directly

### JavaScript Libraries: ✅ Yes

#### Recommended: [tga-js](https://www.npmjs.com/package/tga-js)
```javascript
import TGA from 'tga-js';

const tga = new TGA();
tga.load(arrayBuffer);

// Get ImageData for canvas
const imageData = tga.getImageData();
ctx.putImageData(imageData, 0, 0);
```

**Features:**
- 8KB minified
- Supports RLE compression
- Returns HTML5 ImageData
- No dependencies

#### Alternative: [utif](https://www.npmjs.com/package/utif) 
- Also supports TGA
- 50KB minified
- Multi-format (TIFF, TGA, DNG)

### Integration with Current POC

The existing `poc-psd-livery-editor` can be extended:

1. **Add TGA Loader Component**
   ```typescript
   import TGA from 'tga-js';
   
   const loadTGA = async (filePath: string) => {
     const buffer = await readFile(filePath);
     const tga = new TGA();
     tga.load(buffer);
     return tga.getImageData();
   };
   ```

2. **Unified Livery Canvas**
   - Same canvas rendering as PSD workflow
   - Skip layer detection (single image)
   - Full drawing tools enabled

3. **File Type Detection**
   ```typescript
   const ext = path.extname(filePath).toLowerCase();
   if (ext === '.tga') return loadTGA(filePath);
   if (ext === '.psd') return loadPSD(filePath);
   ```

## Next Steps

### Immediate (POC Extension)
1. Install `tga-js` package
2. Create `TGALoader.tsx` component
3. Extend `LiveryCanvas.tsx` to handle both PSD and TGA
4. Add file type detection in file picker

### Future (Full Application)
1. **Template Library**
   - Organize by sim (AMS2 = PSD, LMU = TGA)
   - Show preview thumbnails
   - Filter by car/class

2. **Drawing Tools** (works with both formats)
   - Brush, shapes, text
   - Color picker
   - Layer management (for new layers on top of base)

3. **Export Options**
   - PNG (preview/sharing)
   - TGA (LMU native)
   - DDS (game-ready with compression)

## File Locations

### Extracted LMU Liveries
```
sims/LMU/example-templates/extracted/
├── Aston_Martin_GT3_Toy_Story/
│   └── Aston Martin GT3 Toy Story livery/
│       ├── customskin.tga (2.17 MB, 4096x4096)
│       └── customskin_region.tga (1.72 MB, 4096x4096)
├── BMW_M4_EVO_Drift_Brother/
│   └── BMW M4 EVO Drift Brother livery/
│       ├── customskin.tga (3.31 MB, 4096x4096)
│       └── customskin_region.tga (1.81 MB, 4096x4096)
└── LIGIER_JS_P325_LMP3_Jordan_191/
    ├── customskin.tga (48.00 MB, 4096x4096, uncompressed)
    └── customskin_region.tga (48.00 MB, 4096x4096, uncompressed)
```

## Comparison: PSD vs TGA Livery Editing

| Workflow | Best For | Complexity | Output Quality |
|----------|----------|------------|----------------|
| **PSD Template** | Creating from scratch | High (layer management) | Excellent (full control) |
| **TGA Editing** | Modifying existing liveries | Medium (direct painting) | Good (limited to single layer) |
| **Hybrid** | Professional designs | High (both skills needed) | Excellent (best of both) |

## Conclusion

LMU TGA files are **ready-to-use livery textures**, not templates. They can be:
- ✅ Loaded and displayed in the POC
- ✅ Edited with drawing tools
- ✅ Exported to PNG/TGA/DDS
- ❌ Cannot separate layers (already flattened)
- ❌ No template guides (wireframe/AO baked in)

**Recommended approach**: Extend the current POC to support both PSD (AMS2) and TGA (LMU) formats with a unified canvas interface.
