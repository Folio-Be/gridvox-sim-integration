# Getting Started with AMS2 Track Extractor

Quick start guide to begin extracting and converting AMS2 tracks.

## Installation

### 1. Install Dependencies

```bash
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor
npm install
```

This installs:
- Three.js (3D library)
- @gltf-transform (glTF optimization)
- Commander, Chalk, Ora (CLI tools)

### 2. Verify Setup

```bash
npm run verify-setup
```

This checks:
- ✅ Node modules installed
- ⚠ Optional: AMS2 path, PCarsTools, Blender
- ⚠ Optional: Telemetry data directory

---

## Quick Start: Choose Your Approach

### 🥇 **Approach 3: PCarsTools Extraction (TRY FIRST - BEST RESULTS)**

**Success Rate:** 40% | **Quality:** Highest | **Telemetry Alignment:** Perfect

Extract original AMS2 track files for authentic geometry.

⚠️ **This approach yields the best results if it works** - perfect track geometry AND perfect coordinate alignment with telemetry.

**See [MANUAL-SETUP.md](./MANUAL-SETUP.md) for detailed PCarsTools setup instructions.**

Once set up:

```bash
npm run extract-track -- --track silverstone_gp --ams2-path "C:\...\Automobilista 2"
```

**If this works:** You get the best possible results. Continue using for all tracks.

**If this fails:** Immediately proceed to Approach 2 below.

---

### 🥈 **Approach 2: 3-Run Track Mapping (RELIABLE FALLBACK)**

**Success Rate:** 98% | **Quality:** High | **Telemetry Alignment:** Perfect

Generate tracks from 3 telemetry recordings with actual track geometry.

**This is the recommended fallback if Approach 3 fails.**

#### Step 1: Record 3 Telemetry Runs

**Drive 3 specific laps on the same track:**

```
Lap 1 - OUTSIDE BORDER:
1. Launch AMS2, select track
2. Drive staying on OUTER edge of track
   - Follow white line / track boundary
   - Stay consistent through corners
3. Complete full lap
4. Saves: telemetry-data/silverstone-outside.json

Lap 2 - INSIDE BORDER:
1. Same track
2. Drive on INSIDE edge (apex line)
   - Clip curbs where appropriate
   - Maximum inside line through corners
3. Complete full lap
4. Saves: telemetry-data/silverstone-inside.json

Lap 3 - RACING LINE:
1. Same track
2. Drive optimal racing line (fast lap)
3. Complete full lap
4. Saves: telemetry-data/silverstone-racing.json

Total time: ~6 minutes (3 laps)
```

#### Step 2: Generate Mapped Track

```bash
npm run generate-procedural -- \
  --mapping-mode \
  --track silverstone \
  --outside-border telemetry-data/silverstone-outside.json \
  --inside-border telemetry-data/silverstone-inside.json \
  --racing-line telemetry-data/silverstone-racing.json
```

#### Step 3: Validate

```bash
npm run validate -- --track silverstone
```

**Output:** `converted-tracks/silverstone-mapped.glb`

**What you get:**
- ✅ Actual track width (variable in corners)
- ✅ Real track surface geometry
- ✅ Detected curbs from elevation changes
- ✅ Racing line overlay
- ✅ **Perfect coordinate alignment** with telemetry
- ✅ Natural camber/banking preserved

---

### � **Approach 1: Community Models (NOT RECOMMENDED)**

**Success Rate:** 80% (finding) / 20% (alignment) | **Time:** 30-90 minutes | **Difficulty:** Hard

⚠️ **Critical Issue:** Community models use different coordinate systems than AMS2. Telemetry points will **not align** with track surface without extensive manual calibration.

**Only use if:**
- You don't need telemetry replay
- Visual quality more important than accuracy
- Willing to invest 30-60 min manual calibration per track

**Not recommended for GridVox telemetry visualization.**

---

### 🏆 **Approach 4: Hybrid (Best Visual Quality)**

**Success Rate:** 75% | **Time:** 25-360 minutes | **Difficulty:** Medium

Combine 3-run mapped track with manual Blender enhancement.

#### Step 1: Generate 3-Run Mapped Base

```bash
npm run generate-procedural -- \
  --mapping-mode \
  --track monza \
  --outside-border telemetry-data/monza-outside.json \
  --inside-border telemetry-data/monza-inside.json \
  --racing-line telemetry-data/monza-racing.json
```

#### Step 2: Open in Blender

1. Launch Blender
2. File → Import → glTF 2.0
3. Select `converted-tracks/monza-mapped.glb`

#### Step 3: Add Details

- Add specific buildings (Box meshes based on reference photos)
- Add barriers/fencing along track edges
- Add signage and branding
- Apply better textures (extract from AMS2 with PCarsTools if available)

#### Step 4: Re-export

1. File → Export → glTF 2.0
2. Settings:
   - ☑ Draco Compression
   - ☑ Apply Modifiers
   - ☑ Export materials
3. Save as `converted-tracks/monza-enhanced.glb`

#### Step 5: Optimize

```bash
npm run optimize -- --input converted-tracks/monza-enhanced.glb
```

**Benefits:**
- ✅ Perfect coordinate alignment (from 3-run mapping base)
- ✅ Enhanced visual quality
- ✅ Track-specific details

---

## Usage Examples

### Test Mode (No Telemetry Needed)

Generate a test circular track to verify everything works:

```bash
npm run generate-procedural -- --test
```

**Output:** `converted-tracks/test-track.glb`

### 3-Run Mapping with Buildings

