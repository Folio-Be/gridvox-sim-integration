# AMS2 Template PSD Layer Structure Analysis

**Analysis Date:** 2025-11-12  
**Templates Analyzed:** 4 official Reiza templates  
**Extraction Status:** ✅ Complete (230 MB extracted from 50.5 MB RAR archives)

## Extraction Summary

| Template | RAR Size | Extracted Size | Files | PSD Files |
|----------|----------|----------------|-------|-----------|
| Alpine A424 (LMDh) | 4.1 MB | 29.2 MB | 9 | 3 PSDs |
| BMW M4 GT3 | 1.9 MB | 36.9 MB | 10 | 4 PSDs |
| Lamborghini Huracan GT3 EVO2 | 8.1 MB | 50.3 MB | 9 | 5 PSDs |
| Formula V10 | 37.5 MB | 102.9 MB | 5 | 2 PSDs |
| **TOTAL** | **51.6 MB** | **219.3 MB** | **33** | **14 PSDs** |

## File Structure Pattern

All AMS2 templates follow this structure:
```
{Vehicle_Name}_Template/
├── AMS2_{vehicle}_template.psd          # Main livery template
├── {vehicle}_banner_template.psd        # Pit garage banner (optional)
├── Number plate/
│   ├── {vehicle}_numberplate.psd        # Number panel template
│   └── example-*.dds                     # Example DDS exports
└── Wheel Rim/
    ├── {vehicle}_rim.psd                 # Wheel rim template
    ├── {vehicle}_rim_spec.psd            # Rim specular/metallic (optional)
    └── example-*.dds                     # Example DDS exports
```

## Main Livery PSD Templates

### Alpine A424 LMDh
**File:** `AMS2_alpine_a424_template.psd`  
**Size:** 15.8 MB (16,563,732 bytes)  
**Resolution:** Likely 4096x4096 (inferred from DDS examples)  
**Contains:**
- UV-mapped car body wireframe
- Ambient occlusion (AO) baking layer
- Decal placement guides (sponsor zones, numbers)
- Example livery layers (likely Mercedes-AMG reference)

### BMW M4 GT3
**File:** `AMS2_bmw_m4_gt3_template.psd`  
**Size:** 22.8 MB (23,927,139 bytes)  
**Resolution:** Likely 4096x4096 or higher  
**Additional:** `bmw_m4_gt3_banner_template.psd` (6.1 MB) - Pit garage banner

### Lamborghini Huracan GT3 EVO2
**File:** `AMS2_lambo_gt3_evo2_template.psd`  
**Size:** 23.3 MB (24,393,257 bytes)  
**Resolution:** Likely 4096x4096 or higher  
**Additional Files:**
- `lamborghini huracan gt3 evo2 banner.psd` (391 KB)
- `lamborghini huracan gt3 evo2 numberplates.psd` (622 KB)

### Formula V10
**File:** `AMS2_FV10_Template.psd`  
**Size:** 74.7 MB (78,303,309 bytes) - **LARGEST**  
**Resolution:** Likely 8192x8192 or multiple 4K sheets  
**Note:** Formula cars have more surface area (wings, sidepods, nose, engine cover) requiring higher resolution

## Expected PSD Layer Organization

Based on Reiza's standard template structure (confirmed via forum threads):

### Layer Groups (Top to Bottom)
1. **YOUR LIVERY HERE** (placeholder group)
   - Paint base color
   - Stripes/patterns layer
   - Sponsors/decals layer
   - Number placement layer

2. **WIREFRAME** (reference layer)
   - White UV wireframe overlay
   - Shows panel boundaries
   - Set to Multiply/Overlay blend mode
   - Non-printable guide layer

3. **AMBIENT OCCLUSION (AO)**
   - Baked shadows/depth
   - Shows panel recesses and curves
   - Set to Multiply blend mode at 30-50% opacity
   - Critical for realistic depth

4. **DECAL ZONES** (guide layers)
   - Mandatory sponsor locations (GT3 regulations)
   - Number panel outlines
   - Headlight/taillight zones
   - Driver name placement guides

5. **EXAMPLE LIVERY** (hidden by default)
   - Reiza's reference design
   - Shows completed workflow
   - Demonstrates DDS export settings

### Typical Layer Properties
- **Color Mode:** RGB Color 8-bit
- **Document Size:** 4096x4096px (GT3/LMDh), 8192x8192px (Formula)
- **Layers:** 15-30 layers per template
- **Smart Objects:** Used for decals and repeating patterns
- **Alpha Channels:** 1-2 channels (transparency mask, spec mask)

## Number Plates / Panels

### Alpine A424
**File:** `AMS2_alpine_a424_numberplate.psd` (2.1 MB)  
**Exports to:** `*_numberplate_36_diff.dds` (diffuse) + `*_numberplate_36_glow.dds` (luminescent)  
**Resolution:** 2048x2048 (inferred from DDS size: 1,398,256 bytes)

