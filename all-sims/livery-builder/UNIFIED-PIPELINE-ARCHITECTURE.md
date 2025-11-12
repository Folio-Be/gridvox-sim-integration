# Unified Multi-Sim Livery Pipeline Architecture

## Overview

This document defines the architecture for a **unified livery editing pipeline** that handles different file formats from multiple racing and flight simulators through a single interface.

## Supported Simulators & Formats

### Racing Sims

| Simulator | Format | File Types | Resolution | Status |
|-----------|--------|-----------|------------|--------|
| **AMS2** (Automobilista 2) | PSD Templates | `.psd` | 4K-8K | ✅ Implemented |
| **LMU** (Le Mans Ultimate) | TGA Liveries | `.tga` | 4K | ✅ Implemented |
| **ACC** (Assetto Corsa Competizione) | DDS Liveries | `.dds` | 4K | 🔄 Pending (Google Drive templates found) |
| **AC** (Assetto Corsa) | DDS/PNG Liveries | `.dds`, `.png` | 2K-4K | 🔄 Pending (Google Drive templates found) |
| **iRacing** | TGA/PSD Templates | `.tga`, `.psd` | 2K-4K | ⚠️ Requires login |

### Flight Sims

| Simulator | Format | File Types | Resolution | Status |
|-----------|--------|-----------|------------|--------|
| **MSFS 2024** | DDS Packages | `.dds` (in packages) | 4K-8K | ✅ Templates downloaded |
| **X-Plane** | PNG/DDS Liveries | `.png`, `.dds` | 2K-4K | ⚠️ TBD |

## Format Analysis Summary

### AMS2: PSD Templates
**Purpose**: Template-based creation with layers  
**Structure**:
```
AMS2_car_template.psd (23-78 MB)
├─ Wireframe layer (UV guide)
├─ Ambient Occlusion layer (depth)
├─ Decal zones (sponsor placement)
└─ Example livery (reference)
```
**Workflow**: Load PSD → Extract layers → Design with guides → Export DDS

### LMU: TGA Liveries
**Purpose**: Finished livery textures  
**Structure**:
```
customskin.tga (2-48 MB, 4096x4096)
customskin_region.tga (team/number plates)
```
**Workflow**: Load TGA → Edit directly → Export TGA/DDS

### MSFS 2024: DDS Packages
**Purpose**: Complete aircraft livery packages  
**Structure**:
```
livery_package/
├─ manifest.json (metadata)
├─ layout.json (file list)
└─ SimObjects/Airplanes/model_name/texture.variant/
    ├─ AIRFRAME_BOTTOM_ALBD.dds (albedo/color, 21.33 MB)
    ├─ AIRFRAME_BOTTOM_COMP.dds (composite, 10.67 MB)
    ├─ AIRFRAME_BOTTOM_NORM.dds (normal map, 21.33 MB)
    ├─ COCKPIT_DECALS_ALBD.dds (decals, 5.33 MB)
    └─ [50+ texture files per variant]
```
**Workflow**: Extract DDS → Edit specific textures → Repackage

### ACC/AC: DDS Liveries (Google Drive)
**Purpose**: Car skin packages  
**Structure**: TBD - need to download from https://drive.google.com/drive/folders/1er3RbPLwVHSFcs_5S_vNEJZvLewK5M9l
**Expected**: Similar to LMU (body + decals DDS files)

## Unified Pipeline Architecture

### 1. Format Detection Layer

```typescript
interface LiveryFormat {
  sim: 'AMS2' | 'LMU' | 'ACC' | 'AC' | 'MSFS2024' | 'iRacing';
  type: 'psd' | 'tga' | 'dds' | 'png' | 'package';
  files: string[];
  metadata?: any;
}

class FormatDetector {
  static detect(path: string): LiveryFormat {
    const ext = getExtension(path);
    const dirname = getDirName(path);
    
    // MSFS package detection
    if (hasFile(dirname, 'manifest.json') && hasFile(dirname, 'layout.json')) {
      return { sim: 'MSFS2024', type: 'package', files: findDDSFiles(dirname) };
    }
    
    // PSD template (AMS2)
    if (ext === '.psd' && path.includes('AMS2')) {
      return { sim: 'AMS2', type: 'psd', files: [path] };
    }
    
    // TGA livery (LMU)
    if (ext === '.tga' && basename(path).includes('customskin')) {
      return { sim: 'LMU', type: 'tga', files: [path, findRegionFile(path)] };
    }
    
    // DDS livery (ACC/AC/MSFS)
    if (ext === '.dds') {
      return { sim: detectSimFromPath(path), type: 'dds', files: [path] };
    }
    
    throw new Error('Unsupported format');
  }
}
```

