# MSFS 2024 Livery Format Analysis

## Overview

Microsoft Flight Simulator 2024 uses a **package-based structure** with DDS textures organized in a specific directory hierarchy.

## Package Structure

```
livery_package/
├── manifest.json           # Package metadata
├── layout.json            # File listing with content info
├── ContentInfo/           # Package info (optional)
│   └── Thumbnail/
└── SimObjects/
    └── Airplanes/
        └── aircraft_model_variant/
            └── texture.livery_name/
                ├── [50-70+ DDS files]
                └── thumbnail.jpg
```

## Manifest.json Format

```json
{
  "dependencies": [],
  "content_type": "AIRCRAFT",
  "title": "Airbus A330-900 NEO Lufthansa",
  "manufacturer": "Airbus",
  "creator": "Headwind, aaMasih",
  "package_version": "0.1.3",
  "minimum_game_version": "1.19.9",
  "release_notes": {
    "neutral": {
      "LastUpdate": "",
      "OlderHistory": ""
    }
  }
}
```

## Texture Files

### File Naming Convention

```
[COMPONENT]_[TYPE].[SOURCE_EXT].DDS

Examples:
- A339_AIRFRAME_BOTTOM_ALBD.PNG.DDS  # Albedo (color) map
- A339_AIRFRAME_BOTTOM_NORM.PNG.DDS  # Normal map (surface detail)
- A339_AIRFRAME_BOTTOM_COMP.PNG.DDS  # Composite/roughness/metallic
- A320NEO_COCKPIT_DECALSALPHA_ALBD.PNG.DDS  # Decals with alpha
```

### Texture Types

| Suffix | Purpose | Typical Size | Description |
|--------|---------|--------------|-------------|
| `_ALBD` | Albedo/Diffuse | 21.33 MB | Base color map |
| `_NORM` | Normal Map | 21.33 MB | Surface detail/bumps |
| `_COMP` | Composite | 10.67 MB | Roughness/metallic/AO combined |
| `_DECALS` | Decal Layer | 5.33 MB | Airline logos, markings |
| `_ALPHA` | Alpha/Transparency | Variable | Opacity masks |

### Components

From Lufthansa A330-900 example:
- **AIRFRAME**: Main fuselage sections (top, bottom, sides)
- **COCKPIT**: Cockpit interior textures
- **WINGS**: Wing surfaces (upper, lower)
- **ENGINES**: Engine nacelles
- **LANDING_GEAR**: Gear bays and mechanisms
- **INTERIOR**: Cabin textures

## Sample Files (Lufthansa A330-900)

```
SimObjects/Airplanes/Headwind_A330neo_LUFTHANSAAAMA330NEO/texture.LUFTHANSAAAMA330NEO/
├── A339_AIRFRAME_BOTTOM_ALBD.PNG.DDS       (21.33 MB) ← Main livery
├── A339_AIRFRAME_BOTTOM_COMP.PNG.DDS       (10.67 MB)
├── A339_AIRFRAME_BOTTOM_NORM.PNG.DDS       (21.33 MB)
├── A339_AIRFRAME_DECALS_ALBD.PNG.DDS       (5.33 MB)  ← Logos/text
├── A339_AIRFRAME_TOP_ALBD.PNG.DDS          (21.33 MB)
├── A339_WINGS_UPPER_ALBD.PNG.DDS           (10.67 MB)
├── A320NEO_COCKPIT_DECALSALPHA_ALBD.PNG.dds (5.33 MB)
└── [60+ more DDS files]

Total: ~500 MB per livery package
```

## DDS Format Specifics

### Compression
- **DXT1**: RGB, no alpha (smaller, ~5-10 MB)
- **DXT5**: RGBA, with alpha (larger, ~20+ MB)

### Mipmaps
Most MSFS DDS files include mipmaps for LOD (Level of Detail) optimization.

### Resolution
- **Main textures**: 4096x4096 (4K) to 8192x8192 (8K)
- **Detail textures**: 2048x2048 (2K)
- **Decals**: 2048x2048 or smaller

## Livery Editing Workflow

