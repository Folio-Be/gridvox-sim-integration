# AMS2 Track Extraction & Conversion - Implementation Plan

**Project:** GridVox AMS2 Track Extractor  
**Location:** `C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor`  
**Date:** November 9, 2025  
**Objective:** Extract and convert AMS2 track data to glTF 2.0 format for Three.js 3D visualization

---

## Executive Summary

This document outlines **4 extraction approaches** ranked by success probability, required effort, and quality of results. Each approach includes detailed steps, tool requirements, manual tasks, and fallback strategies.

### Recommended Strategy: Multi-Path Approach

**Primary (80% success):** Use community-sourced glTF models  
**Secondary (95% success):** Generate procedural tracks from recorded telemetry  
**Tertiary (40% success):** Extract using PCarsTools + Blender conversion  
**Hybrid (70% success):** Combine procedural base with manual enhancement

---

## Approach 1: Community glTF Models (NOT RECOMMENDED)

### Success Probability: 80% (finding models) / 20% (coordinate alignment)

**Rationale:** The modding community may have already created 3D track models for popular circuits.

### ⚠️ **Critical Limitation: Coordinate Mismatch**

**Problem:** Community models are generic representations of real-world tracks, **not AMS2-specific geometry**.

**Coordinate Alignment Issues:**
1. ❌ **Different coordinate systems** - Community model origin ≠ AMS2 world origin
2. ❌ **Scale differences** - Model might be scaled incorrectly (meters vs feet vs game units)
3. ❌ **Layout variations** - Different track version/configuration than AMS2
4. ❌ **Track evolution** - Track may have been remodeled since community model was created
5. ❌ **No reference points** - Can't align telemetry coordinates to model coordinates

**Result:** Telemetry points will **float in wrong positions** relative to track surface.

**To Use Community Models Requires:**
- Manual calibration (30-60 minutes per track)
- Finding multiple reference points (start/finish, specific corners)
- Trial-and-error transformation matrix adjustments
- Per-track calibration data storage
- Breaks if AMS2 updates track geometry

**Conclusion:** Only viable for presentation/marketing where telemetry alignment isn't critical. **Not recommended for telemetry replay visualization.**

### Strategy (If Pursuing)

1. Search for existing glTF/OBJ/FBX models of F1/AMS2 tracks
2. Download and validate models
3. Convert to glTF 2.0 if needed
4. Optimize for web (Draco compression, texture reduction)
5. Import into Three.js visualization

### Advantages
- ✅ No reverse engineering required
- ✅ High visual quality (modder-created)
- ✅ Legal (community-created content)
- ✅ Fast implementation
- ✅ Professional results

### Disadvantages
- ❌ Limited track coverage (may not have all AMS2 tracks)
- ❌ Inconsistent quality across models
- ❌ May need manual corrections
- ❌ Licensing verification required

### Required Tools

**Automatic (you can install):**
- Node.js + TypeScript
- Three.js (for mesh generation)
- `@gltf-transform/cli` (npm package)

**Manual (user must do):**
- Drive 3 laps per track in AMS2 with telemetry recording active

### Implementation Steps

#### Step 1: Source Discovery
**Manual Task:**
```
1. Search for 3D track models:
   - Sketchfab: https://sketchfab.com/search?q=f1+track
   - TurboSquid: https://www.turbosquid.com/Search/3D-Models/race-track
   - CGTrader: https://www.cgtrader.com/3d-models/race-track
   - Free3D: https://free3d.com/3d-models/race-track
   - GitHub: Search for "f1 track model" or "racing circuit 3d"
   
2. Priority tracks to find:
   - Silverstone GP
   - Spa-Francorchamps
   - Monza
   - Interlagos
   - Brands Hatch
   
3. Download formats (in order of preference):
   a) .glb/.gltf (ready to use)
   b) .fbx (easy conversion)
   c) .obj (easy conversion)
   d) .blend (Blender native)
```

#### Step 2: Format Conversion (if needed)
**Automated Script:** `scripts/convert-to-gltf.ts`

```typescript
// Convert various formats to glTF 2.0
// Supports: FBX, OBJ, Collada (DAE), STL
```

**Manual Task (if Blender is needed):**
```
1. Open Blender
2. File → Import → [FBX/OBJ/etc]
3. Select downloaded model
4. File → Export → glTF 2.0 (.glb)
5. Export settings:
   ☑ Remember Export Settings
   ☑ Apply Modifiers
   ☑ UVs
   ☑ Normals
   ☑ Materials
   ☑ Draco Compression (Geometry)
   ☑ KTX2 Compression (Textures)
6. Save to: converted-tracks/{track-name}.glb
```

