# Week 3-4 Execution Plan
## AMS2 AI Livery Designer - Asset Extraction Phase

**Duration:** November 10-24, 2025 (2 weeks)  
**Status:** Week 2 Complete ✅ → Starting Week 3

---

## Week 2 Completion Summary

✅ **COMPLETED:**
- PyTorch 2.9.0+cu126 installed with CUDA 12.6 support
- SDXL Base 1.0 models downloaded (24.8 GB, fp16 optimized)
- ControlNet Depth SDXL installed
- GPU pipeline tested on RTX 4090:
  - Model load: 0.4s
  - Generation: 1.6s (512x512, 20 steps)
  - VRAM usage: 7.05 GB
- Installation scripts created (`install-cuda.bat`, `install-ai.bat`, `download_models.py`)
- Test generation successful: `temp/test_output.png`

---

## Week 3-4 Objectives

Extract and prepare all assets needed for AI livery generation:

### 1. UV Template Extraction ⏳
**Goal:** Get UV unwrapped texture templates for 3 GT3 cars

**Steps:**
1. Locate AMS2 installation directory
2. Find vehicle `.mas` archive files:
   - `Porsche_992_GT3R.mas`
   - `McLaren_720S_GT3_Evo.mas`
   - `BMW_M4_GT3.mas`
3. Use PCarsTools or QuickBMS to extract:
   - 3D models (`.gmt`, `.gmtk` files)
   - Existing livery textures (`.dds` files)
   - Material definitions (`.xml`, `.json`)
4. Generate UV layouts using Blender/3DS Max
5. Save as PNG templates (2048x2048 or 4096x4096)

**Tools Needed:**
- PCarsTools or QuickBMS (MAS archive extractor)
- Blender 3.6+ with Python API
- Optional: 3DS Max, Substance Painter

**Deliverables:**
```
assets/
  uv-templates/
    porsche_992_gt3r_uv.png
    mclaren_720s_gt3_uv.png
    bmw_m4_gt3_uv.png
  uv-guides/
    porsche_992_gt3r_layout.json  # UV island mapping
    mclaren_720s_gt3_uv_layout.json
    bmw_m4_gt3_uv_layout.json
```

**Reference:** Similar to `ams2-track-extractor` project pattern

---

### 2. Reference Photo Collection ⏳
**Goal:** Gather real-world photos for each test car (minimum 10 per car)

**Photo Requirements:**
- **Angles:** Front, rear, left side, right side, 3/4 views
- **Quality:** High resolution (2000x2000+ px)
- **Lighting:** Varied conditions (track, studio, outdoor)
- **Liveries:** Different designs (manufacturer, race team, custom)
- **Format:** JPEG or PNG

**Sources:**
- Google Images (search: "Porsche 992 GT3 R race", "McLaren 720S GT3 livery")
- Racing photography sites (Motorsport.com, Getty Images)
- Team websites (official liveries)
- iRacing/ACC community liveries (for inspiration)
- Reddit: r/USCR, r/wec

**Organization:**
```
assets/
  test-photos/
    porsche_992_gt3r/
      front_01.jpg
      side_01.jpg
      rear_01.jpg
      three_quarter_01.jpg
      ...
    mclaren_720s_gt3/
      front_01.jpg
      ...
    bmw_m4_gt3/
      front_01.jpg
      ...
  photo-metadata.json  # Angle tags, source info
```

**Minimum Target:** 10 photos × 3 cars = 30 photos

---

### 3. Existing Livery Extraction ⏳
**Goal:** Extract AMS2's original liveries for comparison/validation

**Steps:**
1. Extract `.dds` textures from vehicle `.mas` files
2. Convert DDS → PNG using ImageMagick or Photoshop
3. Analyze UV mapping patterns
4. Identify quality benchmarks

**Deliverables:**
```
assets/
  sample-liveries/
    porsche_992_gt3r/
      default_livery.png
      team_livery_01.png
      ...
    mclaren_720s_gt3/
      ...
    bmw_m4_gt3/
      ...
  livery-analysis.md  # Patterns, quality notes
```

**Tools:**
- NVIDIA Texture Tools
- ImageMagick
- DirectX Texture Tool

---

### 4. 3D Model Extraction for ControlNet ⏳
**Goal:** Get car geometry for depth/normal map generation

**Why:** ControlNet uses depth/normal maps to preserve car structure during AI generation

**Steps:**
1. Extract `.gmt`/`.gmtk` 3D models from MAS archives
2. Import into Blender using rFactor/Project CARS importers
3. Export as `.obj` or `.fbx` for Python processing
4. Generate depth maps from multiple angles (front, side, rear)
5. Generate normal maps from UV-unwrapped geometry

**Deliverables:**
```
assets/
  3d-models/
    porsche_992_gt3r.obj
    mclaren_720s_gt3.obj
    bmw_m4_gt3.obj
  depth-maps/
    porsche_992_gt3r_depth_front.png
    porsche_992_gt3r_depth_side.png
    ...
  normal-maps/
    porsche_992_gt3r_normals.png
    ...
```

**Python Script:** `generate_depth_maps.py` using Open3D or PyRender

---

### 5. UV Layout Documentation ⏳
**Goal:** Understand how AMS2 maps textures to car geometry

**Analysis Points:**
- UV island organization (hood, doors, roof, bumpers)
- Texture resolution per panel
- Seam locations (where UV islands connect)
- Sponsor logo placement zones
- Window/light mask areas

**Deliverable:** `UV_MAPPING_GUIDE.md` with annotated diagrams

---

## Week 3 Daily Breakdown