### 2. Loader Abstraction Layer

```typescript
interface ImageData2D {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  format: 'RGBA' | 'RGB' | 'DXT1' | 'DXT5';
}

interface LiveryLayer {
  name: string;
  imageData: ImageData2D;
  blendMode?: string;
  visible: boolean;
}

interface LiveryDocument {
  format: LiveryFormat;
  mainTexture: ImageData2D;
  layers: LiveryLayer[];
  metadata: {
    resolution: [number, number];
    colorSpace: string;
    compressed: boolean;
  };
}

abstract class LiveryLoader {
  abstract load(files: string[]): Promise<LiveryDocument>;
  abstract save(doc: LiveryDocument, outputPath: string): Promise<void>;
}
```

### 3. Format-Specific Loaders

```typescript
// PSD Loader (AMS2)
class PSDLoader extends LiveryLoader {
  async load(files: string[]): Promise<LiveryDocument> {
    const psd = Psd.parse(await readFile(files[0]));
    const wireframe = extractLayer(psd, /wireframe/i);
    const ao = extractLayer(psd, /ambient|ao/i);
    
    return {
      format: { sim: 'AMS2', type: 'psd', files },
      mainTexture: psd.composite(),
      layers: [
        { name: 'Wireframe', imageData: wireframe, blendMode: 'overlay', visible: true },
        { name: 'AO', imageData: ao, blendMode: 'multiply', visible: true },
      ],
      metadata: { resolution: [psd.width, psd.height], colorSpace: 'RGB', compressed: false }
    };
  }
}

// TGA Loader (LMU)
class TGALoader extends LiveryLoader {
  async load(files: string[]): Promise<LiveryDocument> {
    const tga = new TGA();
    tga.load(await readFile(files[0]));
    
    const regionFile = files.find(f => f.includes('_region'));
    let regionLayer = null;
    if (regionFile) {
      const regionTga = new TGA();
      regionTga.load(await readFile(regionFile));
      regionLayer = { name: 'Region', imageData: regionTga.getImageData(), blendMode: 'normal', visible: true };
    }
    
    return {
      format: { sim: 'LMU', type: 'tga', files },
      mainTexture: tga.getImageData(),
      layers: regionLayer ? [regionLayer] : [],
      metadata: { resolution: [tga.width, tga.height], colorSpace: 'RGB', compressed: tga.isRLE }
    };
  }
}

// DDS Loader (MSFS/ACC/AC)
class DDSLoader extends LiveryLoader {
  async load(files: string[]): Promise<LiveryDocument> {
    const dds = parseDDS(await readFile(files[0]));
    
    // Decompress DXT to RGBA
    const imageData = dds.format.startsWith('DXT') 
      ? decompressDXT(dds) 
      : dds.data;
    
    return {
      format: { sim: detectSimFromPath(files[0]), type: 'dds', files },
      mainTexture: imageData,
      layers: [],
      metadata: { 
        resolution: [dds.width, dds.height], 
        colorSpace: 'RGB', 
        compressed: dds.format.includes('DXT')
      }
    };
  }
}

// MSFS Package Loader
class MSFSPackageLoader extends LiveryLoader {
  async load(files: string[]): Promise<LiveryDocument> {
    const manifest = JSON.parse(await readFile(findFile(files, 'manifest.json')));
    const layout = JSON.parse(await readFile(findFile(files, 'layout.json')));
    
    // Find main albedo texture
    const albedoFile = files.find(f => f.includes('ALBD') && f.includes('AIRFRAME'));
    const dds = parseDDS(await readFile(albedoFile));
    
    // Load related textures as layers
    const normalFile = albedoFile.replace('ALBD', 'NORM');
    const compFile = albedoFile.replace('ALBD', 'COMP');
    
    const layers = [];
    if (normalFile) layers.push({ name: 'Normal Map', imageData: parseDDS(await readFile(normalFile)), blendMode: 'normal', visible: false });
    if (compFile) layers.push({ name: 'Composite', imageData: parseDDS(await readFile(compFile)), blendMode: 'normal', visible: false });
    
    return {
      format: { sim: 'MSFS2024', type: 'package', files, metadata: { manifest, layout } },
      mainTexture: decompressDXT(dds),
      layers,
      metadata: { resolution: [dds.width, dds.height], colorSpace: 'RGB', compressed: true }
    };
  }
}
```

### 4. Unified Canvas Renderer