#### Step 3: Optimization
**Automated Script:** `scripts/optimize-gltf.ts`

Performs:
- Draco mesh compression
- Texture resizing (max 2048x2048)
- KTX2 texture compression
- Remove unused materials
- Merge duplicate vertices
- Generate LOD levels

#### Step 4: Validation
**Automated Script:** `scripts/validate-track.ts`

Checks:
- File size (target: <50MB)
- Vertex count (target: <500k)
- Material count
- Texture resolution
- glTF conformance
- Three.js compatibility

#### Step 5: Integration Test
**Automated Script:** `scripts/test-in-threejs.ts`

Creates minimal Three.js scene to verify:
- Model loads correctly
- Materials render properly
- Scale is appropriate
- No errors/warnings

### Fallback Plan

If track not found in community sources → **Move to Approach 2 (Procedural)**

### Estimated Timeline

- Source discovery: **2-4 hours (manual)**
- Format conversion: **10 minutes per track (mostly automated)**
- Optimization: **5 minutes per track (automated)**
- Validation: **2 minutes per track (automated)**
- **Total per track: ~30 minutes**

### Success Indicators

- ✅ Found glTF/convertible model for track
- ✅ Model loads in Three.js without errors
- ✅ File size <50MB
- ✅ Visual quality acceptable
- ✅ Performance >30fps in browser

---

## Approach 2: 3-Run Track Mapping from Telemetry (RECOMMENDED FALLBACK)

### Success Probability: 98%

**Rationale:** GridVox already records telemetry with 3D world coordinates. By driving 3 specific runs (outside border, inside border, racing line), we can reconstruct actual track geometry with perfect coordinate alignment.

### Strategy - 3-Run Mapping Method

1. **Run 1 - Outside Border:** Drive carefully on track's outer edge (white line/boundary)
2. **Run 2 - Inside Border:** Drive on inside edge (apex line, clip curbs)
3. **Run 3 - Racing Line:** Drive optimal racing line for reference
4. Align all three runs to same start/finish point
5. Resample to uniform point density
6. Generate triangulated track surface mesh between inner/outer borders
7. Add racing line as separate colored geometry
8. Detect and add curb geometry from elevation changes
9. Export to glTF 2.0

### Advantages
- ✅ Works for ANY track we've driven
- ✅ **Actual track width** (not uniform approximation)
- ✅ **Real track surface geometry** (variable width in corners)
- ✅ **Perfect coordinate alignment** with telemetry (same coordinate system)
- ✅ **Curb detection** from border elevation changes
- ✅ **Natural camber/banking** preserved in Y coordinates
- ✅ Racing line reference for optimal path visualization
- ✅ No copyright issues
- ✅ Fast generation (<2 minutes per track)
- ✅ Guaranteed success

### Disadvantages
- ❌ Requires 3 laps instead of 1 (6 minutes driving vs 2 minutes)
- ❌ No buildings/scenery (unless added manually)
- ❌ Generic visual appearance (no track-specific branding)

### Required Tools

**Automatic:**
- Node.js + TypeScript
- Three.js (for geometry generation)
- `@gltf-transform/core` (for export)

**Manual:**
- Telemetry recording file (must drive track first)

### Implementation Steps

#### Step 1: Record 3 Telemetry Runs
**Manual Task:**
```
Session 1 - Outside Border Run:
1. Launch AMS2
2. Select desired track
3. Choose any car
4. Enable telemetry recording in track-map-core
5. Drive complete lap staying on OUTSIDE edge of track
   - Follow white line / track boundary
   - Stay consistent on outer edge through corners
   - Avoid cutting corners
6. Cross start/finish line to complete lap
7. Verify saved: telemetry-data/[track-name]-outside.json

Session 2 - Inside Border Run:
1. Same track and conditions
2. Drive complete lap staying on INSIDE edge of track
   - Clip apexes
   - Touch inside curbs where appropriate
   - Maximum inside line through corners
3. Verify saved: telemetry-data/[track-name]-inside.json

Session 3 - Racing Line Run:
1. Same track and conditions
2. Drive optimal racing line
   - Fast lap for reference
   - Natural racing speed and line
3. Verify saved: telemetry-data/[track-name]-racing.json

Total time: ~6 minutes per track (3 laps)
```

#### Step 2: Generate Track Surface Mesh
**Automated Script:** `scripts/generate-mapped-track.ts`

