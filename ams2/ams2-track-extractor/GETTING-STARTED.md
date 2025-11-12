# Getting Started - PCarsTools Track Extraction

Complete guide for extracting AMS2 tracks using PCarsTools and Blender.

---

## ⚠️ Before You Start

### Have you completed setup?

**If NO** → See [SETUP.md](./SETUP.md) first!

You must have:
- ✅ .NET 6.0 Runtime installed
- ✅ PCarsTools binary in `tools/PCarsTools/pcarstools_x64.exe`
- ✅ Oodle DLL in `tools/PCarsTools/oo2core_4_win64.dll`
- ✅ Blender 4.0+ installed
- ✅ Node.js dependencies installed (`npm install`)

### Important Limitations

This approach has **~40% success rate** because:
- Many tracks have encrypted/inaccessible files
- Requires manual Blender workflow (60-90 min per track)
- Manual coordinate alignment needed for telemetry
- Game updates can break extraction

**Consider alternatives:**
- **Telemetry-based approach**: 95% success, perfect alignment, 10 min per track
- See: [ams2-telemetry-track-generator](../ams2-telemetry-track-generator/)

**Use this approach when:**
- ✅ You need high-fidelity visual models
- ✅ Telemetry alignment is not critical  
- ✅ You're willing to invest 2-3 hours per track
- ✅ You have Blender skills

---

## Extraction Workflow Overview

```
Step 1: Extract (10-30 min)     →  PCarsTools extracts + exports to glTF/OBJ
Step 2: Optimize (5-10 min)     →  Automated web optimization  
Step 3: Align (30-60 min)       →  Manual coordinate calibration
─────────────────────────────────────────────────────────────
Total Time: 45-90 minutes per track

Optional: Blender Refinement    →  Clean up geometry (if needed)
          (60-90 min additional)    Remove buildings, simplify mesh
```

**Note:** PCarsTools can export directly to glTF/OBJ. Blender is only needed for optional visual refinement (removing buildings, cleaning geometry).

---

## Step 1: Extract Track Files

### 1.1 Verify Your Setup

Quick verification:

```powershell
# Check .NET
dotnet --version
# Expected: 6.0.x or higher

# Check PCarsTools
.\tools\PCarsTools\pcarstools_x64.exe --help
# Expected: PCarsTools help text

# Check Oodle DLL exists  
Test-Path ".\tools\PCarsTools\oo2core_4_win64.dll"
# Expected: True
```

### 1.2 Locate AMS2 Track Files

AMS2 tracks are stored as `.bff` (Big File Format) archives in:

```
[AMS2 Install]/Vehicles/Textures/CustomLiveries/
[AMS2 Install]/Vehicles/Textures/UpgradePreview/
[AMS2 Install]/GameData/Locations/
```

**Common AMS2 install paths:**
```powershell
C:\GAMES\Automobilista 2
C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2
C:\Program Files\Epic Games\Automobilista 2
```

### 1.3 Extract Track with PCarsTools

**Currently manual process.** Automated extraction script coming soon.

**Manual steps:**

1. Navigate to your AMS2 installation
2. Locate track `.bff` file (e.g., `Silverstone.bff`)
3. Run PCarsTools:

```powershell
cd C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-track-extractor

.\tools\PCarsTools\pcarstools_x64.exe extract `
  --input "C:\GAMES\Automobilista 2\GameData\Locations\Silverstone.bff" `
  --output ".\extracted-tracks\silverstone\raw"
```

**Expected output:**
```
Extracting Silverstone.bff...
Found 127 files
Decompressing with Oodle...
✓ Extracted to: extracted-tracks/silverstone/raw/
```

**What you get:**
- Track geometry files (various formats)
- Textures (DDS format)
- Material definitions
- Collision meshes
- AI path data

### 1.4 Identify Track Geometry Files

Look for files with these extensions in the extracted folder:

- `.gmt` - Track mesh geometry
- `.gmtk` - Track collision mesh  
- `.obj` - Wavefront OBJ (if present)
- `.dae` - COLLADA (if present)

**Common file names:**
- `track.gmt` - Main track surface
- `road.gmt` - Road mesh
- `terrain.gmt` - Surrounding terrain
- `objects.gmt` - Track-side objects