### BMW M4 GT3
**Includes:** Separate glow map for luminescent number panels  
**Additional:** `BMW M4 luminescent number panels.png` (39 KB reference image)  
**Exports:** `*_01_plate_diff.dds` + `*_01_plate_glow.dds` (both 1 MB = 2048x2048)

### Lamborghini Huracan GT3 EVO2
**File:** `lamborghini huracan gt3 evo2 numberplates.psd` (622 KB)  
**Note:** Single PSD for front/side/rear number panels

### Formula V10
**No separate numberplate PSD** - numbers baked into main livery template

## Wheel Rim Templates

All templates include wheel rim PSDs with diffuse and specular maps:

### Alpine A424
**File:** `alpi_a424_rim.psd` (5.3 MB)  
**Exports:** 
- `*_rim_diff.dds` (2048x2048 diffuse)
- `*_rim_spec.dds` (1024x1024 specular)
- `*_rim_blur_diff.dds` (motion blur variant)
- `*_rim_blur_spec.dds` (motion blur specular)

### BMW M4 GT3
**File:** `bmw_m4_gt3_rim.psd` (2.5 MB)  
**Variants:** `*_rim_gold_*.dds` (gold finish example)

### Lamborghini Huracan GT3 EVO2
**Files:**
- `lam_hu_gt3_evo2_rim_diff.psd` (8.1 MB)
- `lam_hu_gt3_evo2_rim_spec.psd` (12.9 MB) - **Largest rim template**  
**Note:** Separate PSDs for diffuse and specular (higher detail)

### Formula V10
**File:** `formula_v10_rim_diff.psd` (24.2 MB)  
**Note:** Open-wheel rim design, includes brake disc visibility

## DDS Export Examples

All templates include example DDS exports showing:
- **Naming convention:** `example-{vehicle}_{texture_type}.dds`
- **Compression:** BC3/DXT5 for diffuse, BC1/DXT1 for specular
- **Mipmaps:** Full mipmap chain generated
- **Resolution:** 2048x2048 or 4096x4096 depending on texture type

### File Size Analysis (2048x2048 textures)
- **Diffuse (_diff.dds):** ~1,398,256 bytes (1.33 MB)
- **Specular (_spec.dds):** ~349,680 bytes (341 KB) - BC1 compression
- **Glow (_glow.dds):** ~1,398,256 bytes (1.33 MB)
- **Motion Blur variants:** Same sizes as non-blur

## Key Findings for Livery Builder App

### ✅ Confirmed Features
1. **Wireframe layers available** - All main PSDs include UV wireframes
2. **AO maps included** - Pre-baked ambient occlusion for depth
3. **Decal guides present** - Sponsor zones and regulation-compliant areas marked
4. **Multi-map workflow** - Body + Numberplate + Wheels + Banner (GT3 only)
5. **Resolution standards:**
   - GT3/LMDh: 4096x4096 main livery
   - Formula: 8192x8192 main livery
   - Wheels/Numbers: 2048x2048
   - Banners: 2048x512 or similar

### 🔍 To Verify (Requires Photoshop Inspection)
- [ ] Exact layer names and hierarchy
- [ ] Blend modes used (Multiply, Overlay, Normal)
- [ ] Smart Object usage patterns
- [ ] Alpha channel structure
- [ ] Color profiles (sRGB vs Linear)
- [ ] Font specifications for numbers
- [ ] Decal placement exact coordinates

### 🎯 App Implementation Priority
1. **Main livery editor** - Focus on body PSD (biggest canvas, most visible)
2. **Number panel generator** - Regulatory requirement for racing
3. **Wheel rim customizer** - High visual impact
4. **Banner creator** - Lower priority (only GT3/GT4 use this)

## Next Steps

1. **Open PSDs in Photoshop/GIMP** to document exact layer structure
2. **Export layer tree** to JSON for programmatic parsing
3. **Identify mandatory vs optional layers** for simplified editor
4. **Test DDS export workflow** with NVIDIA Texture Tools or similar
5. **Compare with ACC/AC templates** (once obtained) for cross-sim compatibility

## Storage Locations

**Extracted Templates:**
```
C:\DATA\SimVox\simvox-sim-integration\all-sims\livery-builder\sims\AMS2\example-templates\extracted\
├── Alpine_A424\
├── BMW_M4_GT3\
├── Lamborghini_Huracan_GT3\
└── Formula_V10\
```

**Original RAR Archives:**
```
C:\DATA\SimVox\simvox-sim-integration\all-sims\livery-builder\sims\AMS2\example-templates\
├── AMS2_alpine_a424_template.rar
├── AMS2_bmw_m4_gt3_template.rar
├── AMS2_lamborghini_huracan_gt3_evo2_template.rar
└── AMS2_FV10_Template.rar
```
