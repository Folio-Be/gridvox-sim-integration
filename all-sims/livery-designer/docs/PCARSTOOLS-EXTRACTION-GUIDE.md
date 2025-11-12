# PCarsTools Asset Extraction Guide

**Project:** SimVox.ai AI Livery Designer
**Purpose:** Step-by-step guide for extracting car models and UV templates from Automobilista 2
**Last Updated:** January 11, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Extraction Workflow](#extraction-workflow)
5. [File Structure](#file-structure)
6. [Troubleshooting](#troubleshooting)
7. [Automation Script](#automation-script)

---

## Overview

### What is PCarsTools?

**PCarsTools** is a community-created tool for extracting assets from Project CARS-based games (AMS2, Project CARS 2, Automobilista).

**Capabilities:**
- ✅ Extract `.mas` (archive) and `.bff` (big file format) files
- ✅ Decompress Oodle-compressed assets
- ✅ Export 3D models (`.gmt`, `.gmtk`)
- ✅ Export textures (`.dds`)
- ✅ Export physics files (`.sbc`, `.tbc`)

**What SimVox.ai Needs:**
- 🎯 UV texture templates (`body2.dds`, `body2_alt.dds`)
- 🎯 3D car models (`.gmt` files for Blender import)
- 🎯 Material definitions (which textures map to which parts)

---

## Prerequisites

### Software Requirements

```
Required:
✅ Automobilista 2 (installed via Steam or Epic Games)
✅ Windows 10/11 (64-bit)
✅ PCarsTools (download link below)
✅ 7-Zip or WinRAR (for .zip extraction)

Optional (for 3D work):
⚠️ Blender 3.6+ (for viewing/editing extracted models)
⚠️ NVIDIA Texture Tools (for DDS preview)
```

### System Requirements

```
Disk Space: 20GB free (for extracted assets)
RAM: 8GB minimum (extraction is memory-intensive)
CPU: Any modern CPU (extraction is single-threaded)
```

---

## Installation

### Step 1: Download PCarsTools

```
Download Link: https://github.com/Nenkai/PCarsTools/releases/latest

As of Jan 2025:
Latest Version: PCarsTools v1.0.3
File: PCarsTools_v1.0.3.zip (15MB)
```

### Step 2: Extract PCarsTools

```powershell
# Extract to a permanent location (DO NOT use Temp folder)
Expand-Archive -Path "C:\Users\<User>\Downloads\PCarsTools_v1.0.3.zip" -DestinationPath "C:\Tools\PCarsTools"

# Verify extraction
dir "C:\Tools\PCarsTools"

Expected Files:
PCarsTools.exe         # Main executable (5MB)
oo2core_4_win64.dll    # Oodle decompression library (REQUIRED, 2.5MB)
README.md              # Documentation
```

**Critical:** `oo2core_4_win64.dll` MUST be in the same folder as `PCarsTools.exe`. Without it, extraction will fail with "DLL not found" error.

### Step 3: Add to PATH (Optional but Recommended)

```powershell
# Add to PATH for easy command-line access
$env:Path += ";C:\Tools\PCarsTools"

# Test it works
pcarstools.exe --version

Expected Output:
PCarsTools v1.0.3
```

---

## Extraction Workflow

### Overview: What Files to Extract

```
AMS2 Asset Locations:

Vehicles:
C:\Program Files\Steam\steamapps\common\Automobilista 2\GameData\Vehicles\

Key Folders:
├── Textures\
│   └── CustomLiveries\
│       ├── ginetta_g55_gt4_2\    # Car-specific folders
│       │   ├── GIN\              # Team folders
│       │   │   ├── body2.dds     # ← MAIN UV TEMPLATE (2048×2048)
│       │   │   ├── body2_alt.dds
│       │   │   └── decals.dds
│       │   └── ... (other teams)
│       ├── mclaren_720s_gt3\
│       └── bmw_m4_gt3\
├── Models\
│   ├── ginetta_g55_gt4_2.gmt     # ← 3D MODEL
│   ├── mclaren_720s_gt3.gmt
│   └── bmw_m4_gt3.gmt
└── Physics\
    └── ... (not needed for SimVox.ai)

Problem: These files are inside .mas archives!
Solution: Use PCarsTools to extract them.
```

### Step 1: Locate AMS2 Installation

```powershell
# Find AMS2 install directory
$ams2Path = "C:\Program Files\Steam\steamapps\common\Automobilista 2"

# Verify it exists
Test-Path "$ams2Path\GameData\Vehicles"

# Expected: True

# If False, check:
# - Epic Games: C:\Program Files\Epic Games\Automobilista 2
# - Custom install: Right-click AMS2 in Steam → Properties → Installed Files → Browse
```

### Step 2: Extract Vehicle Archives

```powershell
# Navigate to PCarsTools directory
cd "C:\Tools\PCarsTools"

# Extract vehicles archive (this contains ALL car assets)
.\PCarsTools.exe extract `
  "C:\Program Files\Steam\steamapps\common\Automobilista 2\GameData\Vehicles.mas" `
  -o "C:\SimVox.ai\extracted_ams2_assets\vehicles"

# Extraction Progress (takes 5-10 minutes):
# Extracting: ginetta_g55_gt4_2.gmt... [1/523]
# Extracting: ginetta_g55_gt4_2_body2.dds... [2/523]
# ... (continues for all 523 files)
# Complete! Extracted 523 files (2.3GB)
```

**Expected Output Structure:**

```
C:\SimVox.ai\extracted_ams2_assets\vehicles\
├── Textures\
│   ├── ginetta_g55_gt4_2_body2.dds
│   ├── ginetta_g55_gt4_2_body2_alt.dds
│   ├── mclaren_720s_gt3_body2.dds
│   └── ... (1,200+ texture files)
├── Models\
│   ├── ginetta_g55_gt4_2.gmt
│   ├── mclaren_720s_gt3.gmt
│   └── ... (200+ model files)
└── Physics\
    └── ... (not needed)
```

### Step 3: Organize Extracted Assets

```powershell
# Create car-specific folders for SimVox.ai training pipeline
$carsToExtract = @(
    "ginetta_g55_gt4_2",
    "mclaren_720s_gt3",
    "bmw_m4_gt3"
)

foreach ($car in $carsToExtract) {
    # Create folder structure
    $carFolder = "C:\SimVox.ai\training_data\$car"
    New-Item -ItemType Directory -Force -Path $carFolder
    New-Item -ItemType Directory -Force -Path "$carFolder\textures"
    New-Item -ItemType Directory -Force -Path "$carFolder\models"

    # Copy UV templates
    Copy-Item `
        "C:\SimVox.ai\extracted_ams2_assets\vehicles\Textures\${car}_body2.dds" `
        "$carFolder\textures\body2.dds"

    # Copy 3D model
    Copy-Item `
        "C:\SimVox.ai\extracted_ams2_assets\vehicles\Models\$car.gmt" `
        "$carFolder\models\$car.gmt"

    Write-Host "✅ Organized assets for $car"
}
```

**Result:**
```
C:\SimVox.ai\training_data\
├── ginetta_g55_gt4_2\
│   ├── textures\
│   │   └── body2.dds              # ← Ready for AI training
│   └── models\
│       └── ginetta_g55_gt4_2.gmt  # ← Ready for Blender import
├── mclaren_720s_gt3\
│   └── ... (same structure)
└── bmw_m4_gt3\
    └── ... (same structure)
```

### Step 4: Verify UV Templates

```powershell
# Install NVIDIA Texture Tools (for DDS preview)
# Download: https://developer.nvidia.com/nvidia-texture-tools-exporter

# Open body2.dds in NVIDIA Texture Tools
& "C:\Program Files\NVIDIA Corporation\NVIDIA Texture Tools\nvtt_export.exe" `
  "C:\SimVox.ai\training_data\ginetta_g55_gt4_2\textures\body2.dds"

# Expected:
# - Resolution: 2048×2048
# - Format: BC3 (DXT5)
# - Mipmaps: 12 levels
# - Alpha Channel: Yes (for sponsor decals)
```

**What a Good UV Template Looks Like:**

```
✅ GOOD UV Template:
- Clear panel separation (hood, doors, roof visible as distinct regions)
- Minimal stretching/distortion
- Sponsors/numbers clearly placed
- 2048×2048 resolution (sharp, no blur)

❌ BAD UV Template (if you see this, extract failed):
- Solid color (no panel details)
- Corrupted (noise/artifacts)
- Wrong resolution (512×512 or 1024×1024)
- Missing alpha channel
```

---

## File Structure

### AMS2 Vehicle Archive Structure

```
Vehicles.mas (1.2GB compressed)
│
├── Textures\
│   ├── CustomLiveries\
│   │   ├── <car_id>\
│   │   │   ├── <team_id>\
│   │   │   │   ├── body2.dds         # Main livery (2048×2048, BC3)
│   │   │   │   ├── body2_alt.dds     # Alternate livery (optional)
│   │   │   │   ├── decals.dds        # Sponsor decals overlay
│   │   │   │   ├── windows.dds       # Window tint/banners
│   │   │   │   └── driver.dds        # Driver suit
│   │   │   └── ... (multiple teams per car)
│   │   └── ... (100+ cars)
│   └── Default\
│       └── ... (default game textures)
│
├── Models\
│   ├── <car_id>.gmt                  # 3D model (binary format)
│   ├── <car_id>.gmtk                 # Skinned model (with bones)
│   └── ... (200+ models)
│
├── Physics\
│   ├── <car_id>.sbc                  # Suspension geometry
│   ├── <car_id>.tbc                  # Tire model
│   └── ... (physics files, not needed)
│
└── Upgrades\
    └── ... (performance upgrades, not needed)
```

### Car ID Naming Convention

```
AMS2 Car IDs follow pattern: <manufacturer>_<model>_<class>_<variant>

Examples:
ginetta_g55_gt4_2        # Ginetta G55 GT4 (2nd variant)
mclaren_720s_gt3         # McLaren 720S GT3
bmw_m4_gt3               # BMW M4 GT3
porsche_992_gt3_r        # Porsche 992 GT3 R
mercedes_amg_gt3_evo     # Mercedes-AMG GT3 Evo

Note: Underscores separate fields, NO spaces or hyphens.
```

### Team ID Naming Convention

```
Team IDs are 3-letter codes:

Official Teams:
GIN     # Ginetta official team
MCL     # McLaren official team
BMW     # BMW official team
POR     # Porsche official team

Custom Teams (user-created):
CUS     # Generic "Custom" team
TM1, TM2, TM3...  # Custom team slots

SimVox.ai Exports:
GVX     # SimVox.ai-generated liveries (reserved ID)
```

---

## Troubleshooting

### Issue 1: "oo2core_4_win64.dll not found"

```
Error Message:
PCarsTools.exe - System Error
The program can't start because oo2core_4_win64.dll is missing from your computer.

Solution:
1. Verify DLL is in same folder as PCarsTools.exe:
   dir "C:\Tools\PCarsTools\oo2core_4_win64.dll"

2. If missing, re-extract PCarsTools_v1.0.3.zip (don't extract only .exe)

3. If still missing, download separately:
   Source: https://github.com/Nenkai/PCarsTools/releases/latest
   File: oo2core_4_win64.dll (2.5MB)
   Copy to: C:\Tools\PCarsTools\
```

### Issue 2: "Access denied" when extracting

```
Error Message:
Error extracting file: Access denied (C:\Program Files\...)

Solution:
DO NOT extract to Program Files (requires admin permissions).
Extract to user-writable location:

✅ GOOD: C:\SimVox.ai\extracted_ams2_assets\
✅ GOOD: C:\Users\<User>\Documents\AMS2_Assets\
❌ BAD:  C:\Program Files\... (requires admin)
❌ BAD:  C:\Windows\... (system folder)
```

### Issue 3: Extracted DDS is corrupted/black

```
Symptom:
body2.dds opens as solid black or corrupted noise.

Possible Causes:
1. Extraction failed mid-process (disk space ran out)
2. Wrong oo2core version (DLL mismatch)
3. AMS2 game files corrupted (verify via Steam)

Solutions:

Option A: Re-extract with verbose logging
.\PCarsTools.exe extract "Vehicles.mas" -o "C:\extracted" --verbose

Option B: Verify AMS2 game files
Steam → Right-click AMS2 → Properties → Installed Files → Verify Integrity

Option C: Download correct oo2core_4_win64.dll
Must be version 2.4.0.0 (2.5MB file size)
Older/newer versions may not decompress correctly.
```

### Issue 4: Some cars missing UV templates

```
Symptom:
Extracted folder has .gmt model but no body2.dds texture.

Reason:
Not all AMS2 cars have CustomLiveries support. Some use:
- Shared templates (multiple cars use same UV)
- Procedural liveries (generated in-game, no .dds)
- DLC cars (in separate .mas archives)

Solution:
Check if car supports custom liveries:
1. Launch AMS2
2. Go to Vehicle Selection
3. Select car → Customization
4. If "Custom Livery" option exists → Has UV template
5. If only preset liveries → No custom support (skip this car)

For Phase 1 MVP, focus on cars with confirmed custom livery support:
✅ Ginetta G55 GT4
✅ McLaren 720S GT3
✅ BMW M4 GT3
✅ Porsche 992 GT3 R
✅ Mercedes-AMG GT3 Evo
```

### Issue 5: Extraction takes forever (>30 min)

```
Symptom:
Extraction started but still running after 30 minutes.

Normal Behavior:
- Small archives (<500MB): 2-5 minutes
- Vehicles.mas (1.2GB): 5-10 minutes
- Full game extraction: 30-60 minutes

If stuck (no progress in 10+ minutes):
1. Ctrl+C to cancel
2. Delete partially extracted files
3. Check disk space: dir C:\ (need 20GB free)
4. Try extracting specific car only:

.\PCarsTools.exe extract "Vehicles.mas" -o "C:\extracted" --filter "*ginetta_g55_gt4_2*"

This extracts ONLY Ginetta files (30 seconds instead of 10 minutes)
```

---

## Automation Script

### PowerShell Script: Extract AMS2 Cars for SimVox.ai

```powershell
# extract_ams2_cars.ps1
# Automates extraction of UV templates and 3D models for SimVox.ai training

param(
    [string]$AMS2Path = "C:\Program Files\Steam\steamapps\common\Automobilista 2",
    [string]$OutputPath = "C:\SimVox.ai\training_data",
    [string[]]$CarsToExtract = @(
        "ginetta_g55_gt4_2",
        "mclaren_720s_gt3",
        "bmw_m4_gt3"
    )
)

# Verify AMS2 installation
if (-not (Test-Path "$AMS2Path\GameData\Vehicles.mas")) {
    Write-Error "AMS2 installation not found at: $AMS2Path"
    exit 1
}

# Verify PCarsTools
$pcarstoolsExe = "C:\Tools\PCarsTools\PCarsTools.exe"
if (-not (Test-Path $pcarstoolsExe)) {
    Write-Error "PCarsTools not found. Install to: C:\Tools\PCarsTools\"
    exit 1
}

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null

# Extract vehicles archive
$tempExtractPath = "$OutputPath\temp_extracted"
Write-Host "Extracting Vehicles.mas (this takes 5-10 minutes)..."
& $pcarstoolsExe extract "$AMS2Path\GameData\Vehicles.mas" -o $tempExtractPath

if ($LASTEXITCODE -ne 0) {
    Write-Error "Extraction failed with code: $LASTEXITCODE"
    exit 1
}

# Organize assets per car
foreach ($car in $CarsToExtract) {
    Write-Host "Processing $car..."

    # Create folder structure
    $carFolder = "$OutputPath\$car"
    New-Item -ItemType Directory -Force -Path "$carFolder\textures" | Out-Null
    New-Item -ItemType Directory -Force -Path "$carFolder\models" | Out-Null

    # Find UV template (search in Textures folder)
    $uvTemplate = Get-ChildItem -Path $tempExtractPath -Recurse -Filter "${car}*body2.dds" | Select-Object -First 1
    if ($uvTemplate) {
        Copy-Item $uvTemplate.FullName "$carFolder\textures\body2.dds"
        Write-Host "  ✅ Copied UV template: body2.dds ($(($uvTemplate.Length / 1MB).ToString('0.0'))MB)"
    } else {
        Write-Warning "  ⚠️ UV template not found for $car"
    }

    # Find 3D model
    $model = Get-ChildItem -Path $tempExtractPath -Recurse -Filter "$car.gmt" | Select-Object -First 1
    if ($model) {
        Copy-Item $model.FullName "$carFolder\models\$car.gmt"
        Write-Host "  ✅ Copied 3D model: $car.gmt ($(($model.Length / 1MB).ToString('0.0'))MB)"
    } else {
        Write-Warning "  ⚠️ 3D model not found for $car"
    }

    # Create metadata file
    $metadata = @{
        car_id = $car
        simulator = "automobilista2"
        extracted_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        uv_template = "textures\body2.dds"
        model_file = "models\$car.gmt"
    } | ConvertTo-Json

    $metadata | Out-File "$carFolder\metadata.json" -Encoding UTF8
}

# Cleanup temp files
Write-Host "Cleaning up temporary files..."
Remove-Item -Recurse -Force $tempExtractPath

Write-Host ""
Write-Host "✅ Extraction complete! Assets saved to: $OutputPath"
Write-Host ""
Write-Host "Next Steps:"
Write-Host "1. Verify UV templates in: $OutputPath\<car_id>\textures\body2.dds"
Write-Host "2. Import models to Blender: $OutputPath\<car_id>\models\*.gmt"
Write-Host "3. Begin synthetic data generation (see TECHNICAL-ARCHITECTURE.md)"
```

**Usage:**

```powershell
# Run with defaults (extracts 3 cars)
.\extract_ams2_cars.ps1

# Specify custom AMS2 path
.\extract_ams2_cars.ps1 -AMS2Path "C:\Program Files\Epic Games\Automobilista 2"

# Extract additional cars
.\extract_ams2_cars.ps1 -CarsToExtract @(
    "ginetta_g55_gt4_2",
    "mclaren_720s_gt3",
    "bmw_m4_gt3",
    "porsche_992_gt3_r",
    "mercedes_amg_gt3_evo"
)

# Specify output location
.\extract_ams2_cars.ps1 -OutputPath "D:\SimVox.ai\cars"
```

---

## Post-Extraction: Blender Import (Optional)

### Import GMT Models to Blender

```python
# Blender Python script: import_gmt.py
# Requires: Blender 3.6+, gmt_importer plugin

import bpy
import os

def import_gmt_car(gmt_path: str):
    """Import AMS2 .gmt model into Blender."""
    # Install gmt_importer plugin first:
    # https://github.com/TheAdmiester/Blender-GMT-Importer

    bpy.ops.import_scene.gmt(filepath=gmt_path)

    # Get imported object
    car_obj = bpy.context.selected_objects[0]

    # Print UV map info
    if car_obj.data.uv_layers:
        uv_layer = car_obj.data.uv_layers[0]
        print(f"UV Map: {uv_layer.name}")
        print(f"Vertices: {len(car_obj.data.vertices)}")
        print(f"Faces: {len(car_obj.data.polygons)}")

    return car_obj

# Example usage:
gmt_path = "C:\\SimVox.ai\\training_data\\ginetta_g55_gt4_2\\models\\ginetta_g55_gt4_2.gmt"
car = import_gmt_car(gmt_path)
```

---

## Legal Considerations

### Asset Extraction Legality

```
Question: Is it legal to extract AMS2 assets?

Answer: GRAY AREA (depends on usage)

✅ LEGAL Uses:
- Personal use (modding your own game)
- Educational research (understanding game formats)
- AI training on UV layouts (transformative use)

❌ ILLEGAL Uses:
- Redistributing extracted assets (copyright violation)
- Using 3D models in commercial games (IP theft)
- Selling extracted textures/models

SimVox.ai Strategy:
1. Extract UV templates for AI training (transformative use)
2. Generate NEW textures (original content, not redistributed assets)
3. Do NOT include extracted .gmt models in SimVox.ai distribution
4. Users extract their own assets (like other modding tools)

Similar Precedent: Skyrim/Fallout modding tools (legal for 15+ years)
```

---

**Last Updated:** January 11, 2025
**Status:** ✅ Extraction guide complete → Ready for Phase 1 Week 3 (asset extraction)
**Next:** Use extracted UV templates for synthetic data generation (see TECHNICAL-ARCHITECTURE.md)
