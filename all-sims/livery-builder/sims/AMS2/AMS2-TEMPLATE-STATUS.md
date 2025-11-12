# AMS2 Livery Template Extraction - Status

## Current Situation

### What We Have
The existing `ams2-car-image-extractor` tool successfully extracts:
- ✅ **Preview/showcase images** from `GUIVEHICLEIMAGES.bff` (367 cars)
- ✅ 3D-rendered car images at 2048×768 resolution
- ✅ Cropped thumbnails at 512×128 for UI display
- ❌ **NOT livery templates** (these are showcase renders, not paintable UV maps)

### What We Need for Livery Builder
To create custom liveries, users need:
- UV-mapped texture templates (blank paintable surfaces)
- Wireframe overlays showing panel boundaries
- AO (Ambient Occlusion) layers for depth/shadows
- Decal placement guides
- Spec/gloss map templates

## AMS2 Template Storage Investigation

**NEW FINDING:** AMS2 DOES ship UV-mapped livery textures in individual BFF archives!

### Confirmed Locations
- ✅ `C:\GAMES\Automobilista 2\Pakfiles\Vehicles\{VehicleId}_Livery.bff` - **360 vehicle livery archives found**
- ✅ Each BFF contains UV-mapped DDS textures (the actual paintable templates)
- ✅ Extraction infrastructure already exists in `ams2-car-image-extractor` project
- ❌ `C:\GAMES\Automobilista 2\Vehicles\{car}\` - Only `.crd` files (car definition)
- ❌ `C:\GAMES\Automobilista 2\Vehicles\Textures\CustomLiveries\` - Only contains `Overrides\` folder for user liveries

### Archive Structure
Per the `ams2-car-image-extractor` research:
- Individual vehicle livery BFF archives (`{Vehicle}_Livery.bff`) **do** contain UV-mapped DDS textures
- These were tested and confirmed to be "flat unwrapped texture showing car body panels laid out for 3D mapping"
- However, these archives are **NOT present** in the current AMS2 installation structure
- Likely packed into larger archives or only accessible via modding tools

## Community Template Sources

Since AMS2 doesn't bundle editable templates, the official source is:

### Reiza Official Template Pack
**Source:** Reiza Studios Forum - Automobilista 2 Custom Livery Overview
**URL:** https://forum.reizastudios.com/threads/automobilista-2-livery-customization-overview.9745/
**Access:** Free forum registration required
**Format:** Google Drive download (multi-GB PSD/PNG pack)
**Coverage:** All official vehicles with wireframes, AO layers, and paint guides
**Last Known Update:** Linked to 2024 Q4 content drop (verify against current build)

### Alternative: RaceDepartment Megapack
**Source:** RaceDepartment - Automobilista 2 Template Megapack
**URL:** https://www.racedepartment.com/downloads/automobilista-2-paint-template-megapack.38852/
**Access:** Free account required
**Update Tracking:** Shows "Updated" timestamp on download page

## Extraction Approach for AMS2

### Option 1: Extract UV Textures from Game Files (NOW VIABLE!)
**Status:** 360 livery BFF archives discovered in `Pakfiles\Vehicles\`

Requirements:
- ✅ PCarsTools + Oodle DLL (already set up in `ams2-car-image-extractor`)
- ✅ Extract UV-mapped DDS files from `*_Livery.bff` archives
- ✅ Convert DDS → PNG using existing UTEX.js infrastructure
- ⚠️ Requires adding wireframe overlays and decal guides manually

**Steps:**
1. Reuse `ams2-car-image-extractor/src/pcars-tools-wrapper.ts`
2. Extract 5 sample vehicles from `Pakfiles/Vehicles/*_Livery.bff`
3. Convert extracted DDS textures to PNG
4. Inspect UV layout quality and completeness
5. Copy to `sims/AMS2/example-templates/`

See: `LIVERY-TEMPLATE-EXTRACTION.md` for detailed extraction guide.

### Option 2: Use Community Templates (Still Recommended for Production)
1. Download official template pack from Reiza forum
2. Copy 5 representative PSD files to `sims/AMS2/example-templates/`
3. Document source, version, and download date in `SOURCE.txt`

### Option 2: Extract UV Textures (Advanced, Not Recommended)
Requirements:
- Locate vehicle-specific `*_Livery.bff` archives (not found in current install)
- Extract using PCarsTools + Oodle DLL
- Convert DDS UV maps to editable format
- Manually create wireframe overlays
- Much more complex than using official templates

## Recommendation

**Use the community template approach** documented in `ACQUISITION-GUIDE.md`:
1. Register at Reiza forum
2. Download official template pack
3. Select 5 representative vehicles (mix of classes: GT3, prototype, formula, stock car, classic)
4. Copy PSDs to `sims/AMS2/example-templates/`
5. Create `SOURCE.txt` documenting:
   - Download URL
   - Download date
   - Template pack version
   - File checksums (optional)

This provides proper, artist-created templates with all necessary layers rather than raw extracted UV maps that would require extensive manual work to make usable.