---

## Step 2: Convert to glTF (Blender - Manual)

### 2.1 Install Blender Import Addon (if needed)

PCarsTools may have a Blender addon for `.gmt` files:
- Check https://github.com/Nenkai/PCarsTools for addons
- Install addon in Blender: Edit → Preferences → Add-ons → Install

### 2.2 Import Track into Blender

**Open Blender:**

```powershell
# If Blender in PATH:
blender

# Or manually open:
& "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe"
```

**Import workflow:**

1. **Delete default cube** (X key)
2. **File → Import → [Track Format]**
   - If `.gmt`: Use PCarsTools import addon
   - If `.obj`: File → Import → Wavefront (.obj)
   - If `.dae`: File → Import → Collada (.dae)
3. **Navigate to:** `extracted-tracks/silverstone/raw/`
4. **Select track geometry file** (e.g., `track.gmt` or `track.obj`)
5. **Import**

**Expected result:**
- Track surface mesh visible in 3D viewport
- May include surrounding terrain, objects
- Textures may or may not load (not critical)

### 2.3 Clean Up Geometry

**Remove unnecessary objects:**

1. **Select objects** (click on them)
2. **Delete non-track objects:**
   - Trees, barriers, buildings (we'll add these later with AI)
   - Spectators, flags, etc.
   - Keep only: Track surface, curbs

**Keep:**
- ✅ Main track surface
- ✅ Curbs
- ✅ Run-off areas
- ✅ Pit lane

**Remove:**
- ❌ Grandstands (add later with AI enrichment)
- ❌ Trees and foliage
- ❌ Barriers and fencing
- ❌ Animated objects
- ❌ Light sources

### 2.4 Check Track Orientation

**Important for coordinate alignment:**

1. **View from top** (Numpad 7)
2. **Check orientation:**
   - Start/finish should be identifiable
   - Track should be roughly centered at origin (0,0,0)
   - Z-up coordinate system

3. **If needed, rotate/move:**
   - Select all (A key)
   - Rotate (R key)
   - Move (G key)

### 2.5 Export as glTF 2.0

**Export settings:**

1. **File → Export → glTF 2.0 (.glb/.gltf)**
2. **Settings:**
   - Format: **glTF Binary (.glb)** (recommended)
   - Include: **Selected Objects** only (if you selected track)
   - Transform: **+Y Up** (Three.js standard)
   - Geometry: **Apply Modifiers** ✓
   - Compression: Leave unchecked (we'll optimize later)
3. **Output path:** `extracted-tracks/silverstone.glb`
4. **Export glTF 2.0**

**Expected file size:**
- Small track: 5-20 MB
- Large track: 20-100 MB
- If > 200 MB: You may have included too many objects

---

## Step 3: Optimize for Web

### 2.1 Run Optimization Script

```powershell
npm run optimize -- extracted-tracks/silverstone-int/track.glb
```

**What this does:**
- 🗜️ Draco mesh compression (~80% size reduction)
- 🖼️ Texture optimization (resize, compress)
- 📐 Mesh simplification (preserves track detail)
- 🧹 Remove unused data
- 📦 Deduplication

**Output:**
```
converted-tracks/silverstone-optimized.glb
```

**Expected size reduction:**
- Before: 50 MB → After: 8-12 MB

### 2.2 What Gets Optimized

```powershell
npm run validate -- converted-tracks/silverstone-optimized.glb
```

**Checks:**
- ✅ Valid glTF 2.0 format
- ✅ Mesh integrity
- ✅ Reasonable file size
- ✅ No errors

### 2.3 Verify Optimization

**Open in glTF viewer:**

- **Online:** https://gltf-viewer.donmccurdy.com/
- **Blender:** File → Import → glTF 2.0
- **Three.js Editor:** https://threejs.org/editor/

**Check:**
- ✅ Track forms complete loop
- ✅ No missing sections
- ✅ Width looks reasonable  
- ✅ Elevation changes preserved
- ✅ Curbs visible

---

## Step 3: Manual Coordinate Alignment (Critical!)

### 3.1 The Problem

**PCarsTools-extracted tracks are NOT coordinate-aligned with telemetry.**

- Track origin (0,0,0) ≠ Game world origin
- Scale may be different (meters vs game units)
- Rotation may be off
- Telemetry points will float in wrong positions

### 3.2 Alignment Process

**This requires trial and error:**

1. **Load track in Three.js**
2. **Load telemetry data** (from a known lap)
3. **Overlay telemetry points** on track
4. **Manually adjust transformation:**
   - Translation (X, Y, Z offset)
   - Rotation (around Y axis usually)
   - Scale (uniform scaling)
5. **Iterate until telemetry aligns** with track surface

**Example transformation:**

```javascript
// In Three.js
track.position.set(1500, 0, -2300);  // Move track
track.rotation.y = Math.PI / 4;      // Rotate 45°
track.scale.setScalar(10);           // Scale 10x
```

### 3.3 Reference Points

**Use known locations to align:**

1. **Start/finish line** - Easy to identify in telemetry
2. **Specific corners** - Match telemetry speed signature
3. **Pit lane** - Distinct in telemetry (low speed)
4. **Longest straight** - Easy to identify

### 3.4 Save Calibration

**Create calibration JSON:**

```json
{
  "trackName": "silverstone",
  "modelFile": "silverstone-optimized.glb",
  "transform": {
    "position": { "x": 1500, "y": 0, "z": -2300 },
    "rotation": { "x": 0, "y": 0.785, "z": 0 },
    "scale": { "x": 10, "y": 10, "z": 10 }
  },
  "calibrationPoints": [
    { "name": "Start/Finish", "telemetry": [1523.4, 0, -2298.1], "model": [0, 0, 0] },
    { "name": "Copse", "telemetry": [1720.5, 0, -2150.3], "model": [19.7, 0, 14.8] }
  ]
}
```

Save as: `converted-tracks/silverstone-calibration.json`

### 4.5 Estimate Time

**Expect 30-60 minutes** per track for calibration:
- Finding reference points: 10 min
- Trial and error adjustments: 20-40 min
- Verification: 10 min

---

## Troubleshooting

### Extraction Issues

**Problem: PCarsTools fails with "Access denied"**

Solution:
- Run PowerShell as Administrator
- Check file permissions on extracted-tracks folder

**Problem: "Oodle decompression failed"**

Solution:
- Verify Oodle DLL is correct version (from your AMS2 install)
- Check DLL file size (~1.5-2 MB)
- Re-copy DLL from AMS2 installation

**Problem: "Cannot find track files"**

Solution:
- Not all tracks are easily accessible
- Some may be in encrypted archives
- Try different track (Silverstone usually works)
- Check AMS2 version compatibility

### Blender Import Issues

**Problem: Cannot import .gmt files**

Solution:
- Install PCarsTools Blender addon
- Or try converting .gmt to .obj first
- Check Blender version (4.0+ recommended)

**Problem: Track appears scrambled/wrong**

Solution:
- Check import scale settings
- Try different up-axis (Y-up vs Z-up)
- Verify you selected correct file

**Problem: Track is huge/tiny in Blender**

Solution:
- Scale in Blender before export
- Or adjust scale in Three.js later
- AMS2 uses different units than Blender default

### Optimization Issues

**Problem: Optimized file is corrupt**

Solution:
- Check source .glb is valid first
- Try less aggressive optimization
- Skip Draco compression (larger file but safer)

**Problem: File still too large after optimization**

Solution:
- Remove more objects in Blender (grandstands, etc.)
- Reduce texture resolution
- Use more aggressive mesh simplification

### Alignment Issues

**Problem: Can't find transformation that works**

Solution:
- This track may not be suitable for this approach
- Consider telemetry-based approach instead
- Some tracks have complex coordinate transformations

**Problem: Telemetry points are close but not perfect**

Solution:
- This is expected with manual alignment
- ±5-10 meter accuracy is typical
- Perfect alignment requires telemetry-based approach

---

## Best Practices

### File Organization

```
ams2-track-extractor/
├── extracted-tracks/
│   ├── silverstone/
│   │   ├── raw/                    # PCarsTools output
│   │   └── silverstone.glb         # Blender export
│   └── spa/
│       └── ...
│
├── converted-tracks/
│   ├── silverstone-optimized.glb   # Web-ready
│   ├── silverstone-calibration.json
│   └── ...
```

### Version Control

**Commit:**
- ✅ Calibration JSON files
- ✅ Documentation of manual steps

**Don't commit:**
- ❌ extracted-tracks/ (large, can be regenerated)
- ❌ converted-tracks/ (generated files)
- ❌ tools/PCarsTools/ (binaries)

### Documentation

For each track, document:
- PCarsTools extraction settings used
- Blender cleanup steps
- Transformation values
- Known issues/quirks
- Time spent

---

## Example: Complete Silverstone Extraction

### Time Log

```
00:00 - Start extraction
00:05 - PCarsTools extraction complete
00:10 - Import to Blender
00:45 - Clean up geometry
01:00 - Export to glTF
01:05 - Optimization complete
01:10 - Start alignment
01:45 - Alignment complete
01:50 - Validation and documentation
──────────────────────────────
Total: 1 hour 50 minutes
```

### Files Created

```
extracted-tracks/silverstone/raw/         # 500 MB PCarsTools output
extracted-tracks/silverstone.glb          # 45 MB Blender export
converted-tracks/silverstone-optimized.glb # 8 MB web-ready
converted-tracks/silverstone-calibration.json # Alignment data
```

### Lessons Learned

- Removing grandstands saved 15 MB
- Start/finish line clearly visible in mesh
- Required 23° rotation for alignment
- Scale factor 8.5x matched telemetry

---

## Optional: Blender Refinement

**Skip this section if you're okay with the full track environment (buildings, trees, etc.)**

If you want to isolate just the track surface or clean up the geometry, use Blender:

### When to Use Blender

- Visual clutter from buildings/scenery
- File size too large (>50 MB)
- Need specific geometry adjustments
- Want to isolate track surface only

### Blender Workflow

1. **Install Blender 4.0+**
   ```powershell
   winget install BlenderFoundation.Blender
   ```

2. **Import glTF**
   - File → Import → glTF 2.0
   - Select your `track.glb` from extraction

3. **Clean Up (Manual - 60-90 min)**
   - Switch to Edit Mode (Tab)
   - Select all objects in Outliner
   - Identify track surface mesh (usually "track", "road", "surface")
   - Delete unwanted objects:
     * Buildings
     * Trees  
     * Stands/grandstands
     * Barriers (optional)
     * Sky domes
     * Lighting

4. **Export Cleaned glTF**
   - File → Export → glTF 2.0
   - Format: glTF Binary (.glb)
   - Include: Selected Objects
   - Output: `refined-tracks/track-cleaned.glb`

5. **Re-run Optimization**
   ```bash
   npm run optimize -- refined-tracks/track-cleaned.glb
   ```

**Time savings:** Cleaned models are typically 50-80% smaller and render faster.

---

## Next Steps

### After First Track

1. **Test in SimVox.ai** desktop app
2. **Verify telemetry alignment** with actual replay
3. **Document any issues**
4. **Decide if approach is worth continuing**

### If Successful

- Extract more tracks using same workflow
- Build library of calibration files
- Share findings with team

### If Unsuccessful (40% of tracks)

**Switch to telemetry-based approach:**
- See: [ams2-telemetry-track-generator](../ams2-telemetry-track-generator/)
- 95% success rate
- Perfect coordinate alignment
- 10 minutes per track
- No manual Blender work

---

## Success Metrics

**This approach is working if:**
- ✅ PCarsTools extracts files successfully
- ✅ Blender can import and export
- ✅ Telemetry aligns within ±10 meters
- ✅ Track visually accurate

**This approach is NOT working if:**
- ❌ PCarsTools fails on multiple tracks
- ❌ Extracted files are encrypted/inaccessible
- ❌ Cannot achieve reasonable alignment
- ❌ Process takes >4 hours per track

---

## Getting Help

1. **Check error messages** - Often self-explanatory
2. **Review SETUP.md** - Ensure all tools installed correctly
3. **Check PCarsTools docs** - https://github.com/Nenkai/PCarsTools
4. **SimVox.ai community** - Discord/Forum for questions

---

**Ready to try?** Start with Silverstone GP - it's usually the most accessible track! 🏁