```typescript
class UnifiedLiveryCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private document: LiveryDocument;
  
  constructor(doc: LiveryDocument) {
    this.document = doc;
    this.canvas = createCanvas(doc.metadata.resolution);
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw main texture
    this.ctx.putImageData(this.document.mainTexture, 0, 0);
    
    // Draw layers with blend modes
    for (const layer of this.document.layers) {
      if (!layer.visible) continue;
      
      this.ctx.globalCompositeOperation = layer.blendMode || 'normal';
      this.ctx.putImageData(layer.imageData, 0, 0);
    }
    
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  export(format: 'png' | 'tga' | 'dds'): Blob {
    switch (format) {
      case 'png':
        return this.canvas.toBlob({ type: 'image/png' });
      case 'tga':
        return encodeTGA(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
      case 'dds':
        return encodeDDS(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), 'DXT5');
    }
  }
}
```

### 5. Loader Registry

```typescript
class LiveryLoaderRegistry {
  private static loaders = new Map<string, LiveryLoader>([
    ['psd', new PSDLoader()],
    ['tga', new TGALoader()],
    ['dds', new DDSLoader()],
    ['package', new MSFSPackageLoader()],
  ]);
  
  static async load(path: string): Promise<LiveryDocument> {
    const format = FormatDetector.detect(path);
    const loader = this.loaders.get(format.type);
    
    if (!loader) {
      throw new Error(`No loader for format: ${format.type}`);
    }
    
    return await loader.load(format.files);
  }
}
```

## UI Component Architecture

### Unified File Picker

```typescript
function LiveryFilePicker({ onLoad }: { onLoad: (doc: LiveryDocument) => void }) {
  const handleFileSelect = async () => {
    const path = await openFileDialog({
      filters: [
        { name: 'All Livery Files', extensions: ['psd', 'tga', 'dds', 'png'] },
        { name: 'PSD Templates (AMS2)', extensions: ['psd'] },
        { name: 'TGA Liveries (LMU)', extensions: ['tga'] },
        { name: 'DDS Textures (MSFS/ACC)', extensions: ['dds'] },
        { name: 'Packages (MSFS)', extensions: [] }, // Directory picker
      ],
    });
    
    const doc = await LiveryLoaderRegistry.load(path);
    onLoad(doc);
  };
  
  return (
    <div className="livery-picker">
      <button onClick={handleFileSelect}>Open Livery</button>
      <div className="supported-formats">
        <span>Supports: AMS2 (PSD) • LMU (TGA) • MSFS (DDS) • ACC/AC (DDS)</span>
      </div>
    </div>
  );
}
```

### Format-Aware Editor

```typescript
function LiveryEditor({ document }: { document: LiveryDocument }) {
  return (
    <div className="livery-editor">
      {/* Format indicator */}
      <div className="format-badge">
        {document.format.sim} - {document.format.type.toUpperCase()}
      </div>
      
      {/* Canvas */}
      <UnifiedLiveryCanvas document={document} />
      
      {/* Format-specific controls */}
      {document.format.type === 'psd' && <PSDControls document={document} />}
      {document.format.type === 'tga' && <TGAControls document={document} />}
      {document.format.type === 'dds' && <DDSControls document={document} />}
      {document.format.type === 'package' && <MSFSControls document={document} />}
      
      {/* Common export */}
      <ExportControls document={document} />
    </div>
  );
}
```

## Required Libraries

### Already Integrated
- ✅ `@webtoon/psd` - PSD parsing (AMS2)
- ✅ `tga-js` - TGA parsing (LMU)

### To Add
- 📦 `dds-parser` or `utif` - DDS decoding (MSFS/ACC/AC)
  - Recommended: Custom DDS parser using existing UTEX.js from ams2-content-listing
- 📦 `dxt-js` - DXT1/DXT5 compression/decompression
  - Alternative: `gl-matrix` with WebGL decompression

### Optional
- 📦 `sharp` (Node.js only) - High-performance image processing
- 📦 `pngjs` - PNG encoding/decoding
- 📦 `image-js` - Browser-based image manipulation

## Implementation Phases

### Phase 1: Core Abstraction (Current)
- ✅ PSD loader (AMS2)
- ✅ TGA loader (LMU)
- ⚠️ Basic DDS support (read-only)
- ⚠️ Unified document model

### Phase 2: DDS Support
- 🔄 Implement DDS parser (UTEX.js integration)
- 🔄 DXT1/DXT5 decompression
- 🔄 DDS encoder for export
- 🔄 MSFS package structure handling

