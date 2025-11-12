# SimVox Livery Editor POC

A proof-of-concept multi-format livery editor built with Tauri 2 + React + TypeScript.

## Overview

This POC demonstrates loading and rendering racing sim livery files from multiple formats with browser-based canvas editing capabilities. It follows the SimVox stack architecture used across all desktop POCs.

## Supported Formats

### PSD Templates (AMS2)
- **Format**: Adobe Photoshop Document (.psd)
- **Source**: Automobilista 2 official templates
- **Features**: Multi-layer templates with wireframe, ambient occlusion, and decal zones
- **Use Case**: Creating liveries from scratch with template guides

### TGA Liveries (LMU)
- **Format**: Targa Image (.tga)
- **Source**: Le Mans Ultimate community liveries
- **Features**: Flattened 4K textures ready for editing
- **Use Case**: Modifying existing liveries or using as reference

## Features

### PSD Support
- Load Adobe Photoshop PSD files via Tauri file dialog
- Automatic layer detection (wireframe, ambient occlusion)
- Canvas rendering with blend modes
- Customizable base color for livery foundation
- Layer toggles (show/hide wireframe and AO)
- Export as PNG

### TGA Support
- Load Targa TGA files (RLE compressed or uncompressed)
- Direct display of finished livery textures
- Zoom controls (25% - 200%)
- Export as PNG

## Technology Stack