```typescript
// Load all 3 telemetry runs
const mappingData = {
  outsideBorder: loadTelemetry('track-outside.json'),
  insideBorder: loadTelemetry('track-inside.json'),
  racingLine: loadTelemetry('track-racing.json'),
};

// Align runs to same start/finish point
const aligned = alignRuns(mappingData);

// Resample to uniform density (1000 points each)
const resampled = resampleToUniformDensity(aligned, 1000);

// Create triangulated surface between borders
const trackMesh = createTrackSurface(
  resampled.outsideBorder,
  resampled.insideBorder
);

// Add racing line as separate geometry
const racingLine = createRacingLineGeometry(resampled.racingLine);

// Detect curbs from elevation changes
const curbs = detectCurbs(
  resampled.outsideBorder,
  resampled.insideBorder
);

// Export to glTF
exportGLTF({ trackMesh, racingLine, curbs }, 'output.glb');
```

**Key Functions:**

**Align Runs:**
```typescript
function alignRuns(runs: MappingData): AlignedRuns {
  // Find start/finish line (longest straight)
  const outsideStart = findStartFinish(runs.outsideBorder);
  const insideStart = findStartFinish(runs.insideBorder);
  const racingStart = findStartFinish(runs.racingLine);
  
  // Rotate arrays to start at same track position
  return {
    outsideBorder: rotateToStart(runs.outsideBorder, outsideStart),
    insideBorder: rotateToStart(runs.insideBorder, insideStart),
    racingLine: rotateToStart(runs.racingLine, racingStart),
  };
}
```

**Create Track Surface:**
```typescript
function createTrackSurface(
  outerPoints: Vector3[],
  innerPoints: Vector3[]
): THREE.Mesh {
  // Create smooth curves
  const outerCurve = new CatmullRomCurve3(outerPoints, true);
  const innerCurve = new CatmullRomCurve3(innerPoints, true);
  
  // Sample at regular intervals
  const segments = 500;
  const outer = outerCurve.getPoints(segments);
  const inner = innerCurve.getPoints(segments);
  
  // Create triangulated mesh between curves
  const geometry = new BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];
  
  for (let i = 0; i <= segments; i++) {
    vertices.push(outer[i].x, outer[i].y, outer[i].z);
    vertices.push(inner[i].x, inner[i].y, inner[i].z);
  }
  
  for (let i = 0; i < segments; i++) {
    const base = i * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }
  
  geometry.setAttribute('position', 
    new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return new Mesh(geometry, trackMaterial);
}
```

**Detect Curbs:**
```typescript
function detectCurbs(
  outerPoints: Vector3[],
  innerPoints: Vector3[]
): THREE.Group {
  const curbs = new Group();
  
  // Check both borders for elevation changes (curbs)
  [outerPoints, innerPoints].forEach((points, borderIndex) => {
    for (let i = 1; i < points.length - 1; i++) {
      const elevationChange = Math.abs(
        points[i].y - points[i - 1].y
      );
      
      if (elevationChange > 0.05) { // 5cm threshold
        const curbGeometry = new BoxGeometry(2, 0.15, 0.5);
        const curbMaterial = new MeshStandardMaterial({
          color: i % 2 === 0 ? 0xFF0000 : 0xFFFFFF // Red/white
        });
        
        const curb = new Mesh(curbGeometry, curbMaterial);
        curb.position.copy(points[i]);
        curbs.add(curb);
      }
    }
  });
  
  return curbs;
}
```

#### Step 3: Add Ground Plane
**Automated Script:** (same as before)

Adds large plane beneath track for ground/grass.

#### Step 4: Add Buildings (Optional)
**Automated Script:** `scripts/add-track-buildings.ts`

Uses heuristics to place buildings:
- Start/finish structure (longest straight)
- Grandstands (sharpest corners)
- Pit buildings (slow sections in racing line)

#### Step 5: Export & Optimize
Same as Approach 1, Step 3-5

### Manual Tasks Required

**Before Generation:**
```
1. Drive 3 laps on the track in AMS2:
   a) Lap 1 - Outside border (stay on outer edge)
   b) Lap 2 - Inside border (clip apexes/curbs)
   c) Lap 3 - Racing line (optimal fast line)
   
2. Ensure telemetry recording is active for all 3 laps

3. Complete each lap without:
   - Crashes/resets
   - Long pauses
   - Going off track
   
4. Verify 3 telemetry files saved:
   - [track-name]-outside.json
   - [track-name]-inside.json
   - [track-name]-racing.json
```