### Current (Manual)
1. Extract package
2. Find albedo DDS files (`*_ALBD.PNG.DDS`)
3. Decompress DDS → PNG/TGA
4. Edit in Photoshop/GIMP
5. Recompress to DDS with DXT5
6. Replace in package
7. Repackage with layout.json

### Proposed (SimVox Pipeline)
1. **Load Package**: Auto-detect MSFS structure
2. **Select Texture**: Choose component (AIRFRAME, WINGS, etc.)
3. **Decompress DDS**: Extract to ImageData for canvas
4. **Edit**: Use drawing tools on canvas
5. **Preview**: Real-time update with normal/comp maps
6. **Export**: Recompress to DDS with same settings
7. **Repackage**: Auto-update layout.json and rebuild

## Integration with Unified Pipeline

### Format Detection
```typescript
// Detect MSFS package
if (hasFile(dir, 'manifest.json') && 
    hasFile(dir, 'layout.json') &&
    hasDir(dir, 'SimObjects/Airplanes')) {
  return { sim: 'MSFS2024', type: 'package' };
}
```

### Main Texture Identification
Priority order for loading:
1. `AIRFRAME_BOTTOM_ALBD` (primary livery surface)
2. `AIRFRAME_TOP_ALBD` (secondary)
3. `AIRFRAME_DECALS_ALBD` (logos layer)

### Related Textures
- Load NORM as reference layer (view-only)
- Load COMP for material preview
- Load DECALS as editable overlay

## Challenges

### File Size
- **Problem**: 50-70 DDS files × 5-21 MB = 500+ MB total
- **Solution**: Lazy loading, only decompress selected textures

### DXT Compression
- **Problem**: Software DXT compression is slow
- **Solution**: WebGL acceleration or WASM module (squish, crunch)

### Package Integrity
- **Problem**: layout.json must match file hashes/sizes
- **Solution**: Auto-regenerate layout.json on export

### Multiple Components
- **Problem**: Single livery = many textures (fuselage, wings, tail)
- **Solution**: Component selector UI, edit one at a time

## Comparison with Other Formats

| Aspect | MSFS (DDS Package) | AMS2 (PSD) | LMU (TGA) |
|--------|-------------------|-----------|-----------|
| **Files per Livery** | 50-70 | 1-4 | 2 |
| **Total Size** | 500+ MB | 23-78 MB | 2-48 MB |
| **Editability** | Component-based | Layer-based | Direct pixel |
| **Complexity** | High (package) | Medium (layers) | Low (single file) |
| **Export** | Repackage required | Single DDS | Single TGA/DDS |

## Template Sources

### Downloaded
- ✅ Lufthansa A330-900 Neo by aaMasih (~500 MB)
- ✅ Pitts S2-S Pimped by ensiferrum (~200 MB)

### Recommended Sources
- **flightsim.to** - Community livery repository
- **MSFS Marketplace** - Official add-ons
- **Aircraft developer sites** - Headwind, FlyByWire, etc.

## Next Steps for Implementation

1. **DDS Parser**
   - Port UTEX.js from ams2-content-listing
   - Add DXT1/DXT5 decompression
   - Test with MSFS samples

2. **Package Parser**
   - Read manifest.json + layout.json
   - List all texture files
   - Build component tree (AIRFRAME → BOTTOM → ALBD/NORM/COMP)

3. **Component Selector UI**
   - Tree view of aircraft parts
   - Preview thumbnails
   - "Edit" button per component

4. **DDS Exporter**
   - Compress to DXT5 (or preserve original format)
   - Generate mipmaps
   - Update layout.json with new hash/size

5. **Repackaging**
   - Rebuild directory structure
   - Validate manifest/layout
   - Create installable package

## Conclusion

MSFS 2024 liveries are the most complex format:
- ✅ **Professional Quality**: 4K-8K textures with PBR materials
- ⚠️ **High Complexity**: 50+ files, 500+ MB, package structure
- ⚠️ **Advanced Pipeline**: Requires DDS compression, package management

**Recommended Approach**: Start with simple single-texture editing (AIRFRAME_BOTTOM_ALBD), expand to multi-component later.

**Priority**: Implement DDS parser first, then extend to package handling.