### Phase 3: Advanced Features
- ⚠️ Layer management system
- ⚠️ Drawing tools (brush, shapes, text)
- ⚠️ Multi-file editing (region textures, decals)
- ⚠️ Template library browser

### Phase 4: Export Pipeline
- ⚠️ Format-specific export (TGA for LMU, DDS for MSFS)
- ⚠️ DXT compression with quality settings
- ⚠️ Mipmap generation
- ⚠️ Package repackaging (MSFS)

## Directory Structure Proposal

```
poc-psd-livery-editor/
├── src/
│   ├── loaders/
│   │   ├── base/
│   │   │   ├── LiveryLoader.ts        # Abstract base class
│   │   │   ├── LiveryDocument.ts      # Document interface
│   │   │   └── FormatDetector.ts      # Auto-detection
│   │   ├── PSDLoader.ts               # AMS2 PSD templates
│   │   ├── TGALoader.ts               # LMU TGA liveries
│   │   ├── DDSLoader.ts               # Generic DDS
│   │   ├── MSFSPackageLoader.ts       # MSFS 2024 packages
│   │   └── LiveryLoaderRegistry.ts    # Registry/factory
│   ├── parsers/
│   │   ├── dds/
│   │   │   ├── DDSParser.ts           # DDS header parsing
│   │   │   ├── DXTDecompressor.ts     # DXT1/5 decompression
│   │   │   └── DDSEncoder.ts          # DDS writing
│   │   └── utex/
│   │       └── UTEXDecoder.ts         # Port from ams2-content-listing
│   ├── renderers/
│   │   ├── UnifiedCanvas.tsx          # Generic canvas renderer
│   │   ├── LayerCompositor.ts         # Blend mode compositor
│   │   └── ExportPipeline.ts          # Multi-format export
│   ├── components/
│   │   ├── LiveryFilePicker.tsx       # Unified file picker
│   │   ├── LiveryEditor.tsx           # Main editor
│   │   ├── controls/
│   │   │   ├── PSDControls.tsx        # AMS2-specific
│   │   │   ├── TGAControls.tsx        # LMU-specific
│   │   │   ├── DDSControls.tsx        # Generic DDS
│   │   │   └── MSFSControls.tsx       # MSFS package
│   │   └── ExportControls.tsx         # Format selection
│   └── App.tsx
└── package.json
```

## Testing Strategy

### Unit Tests
- Format detection for each sim
- Loader for each format type
- DXT compression/decompression
- Export to each format

### Integration Tests
- Load AMS2 PSD → Edit → Export DDS
- Load LMU TGA → Edit → Export TGA
- Load MSFS DDS → Edit → Repackage
- Cross-format: Load PSD → Export as TGA/DDS

### Test Data
```
test-data/
├── AMS2/
│   └── BMW_M4_GT3_template.psd
├── LMU/
│   └── customskin.tga
├── MSFS2024/
│   └── A330_livery_package/
├── ACC/
│   └── car_skin.dds (pending download)
└── AC/
    └── car_skin.dds (pending download)
```

## Performance Considerations

### Memory Management
- **Problem**: 8K PSD = 500+ MB in memory
- **Solution**: Stream processing, progressive loading, web workers

### Large File Handling
- **Problem**: MSFS packages = 50+ DDS files (500+ MB total)
- **Solution**: Lazy loading, only decode needed textures, LRU cache

### DXT Decompression
- **Problem**: Software decompression is slow
- **Solution**: WebGL acceleration, worker threads, WASM modules

## Next Steps

1. **Download ACC/AC Templates** from Google Drive
   - Analyze structure
   - Document format details
   - Add to format detection

2. **Implement DDS Parser**
   - Port UTEX.js from ams2-content-listing
   - Add DXT decompression
   - Test with MSFS templates

3. **Create Unified Document Model**
   - Define `LiveryDocument` interface
   - Implement `LiveryLoader` abstract class
   - Build `LoaderRegistry`

4. **Update POC UI**
   - Replace dual loaders (PSD/TGA) with unified picker
   - Add format badge/indicator
   - Implement format-specific controls

5. **Test End-to-End**
   - Load each format
   - Verify rendering
   - Test export to native format

## Conclusion

This unified pipeline provides:
- ✅ **Single Interface** for all sim formats
- ✅ **Format Abstraction** hides implementation details
- ✅ **Extensible Architecture** easy to add new sims
- ✅ **Consistent UX** regardless of source format
- ✅ **Multi-Format Export** output to any supported format

**Key Principle**: User shouldn't care about format - they just want to edit liveries.