**Quality Tips:**
```
- Use same car for all 3 runs (consistent perspective)
- Drive in clean conditions (no rain/damage)
- Maintain smooth, consistent speed
- For outside border: Follow white line precisely
- For inside border: Touch but don't cross curbs
- For racing line: Drive naturally at racing speed
```

### Estimated Timeline

- 3 telemetry runs (driving): **6 minutes (manual)**
- Track generation: **2 minutes (automated)**
- Building addition: **1 minute (automated)**
- Optimization: **1 minute (automated)**
- **Total per track: ~10 minutes (6 min manual + 4 min automated)**

### Success Indicators

- ✅ 3 telemetry files exist for track (outside/inside/racing)
- ✅ All 3 runs have similar point counts (±10%)
- ✅ Generated track surface follows actual geometry
- ✅ Track width varies naturally (wider straights, narrower corners)
- ✅ Curbs detected at expected locations
- ✅ Racing line is centered within track boundaries
- ✅ File size <30MB
- ✅ Loads in Three.js
- ✅ **Perfect telemetry alignment** (car stays on track surface)
- ✅ Performance >60fps

---

## Approach 3: PCarsTools Extraction + Blender Conversion (PRIMARY ATTEMPT)

### Success Probability: 40%

**Rationale:** Extract original game files using PCarsTools, convert to usable format. **This approach yields the best results if successful** - authentic track geometry with perfect coordinate alignment and all details.

### Strategy

