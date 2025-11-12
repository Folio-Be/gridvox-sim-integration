# AC (Assetto Corsa) Livery Format Analysis

## Overview

Assetto Corsa uses a **hybrid DDS + PNG livery system** with multiple texture files for different car components and a simple JSON configuration.

## Package Structure

```
livery_package/
├── livery.png                    # Main livery preview (2K-4K PNG)
├── ui_skin.json                  # Skin metadata (name, driver, team)
├── preview.jpg                   # UI preview image
├── preview_original.jpg          # Original preview
├── [car]_body_dif.dds           # Body diffuse texture (DDS)
├── [car]_body_map.dds           # Body material map (DDS)
├── [car]_tireside.dds           # Tire side texture
├── [car]_tireside_blur.dds      # Tire side blur
├── [car]_tireside_n.dds         # Tire side normal map
├── [car]_tireside_n_blur.dds    # Tire side normal blur
├── [car]_tiretread.dds          # Tire tread texture
├── [car]_tiretread_n.dds        # Tire tread normal map
├── [car]_windows.dds            # Window texture
└── ... (additional component DDS files)
```

## Extracted Templates

### 1. Blancpain Sprint 2015 - Team WRT (Audi R8 GT3)
**Location**: `BlancpainSprint2015_1_2_3_4_TeamWRT_by_erg_v.1.0/`

**Liveries**: 4 skins (Team_WRT_2015_1 through Team_WRT_2015_4)

**Files per skin**:
- `livery.png` - Main preview
- `ui_skin.json` - Metadata
- `preview.jpg`, `preview_original.jpg`
- `r8_gts_body_dif.dds` - Body diffuse
- `r8_gts_body_map.dds` - Body material map
- `r8_gts_tireside.dds` + blur + normals
- `r8_gts_tiretread.dds` + normals
- `r8_gts_windows.dds`

**Total**: ~12 files per livery

### 2. F1 2021 Community Skinpack
**Location**: `F1 2021 Community Skinpack 1,14/content/`

**Structure**:
```
content/
├── cars/
│   └── rss_formula_hybrid_2021/
│       ├── extension/
│       │   ├── C1.dds, C1_Blur.dds (Tire compounds)
│       │   ├── C2.dds, C2_Blur.dds
│       │   ├── C3.dds, C3_Blur.dds
│       │   ├── C4.dds, C4_Blur.dds
│       │   └── C5.dds, C5_Blur.dds
│       └── skins/
│           ├── a_33_Red_Bull_Racing/
│           ├── b_11_Red_Bull_Racing/
│           ├── c_44_Mercedes-AMG/
│           ├── ... (20 F1 team skins)
│           └── t_47_Uralkali_Haas/
├── texture/
│   ├── crew_brand/ (Team branding)
│   ├── crew_gloves/ (Driver gloves per team)
│   ├── crew_helmet/ (Crew helmets per team)
│   └── crew_suit/ (Driver suits per team)
└── driver/ (likely driver-specific assets)
```

**Files per F1 skin**: ~30+ DDS files including:
- Body textures (multiple panels)
- Wheel textures
- Wing textures
- Halo textures
- Driver suit/helmet/gloves (separate DDS files)

### 3. Toyota Supra Tuned - Hankook
**Location**: `KS_Toyota_Supra_Tuned_Hankook_245/Hankook_245/`

**Files**:
- `livery.png` - Preview
- `ui_skin.json` - Metadata
- `preview.jpg`, `preview_original.jpg`
- `exterior_drift2_body_diffuse.dds` - Main body texture
- `exterior_drift2_body_carbon_diffuse.dds` - Carbon fiber
- `exterior_drift2_body_map.dds` - Material map
- `exterior_drift1_rim_diff.dds` + blur
- `exterior_tyre_diff.dds` + blur + normals
- `exterior_caliper_diff.dds`
- `Plate_D.dds`, `Plate_NM.dds` (License plate)
- `metal_detail.dds`

**Total**: ~17 files

## File Format Details

### livery.png
**Purpose**: Main livery preview image  
**Format**: PNG with alpha channel  
**Resolution**: Typically 2048x2048 or 4096x4096  
**Color**: 24-bit RGB or 32-bit RGBA  
**Size**: 20-100 KB (PNG compressed)  
**Usage**: UI preview, quick reference for livery design

### ui_skin.json
Simple metadata file:

```json
{
    "skinname": "Team WRT 2015 1",
    "drivername": "Robin Frijns Laurens Vanthoor",
    "country": "Belgium",
    "team": "Team WRT",
    "number": 1
}
```

### DDS Texture Files
**Purpose**: Game-ready textures for car components  
**Format**: DXT1/DXT5 compressed DDS  
**Resolution**: Variable (512x512 to 4096x4096 depending on component)  
**Types**:
- `*_dif.dds` or `*_diffuse.dds`: Diffuse/color map
- `*_map.dds`: Material/specular map (roughness, metallic, AO)
- `*_n.dds` or `*_NM.dds`: Normal map (surface detail)
- `*_blur.dds`: Motion blur textures (for spinning wheels)

## Format Comparison

