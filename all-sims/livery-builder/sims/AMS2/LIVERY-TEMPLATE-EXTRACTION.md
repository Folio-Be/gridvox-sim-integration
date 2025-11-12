# AMS2 Livery Template Extraction - UV Maps

## Discovery

The `ams2-car-image-extractor` project **already documented** that individual `*_Livery.bff` files contain UV-mapped textures:

> "The extracted files were UV-mapped texture sheets, NOT usable car preview images."
> 
> Example: Extracted `alpine_a424_36v2.dds` from `Alpine_A424_Livery.bff`
> 
> Result: "Flat unwrapped texture showing car body panels laid out for 3D mapping"

**For preview thumbnails**: This was the wrong approach ❌  
**For livery templates**: This is EXACTLY what we need ✅

## Available Resources

**Location:** `C:\GAMES\Automobilista 2\Pakfiles\Vehicles\`  
**Files:** 360 `*_Livery.bff` archives  
**Format:** BFF compressed archives containing DDS texture files  
**Content:** UV-mapped livery textures (paintable templates)

### Sample Files Found
```
Alpine_A110_GT4_Evo_Livery.bff
Alpine_A424_Livery.bff
Alpine_A424_LD_Livery.bff
ARC_Camaro_Livery.bff
Aston_Martin_DBR9_GT1_Livery.bff
Aston_Martin_Valkyrie_LMH_Livery.bff
Aston_Martin_Vantage_GT3_Evo_Livery.bff
BMW_M_Hybrid_V8_Livery.bff
Porsche_963_GTP_Livery.bff
... (360 total)
```

## Extraction Process

We can reuse the existing `ams2-car-image-extractor` infrastructure:

### Prerequisites (Already Set Up)
- ✅ PCarsTools (`tools/PCarsTools/pcarstools_x64.exe`)
- ✅ Oodle DLL (`tools/PCarsTools/oo2core_4_win64.dll`)
- ✅ .NET 6.0 Runtime
- ✅ Node.js environment with Sharp, UTEX.js DDS decoder

### Extraction Command Pattern

Using the existing `pcars-tools-wrapper.ts`:

```bash
cd C:\DATA\SimVox\simvox-sim-integration\ams2\ams2-car-image-extractor

# Extract a single vehicle's livery BFF
node -e "
const { extractBFF } = require('./dist/pcars-tools-wrapper');
extractBFF(
  'C:\\GAMES\\Automobilista 2\\Pakfiles\\Vehicles\\Alpine_A424_Livery.bff',
  './output/livery-templates/alpine_a424',
  'C:\\GAMES\\Automobilista 2'
);
"
```

### Expected Output Structure

```
output/livery-templates/
└── alpine_a424/
    ├── alpine_a424_36v2.dds          # Main livery UV map (4096×4096 or similar)
    ├── alpine_a424_ao.dds            # Ambient occlusion map
    ├── alpine_a424_specular.dds      # Specular/gloss map
    └── ... (additional texture layers)
```

## Recommended Vehicles for Template Collection

Select 5 representative vehicles across different classes:

1. **Alpine A424** (LMDh/Hypercar) - `Alpine_A424_Livery.bff`
2. **Porsche 963** (GTP) - `Porsche_963_GTP_Livery.bff`
3. **BMW M4 GT3** (GT3) - `BMW_M4_GT3_Livery.bff`
4. **Stock Car Cruze 2024** (Touring Car) - `Stock_Cruze_24_Livery.bff`
5. **Formula Ultimate 2024** (Open Wheel) - `Formula_Ultimate_2024_Livery.bff`

## Next Steps

### Option A: Manual Extraction (Quick Test)
1. Pick 1-2 sample vehicles
2. Run PCarsTools extraction manually
3. Inspect DDS files to verify UV layout
4. Convert to PNG for easier viewing
5. Document texture naming conventions

### Option B: Automated Script
1. Create `extract-livery-templates.ts` based on existing extractor
2. Modify to target `Pakfiles/Vehicles/*_Livery.bff`
3. Extract to `output/livery-templates/{vehicle_id}/`
4. Convert DDS → PNG for web compatibility
5. Generate manifest with texture layer metadata

### Option C: Use Community Templates
If UV maps require significant cleanup/wireframing:
- Download official Reiza template pack (PSDs with guides)
- Use extracted DDSfiles for reference/verification only

## Comparison: Extracted vs Community Templates

| Feature | Extracted DDS | Community PSD Templates |
|---------|---------------|-------------------------|
| UV Layout | ✅ Raw game files | ✅ Same layout |
| Wireframe Guides | ❌ Not included | ✅ Layer overlays |
| AO Baked In | ✅ Separate file | ✅ Separate layer |
| Decal Zones | ❌ Not marked | ✅ Labeled regions |
| Sponsor Guides | ❌ Manual work | ✅ Pre-defined areas |
| Ready to Use | ⚠️ Needs setup | ✅ Immediate |

**Recommendation:** Extract a sample set to understand the format, but use official community templates for production livery builder features.