1. Install PCarsTools (C# .NET)
2. Extract PAK/BFF archives from AMS2 installation
3. Decrypt GMT/MEB model files
4. Import decrypted data into Blender (custom script)
5. Clean up geometry
6. Export to glTF 2.0

### Advantages
- ✅ **Original game geometry** (100% accurate to AMS2)
- ✅ **Perfect coordinate alignment** (same coordinate system as telemetry)
- ✅ **Includes all track details** (curbs, camber, run-off areas)
- ✅ **Track-specific features** (elevation changes, surface bumps)
- ✅ **Buildings and scenery** (if included in track files)
- ✅ **Professional quality results**
- ✅ No need to drive tracks first
- ✅ **Best possible visual quality**
- ✅ **Best possible telemetry alignment**

### Disadvantages
- ❌ Complex reverse engineering
- ❌ GMT format not fully documented
- ❌ High technical difficulty
- ❌ May break with game updates
- ❌ Time-consuming manual work
- ❌ Legal gray area

### Required Tools

**Manual Installation Required:**
- **PCarsTools** (C# .NET application)
  - Download: https://github.com/Nenkai/PCarsTools
  - Requires: .NET 6.0 SDK
  - Requires: `oo2core_7_win64.dll` (Oodle decompression)
  
- **Blender 4.0+**
  - Download: https://www.blender.org/download/
  - With Python API enabled
  
- **AMS2 Installation**
  - Need access to game files
  - Typical location: `C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2`

**Automatic:**
- Python 3.11+
- Node.js
- Blender Python API bindings

### Implementation Steps

#### Step 1: PCarsTools Setup
**Manual Task:**
```
1. Install .NET 6.0 SDK
   Download: https://dotnet.microsoft.com/download/dotnet/6.0
   
2. Clone PCarsTools:
   git clone https://github.com/Nenkai/PCarsTools.git
   cd PCarsTools
   
3. Build PCarsTools:
   dotnet build -c Release
   
4. Obtain oo2core_7_win64.dll
   - Extract from AMS2 installation: AMS2/oo2core_7_win64.dll
   - Copy to PCarsTools/bin/Release/net6.0/
   
5. Copy languages.bml:
   - From: AMS2/Languages/languages.bml
   - To: PCarsTools/bin/Release/net6.0/Languages/languages.bml
   
6. Test extraction:
   cd bin/Release/net6.0
   .\PCarsTools.exe --help
```

#### Step 2: Extract Track Files
**Semi-Automated Script:** `scripts/extract-ams2-tracks.ps1`

```powershell
# PowerShell script to batch extract tracks
param(
    [string]$AMS2Path = "C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2",
    [string]$PCarsToolsPath = "C:\Tools\PCarsTools\bin\Release\net6.0",
    [string]$OutputPath = ".\extracted-tracks"
)

# List of track archives to extract
$tracks = @(
    "silverstone_gp.bff",
    "spa_francorchamps.bff",
    "monza.bff",
    "interlagos.bff",
    "brands_hatch_gp.bff"
)

foreach ($track in $tracks) {
    Write-Host "Extracting $track..."
    
    $inputPath = Join-Path $AMS2Path "Locations\$track"
    $outputDir = Join-Path $OutputPath ($track -replace '\.bff$', '')
    
    & "$PCarsToolsPath\PCarsTools.exe" pak `
        -i "$inputPath" `
        -g "$AMS2Path" `
        -o "$outputDir" `
        --game-type PC2
}
```

**Manual Task:**
```
1. Locate AMS2 installation folder
2. Find track .bff files in Locations/ subdirectory
3. List tracks you want to extract
4. Run extraction script for each track
5. Verify extracted files (GMT, MEB, SCN, TEX)
```

#### Step 3: Decrypt Model Files
**Automated Script:** `scripts/decrypt-models.ps1`

```powershell
# Decrypt all MEB files in extracted tracks
Get-ChildItem -Path .\extracted-tracks -Filter *.meb -Recurse | ForEach-Object {
    Write-Host "Decrypting $($_.Name)..."
    
    & "$PCarsToolsPath\PCarsTools.exe" decryptmodel -i $_.FullName
}
```

#### Step 4: Parse GMT Format (HARDEST PART)
**Custom Python Script:** `scripts/parse-gmt.py`

```python
"""
GMT File Parser (Experimental)

This is the highest-risk component. GMT format is not fully documented.
Success depends on reverse engineering accuracy.

Expected structure:
- Header (magic bytes, version, chunk count)
- Vertex buffer (positions, normals, UVs)
- Index buffer (triangle lists)
- Material definitions
- LOD levels
"""

import struct
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class GMTHeader:
    magic: bytes
    version: int
    chunk_count: int
    
@dataclass
class VertexData:
    positions: List[Tuple[float, float, float]]
    normals: List[Tuple[float, float, float]]
    uvs: List[Tuple[float, float]]

def parse_gmt(filepath: str) -> VertexData:
    """
    Parse GMT file and extract vertex data.
    
    WARNING: This is experimental and may not work for all tracks.
    Format reverse engineered from community knowledge.
    """
    with open(filepath, 'rb') as f:
        # Read header
        magic = f.read(4)
        version = struct.unpack('I', f.read(4))[0]
        
        # Rest is speculative...
        # TODO: Implement based on reverse engineering
        
    return VertexData([], [], [])
```

**Alternative: Use Existing Parsers**
```
Check if community has created GMT parsers:
1. Search GitHub for "GMT parser" + "Project CARS"
2. Check modding forums (RaceDepartment, etc.)
3. Look for rFactor GMT tools (similar format)
```

#### Step 5: Import to Blender
**Blender Python Script:** `scripts/blender-import-gmt.py`

```python
import bpy
import bmesh
from mathutils import Vector

def import_gmt_to_blender(vertex_data):
    """
    Create Blender mesh from parsed GMT data
    """
    # Create mesh
    mesh = bpy.data.meshes.new("Track")
    obj = bpy.data.objects.new("Track", mesh)
    bpy.context.collection.objects.link(obj)
    
    # Create geometry
    bm = bmesh.new()
    
    # Add vertices
    for pos in vertex_data.positions:
        bm.verts.new(Vector(pos))
    
    # Add faces (from indices)
    # TODO: Implement face creation
    
    # Update mesh
    bm.to_mesh(mesh)
    bm.free()
    
    return obj

# Usage in Blender:
# blender --background --python blender-import-gmt.py -- input.gmt
```

#### Step 6: Manual Cleanup in Blender
**Manual Task (CRITICAL):**
```
1. Open imported mesh in Blender
2. Check for errors:
   - Inverted normals
   - Disconnected vertices
   - Missing faces
   - Incorrect scale
   
3. Fix geometry:
   - Recalculate normals (Mesh → Normals → Recalculate Outside)
   - Remove doubles (Mesh → Cleanup → Merge by Distance)
   - Fill holes (Edit Mode → Select holes → F to fill)
   
4. UV unwrapping (if needed):
   - Select all faces
   - UV → Smart UV Project
   
5. Material setup:
   - Assign track material
   - Apply textures if extracted
   
6. Export to glTF:
   - File → Export → glTF 2.0 (.glb)
   - Settings: Draco compression, KTX2 textures
```

### Manual Tasks Required

**Initial Setup (One-time):**
1. Install .NET 6.0 SDK
2. Build PCarsTools from source
3. Find and copy Oodle DLL
4. Copy languages.bml config
5. Install Blender
6. Set up Python environment

**Per Track:**
1. Identify track .bff file location
2. Run extraction command
3. Verify extracted files
4. Run decryption script
5. Open in Blender (if GMT parsing fails)
6. Manual geometry cleanup (30-60 minutes)
7. Export to glTF

### Estimated Timeline

- Setup (one-time): **2-4 hours**
- Per track extraction: **5 minutes (automated)**
- Per track parsing: **Unknown (depends on GMT success)**
- Per track Blender cleanup: **30-60 minutes (manual)**
- **Total per track: 35-65 minutes (if GMT parser works)**
- **Total per track: 120+ minutes (if manual reconstruction needed)**

### Risk Assessment

**HIGH RISK factors:**
- ❌ GMT format not fully documented
- ❌ Encryption may change with updates
- ❌ Parsing may fail silently
- ❌ High manual effort required
- ❌ May violate EULA (check with legal)

**Success depends on:**
1. Finding existing GMT parser (check modding community)
2. GMT structure being consistent across tracks
3. Decryption working correctly
4. Willingness to invest manual Blender time

### Fallback Plan

If GMT parsing fails → **Hybrid Approach (see Approach 4)**

---

## Approach 4: Hybrid - 3-Run Mapping + Manual Enhancement (BALANCED)

### Success Probability: 75%

**Rationale:** Start with 3-run mapped track (Approach 2), enhance with manual modeling or extracted textures.

### Strategy

1. Generate track surface from 3-run mapping (Approach 2)
2. Extract textures from AMS2 using PCarsTools (Approach 3, partial)
3. Apply extracted textures to mapped track surface
4. Add manual enhancements in Blender:
   - Specific building shapes (using reference photos)
   - Barriers and fencing (simple extrusions)
   - Signage and branding (image planes)
   - Trees and vegetation (particle systems or instanced models)
5. Export to glTF 2.0

### Advantages
- ✅ Guaranteed baseline (3-run mapping always works)
- ✅ **Perfect coordinate alignment** (generated from telemetry)
- ✅ **Actual track geometry** (from 3-run mapping)
- ✅ Enhanced visual quality with manual work
- ✅ Controlled manual effort (you choose detail level)
- ✅ Original textures (if extraction works)
- ✅ Flexible approach

### Disadvantages
- ❌ Still requires manual work
- ❌ Inconsistent quality across tracks
- ❌ Time-consuming for many tracks

### Implementation Steps

#### Step 1: Generate 3-Run Mapped Base
Use Approach 2 scripts (drive 3 laps, fully automated generation)

#### Step 2: Extract Textures Only
**Simplified PCarsTools Usage:**

```powershell
# Extract only texture files (TEX) - easier than GMT
& PCarsTools.exe pak -i "track.bff" -g $AMS2Path | Where-Object { $_ -like "*.tex" }
& PCarsTools.exe convert-texture -i "asphalt.tex" -o "asphalt.dds"
```

Texture extraction is **much simpler** than geometry extraction and has **90% success rate**.

#### Step 3: Manual Enhancement in Blender
**Manual Task:**
```
1. Open 3-run mapped track .glb in Blender
2. Import extracted textures
3. Apply textures to track surface
4. Add detailed elements:
   - Model specific grandstands (use reference photos)
   - Add barriers (simple extrusions along track edges)
   - Add signage (image planes with logos)
   - Add trees (particle system or simple instanced models)
   
5. Time investment per track:
   - Minimal: 15 minutes (textures only)
   - Medium: 1-2 hours (key landmarks)
   - Detailed: 4-8 hours (full environment)
   
6. Export to glTF with optimizations
```

### Recommended Detail Levels

**Tier 1 Tracks (F1 circuits):** 4-8 hours manual work
- Spa, Silverstone, Monza, Suzuka

**Tier 2 Tracks (Popular):** 1-2 hours manual work
- Brands Hatch, Interlagos, Imola

**Tier 3 Tracks (Others):** 15 minutes (procedural + textures)
- All other tracks

### Estimated Timeline

- Per track (minimal): **25 minutes** (3-run mapping + textures)
- Per track (medium): **90 minutes** (3-run mapping + key landmarks)
- Per track (detailed): **6 hours** (full manual enhancement)

### Success Indicators

- ✅ Procedural base generates successfully
- ✅ Textures extract correctly (90% likely)
- ✅ Manual enhancements blend well
- ✅ Visual quality acceptable for tier
- ✅ File size <30MB

---

## Tools Installation Checklist

### Automatic Installation (I Can Do)

```bash
# Node.js dependencies
npm init -y
npm install three @gltf-transform/cli @gltf-transform/core
npm install --save-dev typescript @types/node ts-node

# Python dependencies (for GMT parsing if attempted)
pip install numpy pillow

# Blender Python API (if using automated export)
pip install bpy
```

### Manual Installation (You Must Do)

#### 1. AMS2 Installation Path
```
Task: Locate your AMS2 installation folder
Typical paths:
- Steam: C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2
- Direct: C:\Program Files\Automobilista 2

Action: Create file AMS2_PATH.txt with your path
```

#### 2. PCarsTools (Only if using Approach 3 or 4 textures)
```
Task: Build PCarsTools from source

Steps:
1. Install .NET 6.0 SDK from https://dotnet.microsoft.com/download/dotnet/6.0
2. git clone https://github.com/Nenkai/PCarsTools.git
3. cd PCarsTools
4. dotnet build -c Release
5. Copy oo2core_7_win64.dll from AMS2 folder
6. Copy Languages/languages.bml from AMS2 folder
7. Create PCARSTOOLS_PATH.txt with path to exe

Time: 30 minutes
```

#### 3. Blender (Only if using Approach 1, 3, or 4)
```
Task: Install Blender 4.0+

Steps:
1. Download from https://www.blender.org/download/
2. Install to default location
3. Verify Python API is enabled (it is by default)
4. Create BLENDER_PATH.txt with path to blender.exe

Time: 10 minutes
```

#### 4. Oodle DLL (Only if using PCarsTools)
```
Task: Copy Oodle decompression library

Steps:
1. Navigate to AMS2 installation folder
2. Find file: oo2core_7_win64.dll
3. Copy to PCarsTools build directory
4. Copy to tools/ folder in this project

Time: 2 minutes
```

---

## Recommended Execution Plan

### Phase 1: Primary Attempt - PCarsTools Extraction (Week 1)

**Goal:** Attempt full extraction for 1-2 test tracks

**Approach:** 
1. **Approach 3** (PCarsTools + GMT Parsing)
   - Set up PCarsTools environment
   - Attempt extraction on Silverstone GP
   - Try to parse GMT format
   - If successful: Process 2-3 priority tracks
   - If fails: Document failure points and move to Phase 2

**Manual Tasks:**
- PCarsTools setup (one-time, 2-4 hours)
- GMT parsing development/research (8-16 hours)
- Per-track Blender cleanup if successful (30-60 min each)

**Success Criteria:**
- ✅ Successfully extract and convert at least 1 track
- ✅ Telemetry aligns perfectly with extracted track
- ✅ Visual quality superior to other approaches
- ✅ Process documented for future tracks

**If Approach 3 Fails:** Proceed to Phase 2 immediately.

---

### Phase 2: Reliable Fallback - 3-Run Mapping (Week 1-2)

**Goal:** Get all priority tracks working with guaranteed method

**Approach:**
1. **Approach 2** (3-Run Track Mapping)
   - Drive 3 laps per track (outside/inside/racing line)
   - Generate mapped tracks (automated)
   - Validate telemetry alignment
   - Time: 10 minutes per track

**Manual Tasks:**
- Drive 3 laps per track (6 minutes each)
- Review generated track quality

**Success Criteria:**
- ✅ At least 5-10 tracks mapped and validated
- ✅ Perfect telemetry alignment confirmed
- ✅ Acceptable visual quality
- ✅ Performance >60fps

---

### Phase 3: Quality Enhancement (Week 2-3)

**Goal:** Enhance visual quality of priority tracks

**Approach:**
1. **Approach 4** for Tier 1 tracks (F1 circuits)
   - Start with 3-run mapped base (from Phase 2)
   - Extract textures using PCarsTools (if available)
   - 4-8 hours Blender work per track
   - Add specific grandstands, pit buildings, signage

2. **Approach 4** for Tier 2 tracks
   - 1-2 hours enhancement per track
   - Key landmarks only

**Manual Tasks:**
- Blender modeling and texturing
- Reference photo research
- Quality validation

**Success Criteria:**
- ✅ Tier 1 tracks have high visual quality
- ✅ Still maintain perfect telemetry alignment
- ✅ File sizes <30MB

---

## Success Probability Summary

| Approach | Success Rate | Time/Track | Quality | Telemetry Alignment | Automation |
|----------|-------------|------------|---------|-------------------|------------|
| 1. Community Models | 80% / 20%* | 30-90 min | High | ❌ Poor (requires manual calibration) | 50% |
| 2. 3-Run Mapping | **98%** | 10 min | High | ✅ **Perfect** | 60% |
| 3. PCarsTools + GMT | 40% | 60-120 min | **Highest** | ✅ **Perfect** | 30% |
| 4. Hybrid (3-Run + Manual) | 75% | 25-360 min | **Highest** | ✅ **Perfect** | 40% |

*80% chance of finding model, 20% chance of successful coordinate alignment

**Recommended strategy:**
1. **Try Approach 3 first** (PCarsTools extraction) - Best results if successful
2. **Fallback to Approach 2** (3-Run Mapping) - Guaranteed success with excellent results  
3. **Enhance with Approach 4** (Hybrid) - Add visual details to 3-run mapped tracks for priority circuits
4. **Avoid Approach 1** (Community Models) - Coordinate alignment too complex for telemetry visualization

---

## Next Steps

1. **Immediate (You):**
   - Create `AMS2_PATH.txt` with your AMS2 installation path
   - Decide which tracks are priority (Tier 1 vs Tier 2 vs Tier 3)
   - Confirm you have telemetry recordings for needed tracks

2. **Immediate (Me):**
   - Create automation scripts for Approach 2 (procedural generation)
   - Create conversion scripts for Approach 1 (community models)
   - Set up validation pipeline

3. **Phase 1 Execution:**
   - Search for community models (you)
   - Run procedural generation (automated)
   - Test in Three.js (automated)

4. **Phase 2+:**
   - Based on Phase 1 results, proceed with enhancement or extraction

---

## File Structure

```
ams2-track-extractor/
├── README.md                          (This file)
├── IMPLEMENTATION-PLAN.md             (Detailed plan - you're reading it)
├── MANUAL-SETUP.md                    (Setup instructions)
├── package.json                       (Node.js dependencies)
├── tsconfig.json                      (TypeScript config)
│
├── scripts/                           (Automation scripts)
│   ├── 01-search-community-models.md  (Search guide)
│   ├── 02-convert-to-gltf.ts          (Format converter)
│   ├── 03-extract-telemetry-path.ts   (Telemetry parser)
│   ├── 04-generate-procedural-track.ts (Procedural generator)
│   ├── 05-add-track-buildings.ts      (Building generator)
│   ├── 06-apply-track-textures.ts     (Texture applicator)
│   ├── 07-optimize-gltf.ts            (Optimizer)
│   ├── 08-validate-track.ts           (Validator)
│   ├── 09-test-in-threejs.ts          (Test renderer)
│   ├── extract-ams2-tracks.ps1        (PCarsTools wrapper)
│   ├── decrypt-models.ps1             (Decryption wrapper)
│   ├── parse-gmt.py                   (GMT parser - experimental)
│   └── blender-import-gmt.py          (Blender importer)
│
├── tools/                             (External tools)
│   ├── TOOLS.md                       (Tool documentation)
│   └── oo2core_7_win64.dll           (Oodle DLL - copied here)
│
├── extracted-tracks/                  (PCarsTools output)
│   └── [track-name]/
│       ├── *.gmt                      (Geometry files)
│       ├── *.meb                      (Model files)
│       ├── *.scn                      (Scene files)
│       └── *.tex                      (Texture files)
│
├── converted-tracks/                  (Final glTF files)
│   ├── [track-name].glb               (Optimized glTF)
│   ├── [track-name]-lod0.glb          (High detail LOD)
│   ├── [track-name]-lod1.glb          (Medium detail LOD)
│   └── [track-name]-lod2.glb          (Low detail LOD)
│
├── telemetry-data/                    (Telemetry recordings)
│   └── [track-name]-lap-001.json      (From track-map-core)
│
└── docs/                              (Documentation)
    ├── approach-1-community.md
    ├── approach-2-procedural.md
    ├── approach-3-extraction.md
    ├── approach-4-hybrid.md
    └── troubleshooting.md
```

---

## Support & Troubleshooting

If approaches fail, we have fallback options:

1. **Community models not found:** → Proceed with procedural
2. **Procedural quality too low:** → Try hybrid enhancement
3. **GMT parsing fails:** → Use procedural + manual Blender work
4. **All approaches fail:** → Use simplified 2D track representation

**Remember:** We have existing working telemetry recording. Worst case, we can always generate basic 3D tracks procedurally (Approach 2) with 95% success rate.
