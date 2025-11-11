# Multi-Simulator Support Specification

**Project:** GridVox AI Livery Designer
**Purpose:** Technical specifications for supporting AMS2, iRacing, ACC, and LMU
**Last Updated:** January 11, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Simulator Comparison Matrix](#simulator-comparison-matrix)
3. [Per-Simulator Specifications](#per-simulator-specifications)
4. [Installation Path Detection](#installation-path-detection)
5. [Export Pipeline Architecture](#export-pipeline-architecture)
6. [Car Model Availability](#car-model-availability)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

### Supported Simulators

```
Phase 1-5 (MVP):
✅ Automobilista 2 (AMS2) - FULLY SUPPORTED

Phase 6+ (Post-Launch):
🔜 iRacing - PLANNED (Q2 2025)
🔜 Assetto Corsa Competizione (ACC) - PLANNED (Q3 2025)
🔜 Le Mans Ultimate (LMU) - PLANNED (Q3 2025)

Future Consideration:
⏳ Assetto Corsa (original) - Community request pending
⏳ RaceRoom Racing Experience (R3E) - Evaluate demand
⏳ rFactor 2 - Complex mod structure, needs research
```

### Why AMS2 First?

```
Reasons:
1. ✅ PCarsTools available (asset extraction proven)
2. ✅ Custom livery system well-documented by modding community
3. ✅ DDS format (standard, no proprietary formats)
4. ✅ Active modding scene (testing community available)
5. ✅ GT3/GT4 cars match target user base (serious sim racers)

iRacing Second:
1. ✅ Largest user base (300k+ subscribers)
2. ✅ Trading Paints proves market demand ($24/year, 50k+ users)
3. ✅ TGA format (simpler than DDS, no mipmaps needed)
4. ⚠️ Proprietary car IDs (need to map each car manually)

ACC Third:
1. ✅ GT3-only focus (matches our initial car training)
2. ✅ DDS format (same pipeline as AMS2)
3. ⚠️ Smaller modding community (less documented)

LMU Last:
1. ⚠️ Newest simulator (2024 release, format still evolving)
2. ✅ rFactor 2 based (similar to AMS2 structure)
3. ⚠️ Smallest user base (growing, but <50k users)
```

---

## Simulator Comparison Matrix

### Technical Specifications

| Feature | AMS2 | iRacing | ACC | LMU |
|---------|------|---------|-----|-----|
| **File Format** | DDS (BC3) | TGA (RLE) | DDS (BC3) | TGA/DDS |
| **Resolution** | 2048×2048 | 2048×2048 | 2048×2048 | 2048×2048 |
| **Mipmaps** | ✅ Required | ❌ Game generates | ✅ Required | ⚠️ Optional |
| **Alpha Channel** | ✅ Yes | ⚠️ Car-dependent | ✅ Yes | ✅ Yes |
| **Compression** | BC3 (DXT5) | RLE | BC3 (DXT5) | RLE/BC3 |
| **Color Space** | sRGB | sRGB | sRGB | sRGB |
| **Custom Numbers** | ❌ Baked in texture | ✅ Filename-based | ⚠️ Mixed | ⚠️ Mixed |
| **Driver Names** | ❌ Baked in texture | ✅ Filename-based | ❌ Baked | ❌ Baked |

### Installation Paths

| Simulator | Platform | Default Path | Custom Livery Folder |
|-----------|----------|--------------|---------------------|
| **AMS2** | Steam | `C:\Program Files\Steam\steamapps\common\Automobilista 2` | `Documents\Automobilista 2\UserData\CustomLiveries\<car>\<team>\` |
| **AMS2** | Epic | `C:\Program Files\Epic Games\Automobilista 2` | Same as Steam |
| **iRacing** | Direct | `C:\Program Files\iRacing` | `Documents\iRacing\paint\<car>\` |
| **ACC** | Steam | `C:\Program Files\Steam\steamapps\common\AC2` | `Documents\Assetto Corsa Competizione\Customs\Liveries\<car>\` |
| **LMU** | Steam | `C:\Program Files\Steam\steamapps\common\Le Mans Ultimate` | `<install>\UserData\CustomLiveries\<car>\` |

### Naming Conventions

| Simulator | Filename Format | Example |
|-----------|----------------|---------|
| **AMS2** | `body2.dds` | `body2.dds` (no car/number in filename) |
| **iRacing** | `car_<carid>_<num>.tga` | `car_porsche992gt3r_42.tga` |
| **ACC** | `<carid>_<teamid>.dds` | `porsche_991ii_gt3_r_custom.dds` |
| **LMU** | `<teamid>_<num>.tga` | `team_gridvox_42.tga` |

---

## Per-Simulator Specifications

### 1. Automobilista 2 (AMS2)

#### Overview
```
Developer: Reiza Studios (Brazil)
Engine: Madness Engine (Project CARS fork)
Release: 2020
Active Users: ~50,000 (Steam concurrent peak: 2,500)
Custom Livery Support: ✅ Excellent (built-in system)
```

#### File Format Details

**Primary Texture:**
```
Filename: body2.dds
Format: DDS (BC3/DXT5 compression)
Resolution: 2048×2048 (recommended), 1024×1024 (acceptable), 4096×4096 (overkill)
Mipmaps: REQUIRED (12 levels for 2048×2048)
Alpha Channel: YES (for sponsor decals with transparency)
Color Space: sRGB (gamma 2.2)
Pre-multiplied Alpha: YES (required for correct blending)
```

**Alternate Textures:**
```
body2_alt.dds    - Alternate livery (user can switch in-game)
decals.dds       - Additional sponsor overlays (optional)
windows.dds      - Window tint/banners (optional)
wheels.dds       - Custom wheel liveries (optional)
driver.dds       - Driver suit texture (optional)
```

#### Installation Path Structure

```
Documents\Automobilista 2\UserData\CustomLiveries\
├── ginetta_g55_gt4_2\           # Car ID
│   ├── GIN\                     # Team ID (3-letter code)
│   │   ├── body2.dds
│   │   ├── body2_alt.dds
│   │   ├── decals.dds
│   │   └── livery.json          # Metadata (optional, for auto-detection)
│   ├── GVX\                     # GridVox custom team
│   │   └── body2.dds
│   └── CUS\                     # Generic custom team
│       └── body2.dds
├── mclaren_720s_gt3\
│   └── ... (same structure)
└── porsche_992_gt3_r\
    └── ... (same structure)

Game Detection:
AMS2 automatically loads all team folders in car directory.
User selects team in: Garage → Customization → Select Team → GVX
```

#### Car ID Naming

```
Format: <manufacturer>_<model>_<class>_<variant>

Examples:
ginetta_g55_gt4_2        # Ginetta G55 GT4 (2nd gen)
mclaren_720s_gt3         # McLaren 720S GT3
bmw_m4_gt3               # BMW M4 GT3
porsche_992_gt3_r        # Porsche 992 GT3 R
mercedes_amg_gt3_evo     # Mercedes-AMG GT3 Evo
audi_r8_lms_gt3_evo      # Audi R8 LMS GT3 Evo
```

#### GridVox Export Strategy

```python
def export_ams2_livery(
    uv_texture: np.ndarray,
    car_id: str,
    team_id: str = "GVX",
    include_alternate: bool = False
):
    # Generate DDS with BC3 compression and mipmaps
    dds_path = generate_dds(
        uv_texture,
        compression="BC3",
        mipmaps=True,
        premultiply_alpha=True
    )

    # Detect AMS2 install path
    ams2_docs = find_ams2_documents_folder()

    # Create team folder if needed
    team_folder = f"{ams2_docs}\\CustomLiveries\\{car_id}\\{team_id}"
    os.makedirs(team_folder, exist_ok=True)

    # Copy DDS to team folder
    shutil.copy(dds_path, f"{team_folder}\\body2.dds")

    # Generate alternate if requested
    if include_alternate:
        # Slightly modify colors (e.g., darker variant)
        alt_texture = adjust_brightness(uv_texture, factor=0.8)
        alt_dds = generate_dds(alt_texture, compression="BC3", mipmaps=True)
        shutil.copy(alt_dds, f"{team_folder}\\body2_alt.dds")

    return team_folder
```

---

### 2. iRacing

#### Overview
```
Developer: iRacing.com Motorsport Simulations
Engine: Proprietary
Release: 2008 (continuous updates)
Active Users: 300,000+ subscribers
Custom Livery Support: ✅ Excellent (TGA paint system)
```

#### File Format Details

**Primary Texture:**
```
Filename: car_<carid>_<number>.tga
Format: TGA (Targa) with RLE compression
Resolution: 2048×2048 (standard), 4096×4096 (Pro users)
Mipmaps: NOT NEEDED (iRacing generates .mip files automatically)
Alpha Channel: RARE (most cars use 24-bit RGB, some support 32-bit RGBA)
Color Space: sRGB
Bit Depth: 24-bit (RGB) or 32-bit (RGBA)
```

**Number/Name Handling:**
```
iRacing has TWO systems:

System 1: Filename-based (Legacy)
Filename: car_porsche992gt3r_42.tga
Number 42 is encoded in FILENAME, not texture.
iRacing overlays number graphics on top of texture.

System 2: Baked-in (Modern, Trading Paints style)
Filename: car_porsche992gt3r_42.tga
Number 42 is PAINTED on texture (GridVox approach).
More control over number placement/style.

GridVox uses System 2 (baked-in) for consistency.
```

#### Installation Path Structure

```
Documents\iRacing\paint\
├── porsche992gt3r\              # Car folder name (iRacing-specific)
│   ├── car_porsche992gt3r_1.tga
│   ├── car_porsche992gt3r_2.tga
│   ├── car_porsche992gt3r_42.tga
│   └── ... (up to 1000 numbers)
├── mclaren720sgt3\
│   └── car_mclaren720sgt3_7.tga
└── bmwm4gt3\
    └── car_bmwm4gt3_99.tga

Game Detection:
iRacing scans paint folder on launch.
Number selection: Garage → Paint Car → Select Custom Paint → #42
```

#### Car ID Mapping

**Problem:** iRacing uses internal IDs different from friendly names.

```
iRacing Car ID          GridVox Display Name
--------------------    --------------------------
porsche992gt3r          Porsche 992 GT3 R
mclaren720sgt3          McLaren 720S GT3
bmwm4gt3                BMW M4 GT3
mercedesamggt3          Mercedes-AMG GT3
audilmsgt3evo2          Audi R8 LMS GT3 Evo II

Mapping Database (partial):
{
  "porsche_992_gt3_r": {
    "iracing_id": "porsche992gt3r",
    "iracing_folder": "porsche992gt3r",
    "display_name": "Porsche 992 GT3 R",
    "class": "GT3",
    "year": 2023
  },
  "mclaren_720s_gt3": {
    "iracing_id": "mclaren720sgt3",
    "iracing_folder": "mclaren720sgt3",
    "display_name": "McLaren 720S GT3",
    "class": "GT3",
    "year": 2019
  }
}

GridVox maintains JSON file: car_mappings.json (200+ cars)
```

#### Trading Paints Integration

```
Trading Paints Workflow:
1. User creates livery on tradingpaints.com (web editor)
2. Trading Paints Downloader (localhost:34034) runs in background
3. When iRacing session starts, downloader fetches .tga files
4. Files copied to Documents\iRacing\paint\
5. iRacing applies liveries in real-time

GridVox Integration Strategy (Phase 6+):
- Offer "Upload to Trading Paints" button (requires TP API key)
- Benefits: Other racers see your livery in multiplayer
- Alternative: Local-only export (free, but only you see livery)
```

#### GridVox Export Strategy

```python
def export_iracing_livery(
    uv_texture: np.ndarray,
    car_id: str,           # GridVox ID: "porsche_992_gt3_r"
    car_number: int,       # 0-999
    driver_name: str = None
):
    # Map GridVox ID to iRacing ID
    iracing_car = map_to_iracing_id(car_id)  # "porsche992gt3r"

    # Add number and name to texture (baked-in approach)
    texture_with_number = render_number_on_texture(
        uv_texture,
        number=car_number,
        style="modern",
        positions=["door_left", "door_right", "hood"]
    )

    if driver_name:
        texture_with_name = render_driver_name(
            texture_with_number,
            name=driver_name,
            position="windshield_banner"
        )
    else:
        texture_with_name = texture_with_number

    # Generate TGA with RLE compression
    tga_path = generate_tga(
        texture_with_name,
        compression="RLE",
        bit_depth=24  # RGB (most cars don't support alpha)
    )

    # Detect iRacing install
    iracing_docs = find_iracing_documents_folder()

    # Create car folder if needed
    paint_folder = f"{iracing_docs}\\paint\\{iracing_car}"
    os.makedirs(paint_folder, exist_ok=True)

    # Copy to paint folder with correct filename
    filename = f"car_{iracing_car}_{car_number}.tga"
    shutil.copy(tga_path, f"{paint_folder}\\{filename}")

    return f"{paint_folder}\\{filename}"
```

---

### 3. Assetto Corsa Competizione (ACC)

#### Overview
```
Developer: Kunos Simulazioni (Italy)
Engine: Unreal Engine 4
Release: 2018
Active Users: ~80,000 (Steam concurrent peak: 6,000)
Custom Livery Support: ⚠️ Moderate (community mods required)
```

#### File Format Details

**Primary Texture:**
```
Filename: <carid>_<teamid>.dds (or livery.dds in team folder)
Format: DDS (BC3/DXT5)
Resolution: 2048×2048 (standard), 4096×4096 (optional)
Mipmaps: REQUIRED
Alpha Channel: YES
Color Space: sRGB
Compression: BC3 (same as AMS2)
```

#### Installation Path Structure

```
Documents\Assetto Corsa Competizione\Customs\Liveries\
├── porsche_991ii_gt3_r\         # Car ID (ACC naming)
│   ├── gridvox_custom\          # Custom team folder
│   │   ├── livery.dds           # Main texture
│   │   ├── sponsors.dds         # Sponsor decals
│   │   └── decals.json          # Decal placement metadata
│   └── team_official\
│       └── livery.dds
└── mclaren_720s_gt3\
    └── ... (same structure)

Note: ACC has stricter folder structure than AMS2.
Requires decals.json for proper number/sponsor placement.
```

#### Car ID Mapping

```
ACC Car IDs (Official):
porsche_991ii_gt3_r      # Porsche 991 II GT3 R (2019)
mclaren_720s_gt3         # McLaren 720S GT3
bmw_m4_gt3               # BMW M4 GT3 (2022)
mercedes_amg_gt3_evo     # Mercedes-AMG GT3 Evo
audi_r8_lms_gt3_evo      # Audi R8 LMS GT3 Evo (2019)

Note: ACC focuses on GT3 class only (no GT4, no Formula cars).
GridVox must filter car list when exporting to ACC.
```

#### decals.json Format

```json
{
  "liveryName": "GridVox Custom Livery #42",
  "teamName": "GridVox Racing",
  "carNumber": 42,
  "decals": [
    {
      "type": "number",
      "position": "door_left",
      "scale": 1.5,
      "rotation": 0,
      "color": "#FFFFFF"
    },
    {
      "type": "sponsor",
      "name": "Shell",
      "position": "hood",
      "scale": 2.0,
      "texture": "sponsors.dds",
      "uv_offset": [0.25, 0.5]
    }
  ]
}
```

#### GridVox Export Strategy

```python
def export_acc_livery(
    uv_texture: np.ndarray,
    car_id: str,
    team_name: str = "GridVox Racing",
    car_number: int = 42
):
    # Verify car is GT3 (ACC only supports GT3)
    if not is_gt3_car(car_id):
        raise ValueError(f"ACC only supports GT3 cars. {car_id} is not GT3.")

    # Map to ACC car ID
    acc_car = map_to_acc_id(car_id)

    # Generate DDS (same as AMS2)
    dds_path = generate_dds(
        uv_texture,
        compression="BC3",
        mipmaps=True,
        premultiply_alpha=True
    )

    # Detect ACC install
    acc_docs = find_acc_documents_folder()

    # Create team folder
    team_folder = f"{acc_docs}\\Customs\\Liveries\\{acc_car}\\gridvox_{car_number}"
    os.makedirs(team_folder, exist_ok=True)

    # Copy DDS
    shutil.copy(dds_path, f"{team_folder}\\livery.dds")

    # Generate decals.json
    decals_config = {
        "liveryName": f"GridVox Livery #{car_number}",
        "teamName": team_name,
        "carNumber": car_number,
        "decals": extract_decal_positions(uv_texture)
    }

    with open(f"{team_folder}\\decals.json", "w") as f:
        json.dump(decals_config, f, indent=2)

    return team_folder
```

---

### 4. Le Mans Ultimate (LMU)

#### Overview
```
Developer: Motorsport Games (Studio 397)
Engine: rFactor 2 Engine
Release: 2024 (Early Access)
Active Users: ~30,000 (growing)
Custom Livery Support: ✅ Good (rFactor 2 style)
```

#### File Format Details

**Primary Texture:**
```
Filename: <teamid>_<number>.tga OR livery.dds
Format: TGA (preferred) or DDS (supported)
Resolution: 2048×2048
Mipmaps: OPTIONAL (game generates if TGA)
Alpha Channel: YES (both TGA and DDS support)
Color Space: sRGB
```

#### Installation Path Structure

```
<LMU_Install>\UserData\CustomLiveries\
├── hypercar_porsche_963\        # Car ID (LMU naming)
│   ├── team_gridvox_42.tga
│   ├── team_gridvox_7.tga
│   └── ...
└── lmp2_oreca_07\
    └── team_custom_12.tga

Note: LMU uses install directory (not Documents), similar to rFactor 2.
```

#### Car ID Mapping

```
LMU Car IDs (Le Mans specific):
hypercar_porsche_963         # Porsche 963 LMDh
hypercar_ferrari_499p        # Ferrari 499P LMH
hypercar_toyota_gr010        # Toyota GR010 LMH
lmp2_oreca_07                # Oreca 07 LMP2
lmgt3_mclaren_720s           # McLaren 720S LMGT3
lmgt3_porsche_992            # Porsche 992 LMGT3

Note: LMU focuses on Le Mans 24h classes (Hypercar, LMP2, LMGT3).
Different from AMS2/iRacing GT3 focus.
```

#### GridVox Export Strategy

```python
def export_lmu_livery(
    uv_texture: np.ndarray,
    car_id: str,
    team_name: str = "GridVox",
    car_number: int = 42
):
    # Map to LMU car ID
    lmu_car = map_to_lmu_id(car_id)

    # Generate TGA (LMU prefers TGA over DDS)
    tga_path = generate_tga(
        uv_texture,
        compression="RLE",
        bit_depth=32  # RGBA (LMU supports alpha)
    )

    # Detect LMU install path
    lmu_install = find_lmu_install_folder()

    # Create livery folder
    livery_folder = f"{lmu_install}\\UserData\\CustomLiveries\\{lmu_car}"
    os.makedirs(livery_folder, exist_ok=True)

    # Copy TGA with team naming
    filename = f"team_{team_name.lower().replace(' ', '_')}_{car_number}.tga"
    shutil.copy(tga_path, f"{livery_folder}\\{filename}")

    return f"{livery_folder}\\{filename}"
```

---

## Installation Path Detection

### Windows Registry Keys

```python
import winreg

def find_steam_library_folders() -> list[str]:
    """Find all Steam library folders (user may have multiple drives)."""
    try:
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\WOW6432Node\Valve\Steam"
        )
        install_path, _ = winreg.QueryValueEx(key, "InstallPath")
        winreg.CloseKey(key)

        # Parse libraryfolders.vdf to find all library locations
        vdf_path = f"{install_path}\\steamapps\\libraryfolders.vdf"
        libraries = parse_vdf_library_folders(vdf_path)

        return libraries
    except FileNotFoundError:
        return []

def find_ams2_install() -> str:
    """Detect AMS2 installation path."""
    libraries = find_steam_library_folders()

    for library in libraries:
        ams2_path = f"{library}\\steamapps\\common\\Automobilista 2"
        if os.path.exists(ams2_path):
            return ams2_path

    # Check Epic Games
    epic_path = r"C:\Program Files\Epic Games\Automobilista 2"
    if os.path.exists(epic_path):
        return epic_path

    return None

def find_iracing_install() -> str:
    """Detect iRacing installation path."""
    # iRacing stores path in registry
    try:
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\iRacing.com\iRacing"
        )
        path, _ = winreg.QueryValueEx(key, "InstallPath")
        winreg.CloseKey(key)
        return path
    except FileNotFoundError:
        # Fallback: Check default location
        default_path = r"C:\Program Files\iRacing"
        if os.path.exists(default_path):
            return default_path

    return None
```

### Documents Folder Detection

```python
import os
from pathlib import Path

def get_documents_folder() -> str:
    """Get user's Documents folder (Windows)."""
    return str(Path.home() / "Documents")

def find_ams2_documents_folder() -> str:
    """Find AMS2 user data folder."""
    docs = get_documents_folder()
    ams2_data = f"{docs}\\Automobilista 2"

    if not os.path.exists(ams2_data):
        # Create if doesn't exist (first-time setup)
        os.makedirs(f"{ams2_data}\\UserData\\CustomLiveries", exist_ok=True)

    return ams2_data

def find_iracing_documents_folder() -> str:
    """Find iRacing paint folder."""
    docs = get_documents_folder()
    iracing_data = f"{docs}\\iRacing"

    if not os.path.exists(iracing_data):
        raise FileNotFoundError("iRacing not installed or never run.")

    return iracing_data
```

---

## Export Pipeline Architecture

### Unified Export Interface

```python
from enum import Enum
from dataclasses import dataclass

class Simulator(Enum):
    AMS2 = "automobilista2"
    IRACING = "iracing"
    ACC = "assetto_corsa_competizione"
    LMU = "le_mans_ultimate"

@dataclass
class ExportConfig:
    simulator: Simulator
    car_id: str
    car_number: int = None
    team_name: str = "GridVox"
    driver_name: str = None
    resolution: int = 2048
    quality: str = "high"  # "draft", "high", "ultra"

def export_livery(
    uv_texture: np.ndarray,
    config: ExportConfig
) -> str:
    """
    Unified export function for all simulators.

    Returns: Path to installed livery file
    """
    # Route to simulator-specific exporter
    if config.simulator == Simulator.AMS2:
        return export_ams2_livery(
            uv_texture,
            config.car_id,
            team_id="GVX"
        )

    elif config.simulator == Simulator.IRACING:
        return export_iracing_livery(
            uv_texture,
            config.car_id,
            config.car_number or 1,
            config.driver_name
        )

    elif config.simulator == Simulator.ACC:
        return export_acc_livery(
            uv_texture,
            config.car_id,
            config.team_name,
            config.car_number or 1
        )

    elif config.simulator == Simulator.LMU:
        return export_lmu_livery(
            uv_texture,
            config.car_id,
            config.team_name,
            config.car_number or 1
        )

# Example usage:
config = ExportConfig(
    simulator=Simulator.AMS2,
    car_id="porsche_992_gt3_r",
    car_number=42,
    driver_name="A. Rodriguez"
)

output_path = export_livery(uv_texture, config)
print(f"Livery installed to: {output_path}")
```

---

## Car Model Availability

### Cross-Simulator Car Matrix

| Car Model | AMS2 | iRacing | ACC | LMU |
|-----------|------|---------|-----|-----|
| Porsche 992 GT3 R | ✅ Yes | ✅ Yes | ❌ No (991 II only) | ✅ Yes (LMGT3) |
| McLaren 720S GT3 | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| BMW M4 GT3 | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Mercedes-AMG GT3 Evo | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Audi R8 LMS GT3 Evo II | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Ginetta G55 GT4 | ✅ Yes | ⚠️ G56 only | ❌ No GT4 | ❌ No |

**Implication for GridVox:**
- Train models on cars available in multiple simulators (maximizes ROI)
- McLaren 720S GT3: Available in ALL 4 sims (prioritize training)
- GT4 cars: Only AMS2/iRacing (lower priority)

---

## Implementation Roadmap

### Phase 1-5: AMS2 Only (MVP)
```
Timeline: Weeks 1-16
Cars: 3 (Ginetta G55 GT4, McLaren 720S GT3, BMW M4 GT3)
Export: DDS (BC3, mipmaps, 2048×2048)
Installation: Automatic (detect Documents folder, copy to CustomLiveries)
```

### Phase 6: Add iRacing Support
```
Timeline: Weeks 17-20 (1 month post-launch)
Effort: 2 weeks development + 2 weeks testing
New Code:
- iRacing car ID mapping database (200+ cars)
- TGA export pipeline (RLE compression, no mipmaps)
- Trading Paints API integration (optional, Pro feature)
Cars: Retrain same 3 models (McLaren 720S exists in iRacing)
Revenue Impact: +$5,000-10,000/month (iRacing user base is 6x larger)
```

### Phase 7: Add ACC Support
```
Timeline: Weeks 21-24
Effort: 2 weeks (ACC similar to AMS2, both use DDS)
New Code:
- decals.json generation
- GT3-only car filtering (hide GT4/Formula from export options)
Cars: No retraining needed (McLaren/BMW already trained)
Revenue Impact: +$2,000-4,000/month
```

### Phase 8: Add LMU Support
```
Timeline: Weeks 25-28
Effort: 2 weeks
New Code:
- LMU car ID mapping (Le Mans classes)
- TGA export (similar to iRacing)
Cars: Consider training Le Mans-specific cars (Hypercar, LMP2)
Revenue Impact: +$1,000-2,000/month (smallest sim, but growing)
```

---

**Last Updated:** January 11, 2025
**Status:** ✅ Multi-simulator specs complete → Ready for Phase 6+ expansion
**Next:** Focus on AMS2 implementation for MVP