| Aspect | AC (PNG + DDS) | ACC (PNG) | AMS2 (PSD) | LMU (TGA) | MSFS (DDS) |
|--------|----------------|-----------|------------|-----------|------------|
| **Primary Format** | PNG preview + DDS game | PNG only | PSD layers | TGA RGB | DDS component |
| **Resolution** | 2K-4K PNG, variable DDS | 4K PNG | 4K-8K PSD | 4K TGA | 4K-8K DDS |
| **File Count** | 12-30+ files | 2-3 files | 1 file | 2 files | 50-70 files |
| **Total Size** | ~10-50 MB | ~6 MB | 23-78 MB | 2-48 MB | 500+ MB |
| **Editability** | PNG preview only | Direct PNG edit | Layer-based | Direct pixel | Component-based |
| **Material Info** | Separate DDS maps | JSON file | In PSD | None | Multiple maps |
| **Complexity** | ⭐⭐⭐ HIGH | ⭐ LOW | ⭐⭐ MEDIUM | ⭐⭐ MEDIUM | ⭐⭐⭐⭐ VERY HIGH |

## AC Workflow

### Current (Manual)
1. Edit `livery.png` in Photoshop/GIMP for preview
2. Edit DDS files (requires DDS plugin or tool like GIMP/Photoshop)
3. Save DDS files with correct compression (DXT1/DXT5)
4. Update `ui_skin.json` with livery name/driver
5. Place in AC skins folder

### Challenges
- **Multiple DDS files**: Each component needs separate texture
- **DDS editing**: Requires special tools/plugins
- **UV mapping knowledge**: Need to know which texture goes where
- **Normal maps**: Advanced users only
- **Material maps**: Complex PBR workflow

### Proposed (SimVox Pipeline)
1. **Load Package**: Detect AC structure (livery.png + multiple DDS + ui_skin.json)
2. **Load PNG**: Use `livery.png` as editable preview
3. **Edit**: Drawing tools on PNG canvas
4. **Generate DDS**: Convert edited PNG to required DDS files (auto-UV mapping)
5. **Export**: Package with updated livery.png + generated DDS files

## Integration with Unified Pipeline

### Format Detection
```typescript
// Detect AC livery package
if (hasFile(dir, 'livery.png') && 
    hasFile(dir, 'ui_skin.json') &&
    hasDDSFiles(dir)) {
  return { sim: 'AC', type: 'png-dds-hybrid' };
}
```

### Editable Texture Priority
For SimVox livery builder:
1. **Primary**: `livery.png` (easy to edit, browser-native)
2. **Secondary**: Body DDS files (`*_body_dif.dds`) if PNG unavailable
3. **Generate**: Create other DDS files from edited PNG

### Advantages
- **PNG preview available**: Native browser support for editing
- **Simpler than full DDS**: Can edit livery.png without DDS knowledge
- **Backward compatible**: Can generate DDS files for game use

## Implementation Priority

### Phase 1: PNG Preview Editor (EASY - 1 day)
- [x] Templates downloaded (3 packages, ~30 MB)
- [ ] Load `livery.png` for editing
- [ ] Use native `Image()` API (browser support)
- [ ] Edit with drawing tools
- [ ] Export as PNG

**Complexity**: ⭐ LOW - PNG is browser-native

### Phase 2: DDS Body Texture (MEDIUM - 2-3 days)
- [ ] Implement DDS parser (UTEX.js port or utif library)
- [ ] Load `*_body_dif.dds` as fallback if no livery.png
- [ ] Display DDS texture on canvas
- [ ] Export edited PNG → DDS conversion

**Complexity**: ⭐⭐⭐ HIGH - DDS parsing complex

### Phase 3: Multi-Component System (ADVANCED - 5+ days)
- [ ] Detect all component DDS files (tires, windows, etc.)
- [ ] UV mapping system for component textures
- [ ] Edit individual components
- [ ] Generate complete livery package

**Complexity**: ⭐⭐⭐⭐ VERY HIGH - Requires 3D UV knowledge

## Recommendations

### For Livery Builder POC
**Use `livery.png` ONLY**:
- ✅ Browser-native PNG support (like ACC)
- ✅ Simple to implement (1 day)
- ✅ Users can edit without DDS knowledge
- ✅ Can generate DDS later (post-POC)

**Skip DDS editing initially**:
- DDS is game-optimized format (not user-friendly)
- Complex DXT compression
- Requires UV mapping knowledge
- Better to export PNG → let AC convert to DDS

### Implementation Order
1. **PNG Loader** (AC livery.png) - Same as ACC implementation
2. **JSON Parser** (ui_skin.json) - Display livery name/driver
3. **DDS Parser** (Later) - Only if needed for advanced users
4. **Multi-component** (Future) - Requires 3D UV system

## Next Steps

1. **Reuse ACC PNG Loader**: AC `livery.png` format identical to ACC
2. **Add JSON Display**: Parse `ui_skin.json`, show livery metadata
3. **Test with Team WRT**: Load `Team_WRT_2015_1/livery.png`
4. **Defer DDS Support**: Phase 2 feature (after POC)

---

## Template Summary

**Downloaded**: 3 AC livery packages  
**Total Files**: 29 PNG files  
**Total Size**: ~30 MB (including DDS)  
**Format**: PNG preview + DDS game textures + JSON metadata  
**Status**: ✅ Ready for PNG implementation  
**Complexity**: ⭐ LOW (PNG only) or ⭐⭐⭐ HIGH (full DDS)  

**Recommended Approach**: Use `livery.png` only (browser-native, same as ACC).

**Next Action**: Test ACC PNGLoader with AC `livery.png` files (should work immediately).
