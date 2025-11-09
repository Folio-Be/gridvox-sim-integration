# Manual Setup Guide

**Project:** AMS2 Track Extractor  
**Purpose:** Step-by-step instructions for manual installation tasks

---

## Overview

This guide covers all manual setup tasks that cannot be automated. Each section includes:
- Why it's needed
- Step-by-step instructions
- Verification steps
- Troubleshooting tips

---

## Setup Tasks by Approach

| Approach | Required Tasks |
|----------|----------------|
| **1. Community Models** | None (fully automated) |
| **2. Procedural Tracks** | Drive tracks to record telemetry |
| **3. PCarsTools Extraction** | All tasks below |
| **4. Hybrid** | Tasks 1-3 only |

---

## Task 1: Locate AMS2 Installation

**Why needed:** To access track files and game data  
**Required for:** Approaches 3, 4  
**Time required:** 5 minutes

### Instructions

#### Option A: Steam Installation

1. Open Steam client
2. Right-click "Automobilista 2" in library
3. Select "Properties"
4. Go to "Local Files" tab
5. Click "Browse Local Files"
6. Copy the path from Windows Explorer address bar

**Typical path:**
```
C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2
```

#### Option B: Manual Search

1. Open Windows Explorer
2. Search for: `Automobilista2.exe`
3. Right-click the file when found
4. Select "Open file location"
5. Copy the folder path

### Record the Path

Create file: `C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor\AMS2_PATH.txt`

Contents:
```
C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2
```

### Verification

Check that this folder contains:
- `Automobilista2.exe`
- `Locations/` folder (track archives)
- `Languages/` folder
- `oo2core_7_win64.dll`

If any missing → Wrong folder, search again

---

## Task 2: Install .NET 6.0 SDK

