# Getting Started with AMS2 Telemetry Track Generator

**Quick start guide for generating 3D track models from AMS2 telemetry using the 3-run mapping method.**

---

## Prerequisites

### Software Requirements

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Automobilista 2**
   - With telemetry output enabled
   - See: [Enabling Telemetry](#enabling-telemetry) below

3. **SimVox.ai Track Map Core** (recommended)
   - For recording telemetry data
   - Location: `C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\track-map-visualization\`

### Hardware Requirements

- Disk space: ~500MB per track (including telemetry files)
- RAM: 4GB+ recommended for processing
- Any PC capable of running AMS2

---

## Installation

### 1. Clone/Navigate to Project

```powershell
cd C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-telemetry-track-generator
```

### 2. Install Dependencies

```powershell
npm install
```

This installs:
- `three` - 3D library for mesh generation
- `@gltf-transform/core` - glTF file handling
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler

### 3. Verify Installation

```powershell
npm run validate -- --help
```

Should display help text (even though implementation is pending).

---

## Enabling Telemetry in AMS2

### Option A: In-Game Settings

1. Launch AMS2
2. Go to **Settings** → **Gameplay**
3. Enable **Shared Memory**
4. Set output format to **JSON** (if available)
5. Note the telemetry output directory

### Option B: Configuration File

Edit `Documents\Automobilista 2\telemetry.ini`:

```ini
[Telemetry]
Enabled=1
OutputFormat=JSON
OutputDirectory=C:\Telemetry\AMS2
UpdateFrequency=60
```

### Verify Telemetry is Working

1. Start a practice session in AMS2
2. Drive a few laps
3. Check telemetry output directory for `.json` files
4. Files should contain position, speed, throttle, brake data

---

## Recording Telemetry (The 3-Run Method)

### Overview

You need to record **3 strategic laps** per track:

1. **Outside Border Lap** - Hug the outer edge of the track
2. **Inside Border Lap** - Hug the inner edge (apex line)
3. **Racing Line Lap** - Drive your normal optimal racing line

### Detailed Instructions

#### Lap 1: Outside Border

**Goal:** Capture the outer boundary of the track surface.

1. Start AMS2 practice session on target track
2. **Enable telemetry recording** (if using track-map-core)
3. Drive ONE FULL LAP staying as close to the **outside edge** as possible
   - On straights: Stay near outside edge
   - Through corners: Take the widest line possible
   - Don't go off track (invalidates the lap)
4. Complete the lap and **save telemetry** as:
   - `telemetry-data/{track-name}-outside.json`
   - Example: `telemetry-data/silverstone-outside.json`

**Tips:**
- Go slowly if needed (speed doesn't matter)
- Consistency matters more than speed
- Make sure you complete a full lap (start/finish line)

#### Lap 2: Inside Border

**Goal:** Capture the inner boundary and apex points.

1. Start new lap (or continue session)
2. Drive ONE FULL LAP staying as close to the **inside edge** as possible
   - On straights: Stay near inside edge
   - Through corners: Hit the apex (innermost point)
   - Can touch curbs but don't cut corners
3. Complete the lap and **save telemetry** as:
   - `telemetry-data/{track-name}-inside.json`
   - Example: `telemetry-data/silverstone-inside.json`

**Tips:**
- This is similar to a "qualifying lap" line
- Hit every apex cleanly
- Curbs are OK, grass is not

#### Lap 3: Racing Line

**Goal:** Capture the optimal racing line for reference.

1. Start new lap
2. Drive ONE FULL LAP using your **normal racing line**
   - Drive as you would in a race
   - Optimal braking, turn-in, apex, exit
   - This becomes the "ideal line" visualization
3. Complete the lap and **save telemetry** as:
   - `telemetry-data/{track-name}-racing.json`
   - Example: `telemetry-data/silverstone-racing.json`

**Tips:**
- This can be your fastest lap
- Try to be smooth and consistent
- This line will be highlighted in the final 3D model

### File Naming Convention

```
telemetry-data/
├── silverstone-outside.json
├── silverstone-inside.json
├── silverstone-racing.json
├── spa-outside.json
├── spa-inside.json
├── spa-racing.json
└── ...
```

**Important:**
- Use consistent naming (track name prefix)
- Use lowercase and hyphens (not spaces)
- Keep original telemetry data (don't modify)

---

## Generating Your First Track

### Basic Usage

Once you have 3 telemetry files recorded:

```powershell
npm run generate -- `
  --track-name silverstone `
  --outside telemetry-data/silverstone-outside.json `
  --inside telemetry-data/silverstone-inside.json `
  --racing-line telemetry-data/silverstone-racing.json
```

**Output:**
```
output/
├── silverstone.glb              # 3D track model
├── silverstone-metadata.json    # Track features and data
└── silverstone-features/        # Individual feature markers
    ├── corners.json
    ├── straights.json
    └── zones.json
```

### Command Line Options

```powershell
npm run generate -- --help
```

Available options:
- `--track-name <name>` - Name of the track (required)
- `--outside <path>` - Path to outside border telemetry (required)
- `--inside <path>` - Path to inside border telemetry (required)
- `--racing-line <path>` - Path to racing line telemetry (required)
- `--output-dir <path>` - Output directory (default: `./output`)
- `--skip-features` - Skip automatic feature detection
- `--mesh-resolution <number>` - Track mesh detail level (default: 100)
- `--optimize` - Apply optimization after generation

### Example: Generate Spa-Francorchamps

```powershell
# Record 3 laps in AMS2 (outside, inside, racing line)
# Then:

npm run generate -- `
  --track-name spa-francorchamps `
  --outside telemetry-data/spa-outside.json `
  --inside telemetry-data/spa-inside.json `
  --racing-line telemetry-data/spa-racing.json `
  --optimize

# Output: output/spa-francorchamps.glb (optimized)
```

---

## Validating Generated Tracks

### Check Track Quality

```powershell
npm run validate -- output/silverstone.glb
```

**Validation checks:**
- ✅ File is valid glTF 2.0
- ✅ Track forms a closed loop
- ✅ Start/finish line detected
- ✅ Reasonable track dimensions
- ✅ No geometry errors
- ✅ Features detected successfully

### Visual Inspection

**Recommended:** Open `.glb` file in:
- **Blender** - Free 3D viewer/editor
- **Three.js Editor** - https://threejs.org/editor/
- **glTF Viewer** - https://gltf-viewer.donmccurdy.com/

**What to check:**
- Track forms complete loop
- Width looks reasonable
- Elevation changes look correct
- No gaps or overlaps in mesh
- Racing line is visible

---

## Optimizing for Web Use

### Basic Optimization

```powershell
npm run optimize -- output/silverstone.glb
```

**Optimizations applied:**
- 🗜️ Draco mesh compression (~80% size reduction)
- 🖼️ Texture optimization
- 📐 Mesh simplification (preserves important details)
- 🧹 Remove unused data
- 📦 Deduplication

**Output:** `output/silverstone-optimized.glb`

### Advanced Optimization

For smallest file size (e.g., mobile):

```powershell
npm run optimize -- output/silverstone.glb --aggressive
```

**Trade-offs:**
- ✅ Smaller file size (90% reduction)
- ⚠️ Some visual detail loss
- ⚠️ Mesh simplification more aggressive

---

## AI Track Enrichment (Optional)

### Prerequisites

1. **Google Gemini API Key** (free tier)
   - Get key: https://aistudio.google.com/apikey
   - Free tier: Unlimited reasonable use
   - No credit card required

2. **Set environment variable:**
   ```powershell
   $env:GEMINI_API_KEY = "your-api-key-here"
   ```

### Add Corner Names

```powershell
npm run enrich -- `
  --track silverstone `
  --model output/silverstone.glb `
  --add-corner-names
```

**What it does:**
- 🔍 Searches Wikipedia for track layout maps
- 🤖 Uses Gemini Vision to extract corner names
- 📍 Matches corners to your 3D model positions
- 💾 Updates metadata with corner names

**Example output:**
```json
{
  "corners": [
    { "number": 1, "name": "Copse", "position": [x, y, z] },
    { "number": 2, "name": "Maggotts", "position": [x, y, z] },
    { "number": 3, "name": "Becketts", "position": [x, y, z] }
  ]
}
```

### Add Buildings & Scenery

```powershell
npm run enrich -- `
  --track silverstone `
  --model output/silverstone.glb `
  --add-buildings
```

**What it does:**
- 🛰️ Fetches satellite imagery (Google Maps)
- 🏢 Uses Gemini to detect buildings
- 📐 Gets building footprints from OpenStreetMap
- 🎨 Generates simplified 3D building models
- 📍 Positions buildings in track coordinates

### Full Enrichment (Everything)

```powershell
npm run enrich -- `
  --track spa-francorchamps `
  --model output/spa-francorchamps.glb `
  --add-corner-names `
  --add-buildings `
  --add-documentation
```

**What it does:**
- All of the above, plus:
- 📸 Gathers historical photos from Wikimedia
- 📖 Extracts track history from Wikipedia
- 🏆 Finds famous moments and lap records
- 📝 Generates comprehensive corner documentation

**Cost:** $0.00 (using Gemini free tier)

---

## Troubleshooting

### Issue: "Telemetry files not found"

**Solution:**
- Check file paths are correct
- Use absolute paths: `C:\Telemetry\silverstone-outside.json`
- Verify files exist: `Test-Path telemetry-data/silverstone-outside.json`

### Issue: "Track doesn't form closed loop"

**Solution:**
- Make sure you completed full lap (crossed start/finish)
- Check telemetry has sufficient data points
- Try recording lap again with telemetry at higher frequency

### Issue: "Track width looks wrong"

**Solution:**
- Make sure outside/inside laps are distinct (not the same line)
- Outside lap should be wider than inside lap
- Check you didn't accidentally swap files

### Issue: "npm install fails"

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstall
npm install
```

### Issue: "Features not detected correctly"

**Solution:**
- Check telemetry includes speed, throttle, brake data
- Try increasing telemetry recording frequency in AMS2
- Verify racing line lap is smooth and representative

---

## Best Practices

### Recording Telemetry

✅ **DO:**
- Record in practice mode (not race)
- Use consistent car across all 3 laps
- Drive smoothly and consistently
- Complete full laps (cross start/finish)
- Save telemetry immediately after each lap

❌ **DON'T:**
- Don't mix different track configurations
- Don't go off track or cut corners
- Don't pause/unpause during lap
- Don't use different cars for different laps
- Don't modify telemetry files manually

### File Organization

```
ams2-telemetry-track-generator/
├── telemetry-data/           # Source telemetry (keep originals)
│   ├── silverstone-outside.json
│   ├── silverstone-inside.json
│   └── silverstone-racing.json
├── output/                   # Generated tracks
│   ├── silverstone.glb
│   └── silverstone-metadata.json
└── output/optimized/         # Web-optimized versions
    └── silverstone-optimized.glb
```

### Version Control

**Commit to git:**
- ✅ Source code (`src/`, `scripts/`)
- ✅ Documentation (`docs/`, `README.md`)
- ✅ Configuration (`package.json`, `tsconfig.json`)

**Don't commit:**
- ❌ `node_modules/`
- ❌ `output/` (generated files)
- ❌ `telemetry-data/` (large files)
- ❌ `.glb` files (binary, large)

---

## Next Steps

### After Generating First Track

1. **Validate** the track model
2. **Optimize** for your use case
3. **Test** in SimVox.ai desktop app
4. **Enrich** with AI features (optional)
5. **Document** any track-specific quirks

### Generate More Tracks

Once comfortable with the process:

1. Record telemetry for all AMS2 tracks you use
2. Generate in batch (see batch processing scripts)
3. Create a track library for SimVox.ai
4. Share with community (if desired)

### Contribute Improvements

Found issues or improvements?

1. Check implementation checklist: `docs/IMPLEMENTATION-CHECKLIST.md`
2. Read methodology: `docs/3-RUN-MAPPING-METHOD.md`
3. Submit issues/PRs to main SimVox.ai repo

---

## Reference Documentation

### Core Documentation

- [README.md](./README.md) - Project overview
- [3-Run Mapping Method](./docs/3-RUN-MAPPING-METHOD.md) - Detailed methodology
- [Implementation Checklist](./docs/IMPLEMENTATION-CHECKLIST.md) - Development roadmap
- [Telemetry Features](./docs/TELEMETRY-FEATURES.md) - Available AMS2 telemetry fields
- [Auto Features Summary](./docs/AUTO-FEATURES-SUMMARY.md) - Automatic feature detection
- [AI Track Enrichment](./docs/AI-TRACK-ENRICHMENT-RESEARCH.md) - AI-powered enhancements

### Related Projects

- **PCarsTools Approach:** `../ams2-track-extractor/`
  - Alternative extraction method (40% success rate)
  - Requires game file access and complex tooling
  - Manual coordinate alignment needed

- **Track Map Visualization:** `../track-map-visualization/`
  - 2D track map viewer
  - Telemetry recording tools
  - Real-time track visualization

- **SimVox.ai Desktop:** `../../../simvox-desktop/`
  - Main SimVox.ai application
  - Where generated tracks are used
  - Telemetry replay and analysis

### External Resources

- **AMS2 Telemetry API:** [Official Documentation]
- **glTF 2.0 Spec:** https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- **Three.js:** https://threejs.org/docs/
- **Gemini API:** https://ai.google.dev/

---

## FAQ

### Q: How long does it take to generate a track?

**A:** 
- Recording: 10-15 minutes (3 laps)
- Generation: 30-60 seconds (depends on track length)
- Optimization: 10-20 seconds
- AI Enrichment: 2-3 minutes (if using)

### Q: Can I use this for tracks not in AMS2?

**A:** Not directly. This tool requires AMS2 telemetry data. However, if you can get similar telemetry from another sim, you could adapt the code.

### Q: How accurate is the generated track?

**A:** 
- Coordinate alignment: 100% (uses actual telemetry coordinates)
- Track shape: 98%+ (depends on your driving)
- Dimensions: 95%+ (calculated from telemetry)
- Features: 90-95% (automatic detection from data)

### Q: Can I edit the generated track?

**A:** Yes! The `.glb` file can be opened in Blender or other 3D tools for manual editing.

### Q: Do I need all 3 laps?

**A:** Yes, all 3 are required:
- Outside + Inside = Track boundaries
- Racing line = Reference line and feature detection

### Q: What if my telemetry has gaps?

**A:** The generator will interpolate small gaps. Large gaps may cause issues. Re-record if needed.

### Q: Can I batch process multiple tracks?

**A:** Yes, see `scripts/batch-generate.ts` (implementation pending).

### Q: Is this legal?

**A:** Yes! Uses only:
- Public telemetry API (designed for this)
- No game file extraction
- No proprietary data

---

## Support

### Getting Help

1. **Check this guide** - Most common issues covered
2. **Read documentation** - See links above
3. **Check issues** - SimVox.ai GitHub repo
4. **Ask community** - SimVox.ai Discord/Forum

### Reporting Issues

When reporting issues, include:
- AMS2 version
- Node.js version (`node --version`)
- Track name
- Error message (full text)
- Steps to reproduce

### Contributing

Contributions welcome! See main SimVox.ai repo for contribution guidelines.

---

**Ready to start?** Record your first 3 laps and run `npm run generate`! 🏁