- **Frontend**: React 19 + TypeScript 5.8.3 + Vite 7.0.4
- **Backend**: Tauri 2 (Rust)
- **PSD Parsing**: [@webtoon/psd](https://www.npmjs.com/package/@webtoon/psd) v0.4.0 (100KB, browser-native, WebAssembly-accelerated)
- **TGA Parsing**: [tga-js](https://www.npmjs.com/package/tga-js) (8KB, RLE support)
- **File System**: Tauri plugin-dialog + plugin-fs
- **Rendering**: Native HTML5 Canvas API

## Project Structure

```
poc-psd-livery-editor/
├── src/
│   ├── components/
│   │   ├── PSDLoader.tsx         # PSD file picker + parsing
│   │   ├── TGALoader.tsx         # TGA file picker + parsing
│   │   ├── LiveryCanvas.tsx      # PSD canvas editor with layers
│   │   └── UnifiedCanvas.tsx     # TGA canvas display with zoom
│   ├── App.tsx                   # Main application with format detection
│   └── App.css                   # Styling
├── src-tauri/
│   ├── src/lib.rs                # Rust backend (plugins initialized)
│   └── tauri.conf.json           # Tauri configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Rust 1.70+
- Windows (with Visual Studio Build Tools)

### Installation

```powershell
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Build production binary
npm run tauri build
```

## Testing with Templates

### AMS2 PSD Templates

1. Click "Load PSD Template"
2. Navigate to: `C:\DATA\SimVox\simvox-sim-integration\all-sims\livery-builder\sims\AMS2\example-templates\extracted\`
3. Select a template:
   - `BMW_M4_GT3/AMS2_bmw_m4_gt3_template.psd` (23.9 MB, 4096x4096)
   - `Alpine_A424/AMS2_alpine_a424_template.psd` (43.2 MB, 4096x4096)
   - `Lamborghini_Huracan_GT3_Evo2/AMS2_lamborghini_huracan_gt3_evo2_template.psd` (48.4 MB, 4096x4096)
   - `FV10/AMS2_FV10_Template.psd` (78.3 MB, 8192x8192)

### LMU TGA Liveries

1. Click "Load TGA Livery"
2. Navigate to: `C:\DATA\SimVox\simvox-sim-integration\all-sims\livery-builder\sims\LMU\example-templates\extracted\`
3. Select a livery:
   - `Aston_Martin_GT3_Toy_Story/Aston Martin GT3 Toy Story livery/customskin.tga` (2.17 MB, 4096x4096)
   - `BMW_M4_EVO_Drift_Brother/BMW M4 EVO Drift Brother livery/customskin.tga` (3.31 MB, 4096x4096)
   - `LIGIER_JS_P325_LMP3_Jordan_191/customskin.tga` (48.00 MB, 4096x4096, uncompressed)

## Current Capabilities

### PSD Template Workflow (AMS2)

**Layer Detection:**
- **Wireframe**: Layers containing "wireframe" (case-insensitive) → UV mapping guide
- **Ambient Occlusion**: Layers containing "ao" or "ambient" (case-insensitive) → Depth shading

**Rendering Pipeline:**
1. **Base Color**: Fill canvas with user-selected color (default: red)
2. **Ambient Occlusion**: Apply AO layer with `multiply` blend mode (creates depth)
3. **Wireframe**: Overlay wireframe with `overlay` blend mode (guides decal placement)

**Controls:**
- Base Color Picker: Change livery foundation color
- Show Wireframe: Toggle UV mapping guide visibility
- Show AO: Toggle ambient occlusion (depth shading)
- Export PNG: Save rendered livery as PNG image

### TGA Livery Workflow (LMU)

**Display:**
- Direct rendering of finished livery texture
- Full 4K resolution (4096x4096)
- No layer separation (flattened image)

**Controls:**
- Zoom In/Out: 25% - 200% scale
- Reset Zoom: Return to 100%
- Export PNG: Save as PNG image

## Limitations & Next Steps

### Current Limitations

**PSD:**
- No drawing tools (brush, shapes, text)
- No layer management beyond wireframe/AO
- No DDS export (PNG only)
- Single PSD file at a time
- No undo/redo

**TGA:**
- View-only mode (no editing yet)
- No layer separation (already flattened)
- No template guides
- Limited to zoom/export

### Planned Features

1. **Unified Drawing Tools** (works with both formats)
   - Brush tool with pressure sensitivity
   - Shape tools (rectangle, circle, polygon)
   - Text tool with custom fonts
   - Color picker and swatches
   - Eraser tool

2. **Advanced Layer Management**
   - Create new layers on top of base image
   - Layer visibility toggles
   - Layer blending modes
   - Layer ordering/reordering

3. **Export Options**
   - PNG (preview/sharing)
   - TGA (LMU native format)
   - DDS (game-ready with DXT1/DXT5 compression)
   - Mipmap generation for DDS

4. **Template Library**
   - Organize by sim (AMS2, LMU, ACC, etc.)
   - Thumbnail previews
   - Filter by car/class
   - Quick template switching
   - Favorite templates

## Technical Notes

### Why @webtoon/psd?

- **Browser-Native**: No Node.js canvas compilation required
- **Zero Dependencies**: Minimal bundle size (100KB)
- **WebAssembly**: Hardware-accelerated parsing
- **Active Maintenance**: Regular updates and bug fixes
- **Format Support**: PSD/PSB files up to 8K+ resolution

### Why tga-js?

- **Lightweight**: Only 8KB minified
- **RLE Support**: Handles compressed and uncompressed TGA files
- **ImageData Output**: Returns HTML5 ImageData directly
- **No Dependencies**: Pure JavaScript implementation
- **Format Support**: TGA 8/16/24/32-bit color depths

### Layer Blend Modes

- **multiply**: Darkens base color → Perfect for AO depth shading
- **overlay**: Combines multiply + screen → Preserves highlights/shadows for wireframe

### File Format Comparison

| Aspect | PSD (AMS2) | TGA (LMU) |
|--------|-----------|-----------|
| **Purpose** | Template for creation | Finished livery |
| **Layers** | Multi-layer with guides | Flattened single image |
| **Editability** | Full layer control | Direct pixel editing |
| **File Size** | 23-78 MB (with layers) | 2-48 MB (compression varies) |
| **Workflow** | Design → Layers → Export | Load → Modify → Export |
| **Best For** | Creating from scratch | Modifying existing designs |

### Performance Considerations

- **PSD Loading**: Large PSDs (8K Formula V10) may take 5-10 seconds to load
- **TGA Loading**: Fast loading even for 48 MB uncompressed files (< 1 second)
- **Canvas Rendering**: Real-time at 60 FPS for both formats
- **Export to PNG**: Near-instantaneous for both formats
- **Memory Usage**: 
  - PSD: ~500MB for 8K with multiple layers
  - TGA: ~200MB for 4K flattened image

## Related Documentation

- [`../sims/LMU/TGA-LIVERY-ANALYSIS.md`](../sims/LMU/TGA-LIVERY-ANALYSIS.md) - TGA format analysis and workflow
- [`../PSD-MANIPULATION-TECH-STACK.md`](../PSD-MANIPULATION-TECH-STACK.md) - Library comparison and workflow
- [`../POC-TAURI-IMPLEMENTATION.md`](../POC-TAURI-IMPLEMENTATION.md) - Implementation guide
- [`../sims/AMS2/PSD-LAYER-ANALYSIS.md`](../sims/AMS2/PSD-LAYER-ANALYSIS.md) - Template structure breakdown
- [`../sims/TEMPLATE-RESEARCH-SUMMARY.md`](../sims/TEMPLATE-RESEARCH-SUMMARY.md) - All simulator template sources

## License

Part of the SimVox project.