**Why needed:** To build and run PCarsTools (C# application)  
**Required for:** Approaches 3, 4 (texture extraction)  
**Time required:** 10 minutes

### Instructions

1. Visit: https://dotnet.microsoft.com/download/dotnet/6.0

2. Download: **.NET 6.0 SDK** (not Runtime)
   - Windows x64 installer
   - File size: ~180 MB

3. Run installer:
   - Accept license agreement
   - Use default installation path
   - Wait for installation to complete

4. Verify installation:
   ```powershell
   dotnet --version
   ```
   Expected output: `6.0.x` or higher

### Troubleshooting

**"dotnet not recognized":**
- Close and reopen PowerShell/Terminal
- Or restart VS Code
- Or add to PATH manually: `C:\Program Files\dotnet`

**Wrong version installed:**
- You may have .NET 8.0 or newer
- This is fine, it's backward compatible
- Just ensure SDK is installed (not just runtime)

---

## Task 3: Build PCarsTools

**Why needed:** To extract and decrypt AMS2 game files  
**Required for:** Approaches 3, 4  
**Time required:** 15 minutes

### Instructions

#### Step 1: Download Source Code

```powershell
# Navigate to tools directory
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor\tools

# Clone repository
git clone https://github.com/Nenkai/PCarsTools.git

# Navigate into project
cd PCarsTools
```

**Alternative (if Git not available):**
1. Visit: https://github.com/Nenkai/PCarsTools
2. Click "Code" → "Download ZIP"
3. Extract to: `C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor\tools\PCarsTools`

#### Step 2: Build Project

```powershell
# Build in Release mode
dotnet build -c Release

# Navigate to output
cd bin\Release\net6.0
```

Expected output:
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

#### Step 3: Verify Executable

Check file exists:
```
bin\Release\net6.0\PCarsTools.exe
```

Test run:
```powershell
.\PCarsTools.exe --help
```

Expected output: Help text showing available commands

### Record the Path

Create file: `PCARSTOOLS_PATH.txt`

Contents:
```
C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor\tools\PCarsTools\bin\Release\net6.0\PCarsTools.exe
```

---

## Task 4: Copy Oodle DLL

**Why needed:** Decompresses AMS2 archive files (PAK/BFF)  
**Required for:** Approaches 3, 4  
**Time required:** 2 minutes

### Instructions

1. **Locate Oodle DLL in AMS2:**
   - Open AMS2 installation folder (from Task 1)
   - Find file: `oo2core_7_win64.dll`
   - File size: ~1 MB

2. **Copy to PCarsTools directory:**
   ```powershell
   # Replace paths as needed
   $ams2Path = "C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2"
   $pcarsPath = "C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor\tools\PCarsTools\bin\Release\net6.0"
   
   Copy-Item "$ams2Path\oo2core_7_win64.dll" -Destination "$pcarsPath\oo2core_7_win64.dll"
   ```

3. **Copy to project tools folder:**
   ```powershell
   $toolsPath = "C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor\tools"
   
   Copy-Item "$ams2Path\oo2core_7_win64.dll" -Destination "$toolsPath\oo2core_7_win64.dll"
   ```

### Verification

Check files exist:
- `tools\PCarsTools\bin\Release\net6.0\oo2core_7_win64.dll` ✓
- `tools\oo2core_7_win64.dll` ✓

Both should be identical (~1 MB)

---

## Task 5: Copy Languages Config

**Why needed:** PCarsTools needs language mappings to decode file names  
**Required for:** Approaches 3, 4  
**Time required:** 2 minutes

### Instructions

1. **Locate languages.bml in AMS2:**
   - Open AMS2 installation folder
   - Navigate to: `Languages\` subdirectory
   - Find file: `languages.bml`

2. **Create Languages folder in PCarsTools:**
   ```powershell
   $pcarsPath = "C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-track-extractor\tools\PCarsTools\bin\Release\net6.0"
   
   New-Item -Path "$pcarsPath\Languages" -ItemType Directory -Force
   ```

3. **Copy languages.bml:**
   ```powershell
   $ams2Path = "C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2"
   
   Copy-Item "$ams2Path\Languages\languages.bml" -Destination "$pcarsPath\Languages\languages.bml"
   ```

### Verification

Check file exists:
```
tools\PCarsTools\bin\Release\net6.0\Languages\languages.bml
```

File size: ~50 KB

---

## Task 6: Install Blender (Optional)

**Why needed:** For format conversion and manual enhancement  
**Required for:** Approaches 1 (sometimes), 3, 4  
**Time required:** 10 minutes

### Instructions

1. **Download Blender:**
   - Visit: https://www.blender.org/download/
   - Choose: **Blender 4.2 LTS** (or latest stable)
   - Platform: Windows (Installer or Portable)
   - File size: ~300 MB

2. **Install:**
   - Run installer
   - Use default installation path: `C:\Program Files\Blender Foundation\Blender 4.2\`
   - Create desktop shortcut (optional)
   - Install for all users (optional)

3. **First Run:**
   - Launch Blender
   - Choose layout (General recommended)
   - Close startup splash

4. **Enable glTF Add-on:**
   - Edit → Preferences
   - Add-ons tab
   - Search: "gltf"
   - Enable: "Import-Export: glTF 2.0 format"
   - Click "Save Preferences"

### Record the Path

Create file: `BLENDER_PATH.txt`

Contents:
```
C:\Program Files\Blender Foundation\Blender 4.2\blender.exe
```

### Verification

Check glTF export available:
1. In Blender: File → Export
2. Should see: "glTF 2.0 (.glb/.gltf)" in menu
3. If missing → Re-enable add-on in preferences

### Test Headless Mode (for automation)

```powershell
& "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" --background --version
```

Expected output: Blender version info

---

## Task 7: Record Telemetry (For Procedural Approach)

**Why needed:** Provides 3D path data for procedural track generation  
**Required for:** Approach 2, Approach 4  
**Time required:** 5 minutes per track

### Instructions

#### Step 1: Enable Telemetry Recording

1. Open `track-map-visualization` project
2. Ensure telemetry recording is active in `track-map-core`
3. Configure output path to: `ams2-track-extractor\telemetry-data\`

#### Step 2: Drive Track

1. Launch AMS2
2. Select track you want to extract
3. Choose any car
4. Drive **complete lap** without:
   - Crashes
   - Resets
   - Pauses
   - Leaving track boundaries

5. **Important:** Cross start/finish line to complete lap

#### Step 3: Save Recording

1. Telemetry should auto-save to:
   ```
   telemetry-data\[track-name]-[timestamp].json
   ```

2. Verify file contains:
   - Position data (x, y, z coordinates)
   - At least 500-1000 frames
   - Lap completion marker

#### Step 4: Quality Tips

For best results:
- Drive smooth racing line
- Maintain consistent speed
- Use full track width where appropriate
- Complete 1-2 laps (more data = smoother curve)

### Verification

Check telemetry file:
```json
{
  "trackName": "Silverstone GP",
  "frames": [
    {
      "timestamp": 0.016,
      "position": [1234.5, 67.8, -901.2]
    },
    // ... more frames
  ]
}
```

Minimum frames: 500  
Recommended frames: 1000+

---

## Task 8: Search for Community Models (Optional)

**Why needed:** May find pre-made track models  
**Required for:** Approach 1  
**Time required:** 30 minutes per track

### Instructions

#### Priority Tracks to Search

**Tier 1 (High Priority):**
- Silverstone GP Circuit
- Circuit de Spa-Francorchamps
- Autodromo Nazionale di Monza
- Autódromo José Carlos Pace (Interlagos)
- Brands Hatch GP Circuit

**Tier 2 (Medium Priority):**
- Suzuka Circuit
- Circuit Gilles Villeneuve
- Autódromo Internazionale del Mugello
- Autodromo Enzo e Dino Ferrari (Imola)

#### Search Sources

1. **Sketchfab** (best for glTF):
   - URL: https://sketchfab.com/search?q=f1+track
   - Filters: Free downloads, Downloadable, glTF format
   - Search terms:
     - "[Track name] circuit 3d"
     - "[Track name] racing"
     - "f1 [track name]"

2. **TurboSquid**:
   - URL: https://www.turbosquid.com/Search/3D-Models/race-track
   - Filters: Free, Under $50 (if budget available)
   - Formats: glTF, FBX, OBJ preferred

3. **CGTrader**:
   - URL: https://www.cgtrader.com/3d-models/race-track
   - Filters: Free, Low poly
   - Formats: glTF, FBX, OBJ

4. **Free3D**:
   - URL: https://free3d.com/3d-models/race-track
   - All free downloads
   - Various formats

5. **GitHub**:
   - Search: "f1 track model" OR "racing circuit 3d"
   - May find open-source projects

#### Evaluation Criteria

When you find a model, check:

**License:**
- ✓ Free for commercial use OR
- ✓ CC0 / Public Domain OR
- ✓ CC-BY (with attribution)
- ✗ Avoid: "Personal use only"

**Quality:**
- Polygon count: 50k - 500k (prefer lower)
- Has textures: Yes
- Has materials: Yes
- Scale: Realistic (check dimensions)

**Format:**
- ✓ Best: .glb or .gltf (ready to use)
- ✓ Good: .fbx or .obj (easy conversion)
- ✓ OK: .blend (requires Blender)
- ✗ Avoid: Proprietary formats

#### Download Process

1. Download model files
2. Extract to: `ams2-track-extractor\downloaded-models\[track-name]\`
3. Note source URL in `README.txt`
4. Note license in `LICENSE.txt`

#### Documentation Template

Create `downloaded-models\[track-name]\INFO.txt`:

```
Track Name: Silverstone GP Circuit
Source: Sketchfab
URL: https://sketchfab.com/3d-models/...
Author: [Username]
License: CC-BY 4.0
Downloaded: 2025-11-09
Format: glTF 2.0 (.glb)
File Size: 45 MB
Polygons: ~250k
Notes: High quality, includes grandstands
```

### Success Metrics

**Found usable model if:**
- ✓ Track layout matches AMS2 version
- ✓ License allows use
- ✓ File size <200MB
- ✓ Format is convertible to glTF
- ✓ Visual quality acceptable

---

## Troubleshooting

### PCarsTools Issues

**"oo2core_7_win64.dll not found"**
→ Ensure DLL is in same folder as PCarsTools.exe  
→ Re-copy from AMS2 installation

**"Failed to decrypt archive"**
→ Check languages.bml is in Languages/ subfolder  
→ Try different game type: `--game-type PC2` or `--game-type PC3`

**"Access denied"**
→ Run PowerShell as Administrator  
→ Or copy AMS2 files to non-protected location first

### Blender Issues

**glTF export not available**
→ Enable add-on: Edit → Preferences → Add-ons → Search "gltf"

**Blender crashes on import**
→ File may be corrupted  
→ Try older Blender version (3.6 LTS)

**Exported glTF is huge**
→ Enable Draco compression in export settings  
→ Enable KTX2 texture compression

### Telemetry Recording Issues

**No telemetry file created**
→ Check track-map-core is running  
→ Verify output path is correct  
→ Ensure full lap was completed

**Telemetry path is jagged**
→ Drive smoother line  
→ Record multiple laps and average  
→ Increase recording frequency

**File is too large**
→ Reduce recording frequency  
→ Compress JSON with gzip  
→ Downsample to every 5th frame

---

## Quick Reference: What's Needed for Each Approach

### Approach 1: Community Models
✓ Internet access for searching  
✓ None of the above manual tasks required  

### Approach 2: Procedural Tracks
✓ Task 7: Record telemetry (drive tracks)  
✗ No tool installation needed  

### Approach 3: PCarsTools Extraction
✓ Task 1: Locate AMS2 installation  
✓ Task 2: Install .NET SDK  
✓ Task 3: Build PCarsTools  
✓ Task 4: Copy Oodle DLL  
✓ Task 5: Copy languages.bml  
✓ Task 6: Install Blender  
✗ Task 7: Not required  

### Approach 4: Hybrid
✓ Task 1: Locate AMS2 installation  
✓ Task 2: Install .NET SDK (for textures)  
✓ Task 3: Build PCarsTools (for textures)  
✓ Task 4: Copy Oodle DLL  
✓ Task 5: Copy languages.bml  
✓ Task 6: Install Blender  
✓ Task 7: Record telemetry  

---

## Checklist

Use this checklist to track your progress:

```
Manual Setup Checklist
======================

Phase 1: Essential Paths
[ ] Task 1: Located AMS2 installation
[ ] Created AMS2_PATH.txt file
[ ] Verified Locations/ folder exists

Phase 2: PCarsTools (if needed)
[ ] Task 2: Installed .NET 6.0 SDK
[ ] Verified with: dotnet --version
[ ] Task 3: Downloaded PCarsTools source
[ ] Built PCarsTools successfully
[ ] Created PCARSTOOLS_PATH.txt file
[ ] Task 4: Copied oo2core_7_win64.dll
[ ] Task 5: Copied languages.bml to Languages/
[ ] Tested PCarsTools with --help

Phase 3: Blender (if needed)
[ ] Task 6: Downloaded Blender 4.2+
[ ] Installed Blender
[ ] Created BLENDER_PATH.txt file
[ ] Enabled glTF 2.0 add-on
[ ] Verified glTF export works
[ ] Tested headless mode

Phase 4: Telemetry Recording
[ ] Task 7: Set up telemetry output path
[ ] Drove first track (full lap)
[ ] Verified JSON file created
[ ] Checked frame count >500

Phase 5: Community Models (optional)
[ ] Task 8: Searched Sketchfab
[ ] Searched TurboSquid
[ ] Searched Free3D
[ ] Downloaded any usable models
[ ] Documented sources and licenses

Done! Ready to run extraction scripts.
```

---

## Next Steps

Once manual setup is complete:

1. **Test Installation:**
   ```powershell
   # Run verification script (to be created)
   npm run verify-setup
   ```

2. **Choose Approach:**
   - Review IMPLEMENTATION-PLAN.md
   - Select approach based on your needs
   - Start with easiest (Approach 1 or 2)

3. **Run Automation:**
   ```powershell
   # Generate procedural track from telemetry
   npm run generate-procedural -- --track silverstone
   
   # Or convert community model
   npm run convert-gltf -- --input downloaded-models/silverstone/model.fbx
   ```

4. **Validate Results:**
   ```powershell
   # Test in Three.js
   npm run test-track -- --track silverstone
   ```

---

## Support

If you encounter issues not covered here:

1. Check troubleshooting section above
2. Review IMPLEMENTATION-PLAN.md for approach-specific guidance
3. Check PCarsTools GitHub issues: https://github.com/Nenkai/PCarsTools/issues
4. Ask me for help with specific error messages

Remember: Approach 2 (Procedural) has the fewest manual requirements and highest success rate. Start there if other approaches seem too complex.