### Day 1-2 (Nov 10-11): AMS2 Asset Extraction
- [ ] Locate AMS2 installation (`C:\Program Files\Steam\steamapps\common\Automobilista 2\`)
- [ ] Find vehicle `.mas` files in `Vehicles\GameData\`
- [ ] Download/install PCarsTools or QuickBMS
- [ ] Extract 3 car archives
- [ ] Inventory extracted files (models, textures, configs)

### Day 3-4 (Nov 12-13): UV Template Creation
- [ ] Import car models into Blender
- [ ] Export UV layouts as PNG (2048x2048 or 4096x4096)
- [ ] Create UV island mapping JSON
- [ ] Test import/export pipeline
- [ ] Document UV structure

### Day 5-7 (Nov 14-16): Reference Photo Collection
- [ ] Research GT3 liveries for each car
- [ ] Download 10+ photos per car
- [ ] Organize by angle (front/side/rear/3-4)
- [ ] Tag photos with metadata (source, angle, year)
- [ ] Create `photo-metadata.json`

---

## Week 4 Daily Breakdown

### Day 8-10 (Nov 17-19): Existing Livery Analysis
- [ ] Extract DDS textures from vehicle MAS files
- [ ] Convert DDS → PNG
- [ ] Analyze UV mapping quality
- [ ] Identify common patterns (stripes, sponsors, numbers)
- [ ] Document in `livery-analysis.md`

### Day 11-12 (Nov 20-21): 3D Model Processing
- [ ] Export car models as OBJ/FBX
- [ ] Write `generate_depth_maps.py` script
- [ ] Generate depth maps (front, side, rear, 3/4)
- [ ] Generate normal maps from UV geometry
- [ ] Test ControlNet compatibility

### Day 13-14 (Nov 22-24): Integration Preparation
- [ ] Create asset loading utilities (`load_uv_template()`, `load_reference_photo()`)
- [ ] Write preprocessing pipeline (`resize()`, `normalize()`, `mask_windows()`)
- [ ] Test photo → UV space projection math
- [ ] Prepare Week 5 pipeline architecture
- [ ] Update README with Week 3-4 results

---

## Success Criteria

✅ **Week 3-4 Complete When:**
1. All 3 cars have UV templates extracted (2048x2048 minimum)
2. 30+ reference photos collected (10 per car, multiple angles)
3. Existing AMS2 liveries extracted and analyzed
4. Depth/normal maps generated for ControlNet
5. UV mapping patterns documented
6. Asset loading utilities tested and working

---

## Key Risks & Mitigations

**Risk 1:** AMS2 uses proprietary formats hard to extract
- **Mitigation:** Use existing community tools (PCarsTools), check AMS2 modding forums

**Risk 2:** UV layouts are fragmented/complex
- **Mitigation:** Start with simplest car (Porsche), analyze existing liveries for patterns

**Risk 3:** Reference photos have inconsistent quality/angles
- **Mitigation:** Collect 2x needed amount, filter down to best 10 per car

**Risk 4:** Blender UV export doesn't match in-game mapping
- **Mitigation:** Cross-reference with extracted DDS textures, test import/export

---

## Tools & Resources

### Required Software
- **PCarsTools** - MAS archive extractor
- **QuickBMS** - Universal game archive extractor
- **Blender 3.6+** - 3D modeling, UV unwrapping
- **ImageMagick** - DDS conversion
- **NVIDIA Texture Tools** - DDS handling

### Python Libraries (add to requirements.txt)
```python
Pillow>=10.4.0          # Image processing
numpy>=1.26.4           # Array operations
opencv-python>=4.12.0   # Computer vision
open3d>=0.18.0          # 3D processing (depth maps)
pyrender>=0.1.45        # Rendering (normal maps)
trimesh>=4.0.0          # Mesh processing
```

### Reference Projects
- `ams2-track-extractor` - Asset extraction patterns
- `ams2-content-listing` - Vehicle database
- Community: RaceDepartment, Project CARS forums

---

## Deliverables Summary

```
assets/
├── uv-templates/           # 3 UV layout PNGs
├── uv-guides/              # 3 JSON mapping files
├── test-photos/            # 30+ reference photos
│   ├── porsche_992_gt3r/
│   ├── mclaren_720s_gt3/
│   └── bmw_m4_gt3/
├── sample-liveries/        # Extracted AMS2 liveries
│   ├── porsche_992_gt3r/
│   ├── mclaren_720s_gt3/
│   └── bmw_m4_gt3/
├── 3d-models/              # 3 OBJ/FBX files
├── depth-maps/             # Depth maps per angle
├── normal-maps/            # Normal maps
├── photo-metadata.json     # Photo tags
├── livery-analysis.md      # UV pattern analysis
└── UV_MAPPING_GUIDE.md     # Documentation

python-backend/
├── utils/
│   ├── asset_loader.py     # Load UV templates, photos
│   ├── image_prep.py       # Resize, normalize, mask
│   └── uv_projection.py    # Photo → UV math
└── generate_depth_maps.py  # 3D → depth/normal
```

---

## Next Phase Preview: Week 5-6

After Week 3-4 completes, we'll build:
1. Photo preprocessing pipeline (SAM background removal)
2. SDXL + ControlNet integration
3. UV space projection algorithm
4. DDS export with AMS2 compatibility
5. First end-to-end test: Photo → AI → DDS → AMS2

---

## Questions Before Starting?

1. Do you have AMS2 installed and know the location?
2. Have you used Blender before, or should we use automated scripts?
3. Preference for photo collection: manual search vs automated scraping?
4. Any specific livery styles you want to prioritize (team colors, sponsors, patterns)?

**Ready to start Week 3, Task 1: Locate AMS2 installation and extract first car assets?**