```bash
npm run generate-procedural -- \
  --mapping-mode \
  --track silverstone \
  --outside-border telemetry-data/silverstone-outside.json \
  --inside-border telemetry-data/silverstone-inside.json \
  --racing-line telemetry-data/silverstone-racing.json \
  --buildings
```

Adds heuristic buildings at key locations.

### Batch Validation

Validate all tracks in `converted-tracks/`:

```bash
npm run validate -- --test
```

### Custom Track Width

```bash
npm run generate-procedural -- --input telemetry.json --width 12
```

(Default: 10 meters)

### Optimize with Custom Settings

```bash
npm run optimize -- --input track.glb --draco-level 10 --max-texture-size 1024
```

---

## Integration with Three.js

### Loading Generated Tracks

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('converted-tracks/silverstone.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

### With Telemetry Visualization

See [gridvox-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md](../../gridvox-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md) for complete React Three Fiber implementation.

---

## Common Workflows

### Workflow 1: Quick Track Generation

**Goal:** Get a basic track working ASAP

```bash
# 1. Drive track in AMS2 (saves telemetry)
# 2. Generate procedural track
npm run generate-procedural -- --input telemetry-data/brands-hatch.json

# 3. Validate
npm run validate -- --track brands-hatch

# Done! Use converted-tracks/brands-hatch.glb in Three.js
```

**Time:** 5 minutes  
**Quality:** Basic but functional

---

### Workflow 2: High-Quality Track

**Goal:** Professional-looking track with details

```bash
# 1. Search for community model
# (Download spa.fbx from Sketchfab)

# 2. Convert to glTF
npm run convert-gltf -- --input downloaded-models/spa/model.fbx

# 3. Optimize
npm run optimize -- --input converted-tracks/spa.glb

# 4. Validate
npm run validate -- --track spa-optimized

# Done! Use converted-tracks/spa-optimized.glb
```

**Time:** 30 minutes  
**Quality:** High

---

### Workflow 3: Enhanced Procedural Track

**Goal:** Procedural track with manual improvements

```bash
# 1. Generate base with buildings
npm run generate-procedural -- --input telemetry-data/monza.json --buildings

# 2. Open in Blender and enhance (manual)
#    - Add specific grandstands
#    - Add pit buildings
#    - Add trees/vegetation
#    - Apply better textures

# 3. Re-export from Blender as monza-enhanced.glb

# 4. Optimize
npm run optimize -- --input converted-tracks/monza-enhanced.glb

# 5. Validate
npm run validate -- --track monza-enhanced-optimized

# Done!
```

**Time:** 1-4 hours (depending on detail level)  
**Quality:** High with custom details

---

## File Organization

```
ams2-track-extractor/
├── telemetry-data/              # Input: Telemetry recordings
│   ├── silverstone-lap-001.json
│   └── spa-lap-001.json
│
├── downloaded-models/           # Input: Community models
│   ├── silverstone/
│   │   ├── model.fbx
│   │   ├── INFO.txt
│   │   └── LICENSE.txt
│   └── spa/
│
├── converted-tracks/            # Output: Final glTF files
│   ├── silverstone.glb
│   ├── silverstone-optimized.glb
│   ├── spa.glb
│   └── test-track.glb
│
└── extracted-tracks/            # Intermediate: PCarsTools output
    └── silverstone_gp/
        ├── track.gmt
        └── textures/
```

---

## Recommended Priority

**Tier 1 Tracks** (Invest 4-8 hours each):
- Silverstone GP
- Spa-Francorchamps
- Monza
- Suzuka

Use **Approach 4 (Hybrid)** or **Approach 1 (Community)** for highest quality.

**Tier 2 Tracks** (Invest 1-2 hours each):
- Brands Hatch
- Interlagos
- Imola

Use **Approach 2 (Procedural) + light Blender touch-ups**.

**Tier 3 Tracks** (5 minutes each):
- All others

Use **Approach 2 (Procedural)** only.

---

## Troubleshooting

### "No telemetry file found"

→ Drive the track in AMS2 with telemetry recording enabled  
→ Check `track-map-core` configuration

### "File size too large"

→ Run optimization: `npm run optimize -- --input track.glb`  
→ Reduce texture size: `--max-texture-size 1024`

### "Track doesn't load in Three.js"

→ Validate first: `npm run validate -- --track [name]`  
→ Check browser console for errors  
→ Ensure Draco decoder is available

### "TypeScript errors"

→ Run: `npm install`  
→ Rebuild: `npm run build`

---

## Next Steps

1. **Read:** [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) for detailed approach documentation
2. **Setup:** [MANUAL-SETUP.md](./MANUAL-SETUP.md) for advanced tool installation
3. **Integrate:** [gridvox-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md](../../gridvox-docs/06-development/AMS2-TRACK-EXTRACTION-RESEARCH.md) for Three.js visualization

---

## Support

**Common Questions:**

**Q: Which approach should I use?**  
A: Start with Approach 2 (Procedural) - highest success rate, works immediately.

**Q: How do I get better visual quality?**  
A: Use Approach 1 (Community models) or Approach 4 (Hybrid enhancement in Blender).

**Q: Do I need to install PCarsTools?**  
A: No, unless using Approach 3 or extracting textures for Approach 4.

**Q: Can I use this for non-AMS2 tracks?**  
A: Yes! Approach 2 works with any telemetry data (any game/sim).

---

**Status:** Ready to use  
**Last Updated:** November 9, 2025  
**Version:** 0.1.0
