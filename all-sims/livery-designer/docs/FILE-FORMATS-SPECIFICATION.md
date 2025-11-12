# File Format Specifications

**Project:** SimVox.ai AI Livery Designer
**Purpose:** Technical specifications for all file formats used in livery creation pipeline
**Last Updated:** January 11, 2025

---

## Table of Contents
1. [DDS Format (DirectDraw Surface)](#dds-format-directdraw-surface)
2. [TGA Format (Targa)](#tga-format-targa)
3. [PNG Format (Portable Network Graphics)](#png-format-portable-network-graphics)
4. [GVOX Format (SimVox.ai Project)](#gvox-format-SimVox.ai-project)
5. [GMT/GMTK Format (AMS2 3D Models)](#gmtgmtk-format-ams2-3d-models)
6. [MAS/BFF Format (AMS2 Archives)](#masbff-format-ams2-archives)
7. [MIP Format (iRacing Textures)](#mip-format-iracing-textures)
8. [Export Format Matrix](#export-format-matrix)

---

## DDS Format (DirectDraw Surface)

### Overview
**Usage:** Automobilista 2, Assetto Corsa Competizione
**File Extension:** `.dds`
**Purpose:** GPU-optimized texture format with hardware-accelerated compression

### Technical Specifications

#### Resolution Requirements
```
Supported Resolutions (Powers of 2):
- 512×512   (Low quality, mobile testing)
- 1024×1024 (Medium quality, acceptable for GT4 cars)
- 2048×2048 (High quality, RECOMMENDED for GT3/GTE cars)
- 4096×4096 (Ultra quality, overkill for most use cases)

SimVox.ai Default: 2048×2048 (balances quality vs file size)
```

#### Compression Formats

##### BC3 (DXT5) - RECOMMENDED for Liveries
```
Format: BC3_UNORM (D3D11) / DXT5 (Legacy)
Channels: RGBA (8-bit per channel before compression)
Compression Ratio: 6:1 (2048×2048 RGBA = 16MB → 2.7MB compressed)
Quality: High (supports alpha channel for sponsors/decals)

When to Use:
✅ Car liveries with logos/sponsors (need alpha transparency)
✅ Liveries with gradient transparency effects
✅ Any texture requiring smooth alpha gradients

File Size (2048×2048): ~2.7MB with mipmaps
```

##### BC1 (DXT1) - Lower Quality Alternative
```
Format: BC1_UNORM (D3D11) / DXT1 (Legacy)
Channels: RGB only (1-bit alpha, on/off only)
Compression Ratio: 8:1 (2048×2048 RGB = 12MB → 1.5MB compressed)
Quality: Medium (no smooth alpha, binary transparency only)

When to Use:
⚠️ Base liveries without transparency
⚠️ File size is critical (mobile/web export)

File Size (2048×2048): ~1.5MB with mipmaps
```

##### BC7 (Modern) - Not Used (Game Compatibility)
```
Format: BC7_UNORM (D3D11, high quality)
Quality: Best (better than BC3)
Issue: ❌ Not supported by AMS2/ACC (older game engines)

When to Use:
❌ Do NOT use for SimVox.ai exports (compatibility issues)
```

#### Mipmap Chain Specification

**What are Mipmaps?**
Pre-calculated lower-resolution versions of texture for distant objects. Improves performance and reduces aliasing.

```
Mipmap Levels for 2048×2048 Texture:
Level 0: 2048×2048 (4,194,304 pixels) - Full resolution
Level 1: 1024×1024 (1,048,576 pixels) - 50% scale
Level 2: 512×512   (262,144 pixels)   - 25% scale
Level 3: 256×256   (65,536 pixels)    - 12.5% scale
Level 4: 128×128   (16,384 pixels)    - 6.25% scale
Level 5: 64×64     (4,096 pixels)     - 3.125% scale
Level 6: 32×32     (1,024 pixels)     - 1.5625% scale
Level 7: 16×16     (256 pixels)       - 0.78125% scale
Level 8: 8×8       (64 pixels)        - 0.390625% scale
Level 9: 4×4       (16 pixels)        - 0.1953125% scale
Level 10: 2×2      (4 pixels)         - 0.09765625% scale
Level 11: 1×1      (1 pixel)          - 0.048828125% scale

Total Levels: 12 (2048 = 2^11, so 11+1 levels)
Storage Overhead: +33% (mipmaps add 1/3 to file size)

Example: 2048×2048 BC3 with mipmaps = 2.7MB (vs 2.0MB without)
```

**Mipmap Generation Algorithm:**
```python
# SimVox.ai uses Lanczos3 resampling (high quality downscaling)
from PIL import Image

def generate_mipmaps(image: Image.Image) -> list[Image.Image]:
    """Generate full mipmap chain from base image."""
    mipmaps = [image]  # Level 0 (original)
    width, height = image.size

    while width > 1 or height > 1:
        width = max(1, width // 2)
        height = max(1, height // 2)
        mipmap = image.resize((width, height), Image.Resampling.LANCZOS)
        mipmaps.append(mipmap)

    return mipmaps

# Example output for 2048×2048:
# [Image(2048×2048), Image(1024×1024), ..., Image(1×1)]
```

#### DDS Header Structure

```
DDS File Layout:
Bytes 0-3:   Magic Number "DDS " (0x20534444)
Bytes 4-127: DDS_HEADER (124 bytes)
Bytes 128+:  DDS_HEADER_DXT10 (if DX10 format, 20 bytes)
Bytes 148+:  Pixel Data (compressed, BC3 format)
             - Level 0 (2048×2048): 2,097,152 bytes
             - Level 1 (1024×1024): 524,288 bytes
             - Level 2 (512×512): 131,072 bytes
             - ... (continues for all mipmap levels)

Total File Size (BC3, 2048×2048, full mipmaps): ~2.7MB
```

**Critical Header Fields for AMS2 Compatibility:**
```c
typedef struct {
    DWORD dwSize;              // Must be 124
    DWORD dwFlags;             // 0x1007 (DDSD_CAPS | DDSD_HEIGHT | DDSD_WIDTH | DDSD_PIXELFORMAT)
    DWORD dwHeight;            // 2048
    DWORD dwWidth;             // 2048
    DWORD dwPitchOrLinearSize; // 0 for compressed
    DWORD dwDepth;             // 0 (not a volume texture)
    DWORD dwMipMapCount;       // 12 (for 2048×2048)
    // ... (additional fields)
} DDS_HEADER;

// DXT10 Extended Header (for BC3):
typedef struct {
    DXGI_FORMAT dxgiFormat;    // DXGI_FORMAT_BC3_UNORM (77)
    UINT resourceDimension;    // D3D11_RESOURCE_DIMENSION_TEXTURE2D (3)
    UINT miscFlag;             // 0
    UINT arraySize;            // 1
    UINT miscFlags2;           // 0
} DDS_HEADER_DXT10;
```

#### Pre-Multiplied Alpha

**AMS2 Requirement:** Textures MUST use pre-multiplied alpha for correct blending.

```python
def premultiply_alpha(image: Image.Image) -> Image.Image:
    """Convert straight alpha to pre-multiplied alpha."""
    r, g, b, a = image.split()

    # Pre-multiply RGB channels by alpha
    r = Image.eval(r, lambda px, a=a: int(px * a.getpixel((0, 0)) / 255))
    g = Image.eval(g, lambda px, a=a: int(px * a.getpixel((0, 0)) / 255))
    b = Image.eval(b, lambda px, a=a: int(px * a.getpixel((0, 0)) / 255))

    return Image.merge("RGBA", (r, g, b, a))

# Example:
# Straight Alpha: RGB=(255,0,0), A=128 → Red at 50% opacity
# Pre-Multiplied: RGB=(128,0,0), A=128 → Same visual result, correct for DDS
```

#### Color Space

```
Color Space: sRGB (gamma 2.2)
Color Profile: Do NOT embed ICC profiles (game engines ignore them)
Bit Depth: 8-bit per channel (RGBA8)

Note: Some tools export as linear RGB - MUST convert to sRGB before DDS compression.
```

#### Naming Conventions for AMS2

```
Automobilista 2 expects specific filenames:

Body Textures:
body2.dds        - Main livery texture (REQUIRED)
body2_alt.dds    - Alternate livery (optional, for custom liveries menu)

Additional Textures (optional):
decals.dds       - Sponsor logos/numbers (overlaid on body2.dds)
windows.dds      - Window tint/banners
wheels.dds       - Custom wheel liveries
driver.dds       - Driver suit texture

Installation Path:
C:\Users\<User>\Documents\Automobilista 2\UserData\CustomLiveries\<CarID>\<TeamID>\body2.dds

Example:
C:\Users\Alex\Documents\Automobilista 2\UserData\CustomLiveries\ginetta_g55_gt4_2\GIN\body2.dds
```

---

## TGA Format (Targa)

### Overview
**Usage:** iRacing, Le Mans Ultimate
**File Extension:** `.tga`
**Purpose:** Uncompressed or RLE-compressed raster format (legacy but widely supported)

### Technical Specifications

#### Resolution Requirements
```
Supported Resolutions:
- 1024×1024 (Low quality)
- 2048×2048 (Standard quality, RECOMMENDED)
- 4096×4096 (High quality, iRacing Pro users)

SimVox.ai Default: 2048×2048
```

#### Bit Depth Options

##### 24-bit RGB (No Alpha)
```
Format: RGB8 (8-bit per channel)
Channels: Red, Green, Blue (no transparency)
File Size (2048×2048): 12MB uncompressed, ~6MB with RLE

When to Use:
✅ iRacing car paints (most cars don't use alpha)
✅ Base liveries without transparency
⚠️ Cannot have transparent sponsor decals
```

##### 32-bit RGBA (With Alpha)
```
Format: RGBA8 (8-bit per channel)
Channels: Red, Green, Blue, Alpha
File Size (2048×2048): 16MB uncompressed, ~8MB with RLE

When to Use:
✅ Liveries with transparent decals
✅ Le Mans Ultimate (supports alpha)
⚠️ iRacing: Only some cars support alpha (check car-specific docs)
```

#### TGA Header Structure

```
TGA File Layout:
Bytes 0-17:   TGA Header (18 bytes)
Bytes 18+:    Color Map Data (if applicable, usually 0 bytes)
Bytes 18+:    Pixel Data (uncompressed or RLE compressed)
End:          TGA Footer (optional, TGA v2.0 only)

TGA Header Fields (18 bytes):
Byte 0:  ID Length (0)
Byte 1:  Color Map Type (0 = no color map)
Byte 2:  Image Type (2 = uncompressed RGB, 10 = RLE compressed RGB)
Bytes 3-7: Color Map Specification (all zeros)
Bytes 8-9: X Origin (0)
Bytes 10-11: Y Origin (0)
Bytes 12-13: Width (2048, little-endian)
Bytes 14-15: Height (2048, little-endian)
Byte 16: Pixel Depth (24 for RGB, 32 for RGBA)
Byte 17: Image Descriptor (0x00 for RGB, 0x08 for RGBA)
```

#### Compression: RLE (Run-Length Encoding)

```
SimVox.ai uses RLE compression to reduce file size:

Uncompressed TGA (2048×2048, 32-bit): 16MB
RLE Compressed TGA: 4-8MB (depends on livery complexity)

How RLE Works:
- Detects consecutive pixels with same color
- Encodes as: [RepeatCount, PixelColor] instead of [Pixel, Pixel, Pixel, ...]

Example:
Uncompressed: [Red, Red, Red, Red, Blue, Green, Green]
RLE Encoded:  [4×Red, 1×Blue, 2×Green]

Savings: Best for solid color areas (backgrounds), worst for complex photos
```

#### iRacing-Specific Requirements

##### File Naming Convention
```
iRacing expects specific filename format:

car_<CarID>_<Number>.tga

Examples:
car_porsche992gt3r_42.tga   - Porsche 992 GT3 R, car #42
car_mclaren720sgt3_7.tga    - McLaren 720S GT3, car #7

Number Range: 0-999 (iRacing supports up to 1000 unique cars per session)

Installation Path:
C:\Users\<User>\Documents\iRacing\paint\<CarFolderName>\car_<CarID>_<Number>.tga

Example:
C:\Users\Alex\Documents\iRacing\paint\porsche992gt3r\car_porsche992gt3r_42.tga
```

##### Custom Number/Name Overlay

iRacing supports embedding custom number in filename:
```
Special Naming:
car_porsche992gt3r_42_rodriguez.tga   - Adds driver name "Rodriguez"

Note: iRacing Paint Shop has specific templates for number placement.
SimVox.ai must render numbers on UV texture (not rely on filename).
```

##### Trading Paints Integration

```
Trading Paints Downloader:
- Runs on localhost:34034
- Polls iRacing for active session
- Downloads .tga files from Trading Paints servers
- Copies to Documents\iRacing\paint\

SimVox.ai Export Strategy:
1. Export TGA to iRacing paint folder (direct install)
2. Optionally upload to Trading Paints (requires API key, Pro tier feature)
```

#### Le Mans Ultimate (LMU) TGA Specs

```
Differences from iRacing:
- Uses 32-bit RGBA (alpha channel supported)
- Different naming: <TeamID>_<CarNumber>.tga
- Installation path: <LMU_Install>\UserData\CustomLiveries\<CarID>\

Example:
C:\Program Files\Le Mans Ultimate\UserData\CustomLiveries\hypercar_porsche_963\team_SimVox.ai_42.tga
```

---

## PNG Format (Portable Network Graphics)

### Overview
**Usage:** User uploads, preview renders, community sharing
**File Extension:** `.png`
**Purpose:** Lossless compression for photos and renders

### Technical Specifications

#### Resolution Requirements
```
Input Photos (User Uploads):
- Minimum: 800×600 (low quality, acceptable)
- Recommended: 1920×1080 (Full HD, good quality)
- Maximum: 7680×4320 (8K, overkill)

SimVox.ai internally resizes to 1024×1024 for AI processing.

Preview Renders (SimVox.ai Generates):
- Thumbnails: 400×300 (card previews)
- Standard: 1920×1080 (gallery view)
- High-Res: 3840×2160 (4K, for content creators)
```

#### Color Depth
```
Input Photos: 24-bit RGB or 32-bit RGBA
AI Processing: Converts to RGB (discards alpha channel)
Output Previews: 24-bit RGB (no transparency needed)
```

#### Compression Level
```
PNG Compression (zlib):
Level 0: Uncompressed (16MB for 2048×2048 RGB)
Level 6: Default (4-6MB, good balance) ← SimVox.ai uses this
Level 9: Maximum (3-4MB, slower encoding)

SimVox.ai Setting: Level 6 (fast encoding, good compression)
```

#### Color Space
```
Color Space: sRGB (with embedded ICC profile for accurate colors)
Gamma: 2.2 (standard for web/desktop)

Note: AI models expect sRGB input. LinearRGB photos must be converted.
```

#### Metadata (EXIF/PNG Chunks)

```
SimVox.ai Embeds Metadata in Exported PNGs:

tEXt Chunks (Text Metadata):
- "Software": "SimVox.ai AI Livery Designer v0.1.0"
- "CreationTime": "2025-01-11T14:32:00Z"
- "CarModel": "Porsche 992 GT3 R"
- "Simulator": "Automobilista 2"
- "QualityScore": "89"

Example Python (writing PNG with metadata):
from PIL import Image
from PIL.PngImagePlugin import PngInfo

metadata = PngInfo()
metadata.add_text("Software", "SimVox.ai v0.1.0")
metadata.add_text("CarModel", "Porsche 992 GT3 R")

image.save("preview.png", pnginfo=metadata)
```

---

## GVOX Format (SimVox.ai Project)

### Overview
**Usage:** SimVox.ai project files (save/load livery projects)
**File Extension:** `.gvox`
**Purpose:** Store livery state for reopening/editing later

### Technical Specifications

#### Format Type
```
Container: ZIP archive (standard ZIP compression)
Contents: JSON metadata + image layers + 3D model references

Why ZIP?
✅ Standard format (can be opened with any unzip tool)
✅ Good compression (livery images compress 3-5x)
✅ Supports multiple files (layers, metadata, previews)
```

#### File Structure

```
livery_project.gvox (ZIP archive)
│
├── manifest.json              # Project metadata (see schema below)
├── layers/
│   ├── base_layer.png        # AI-generated base livery (2048×2048)
│   ├── user_edits.png        # User modifications overlay (2048×2048, transparent)
│   ├── sponsors/
│   │   ├── logo_shell.png    # Individual sponsor logos (transparent PNG)
│   │   ├── logo_gulf.png
│   │   └── logo_mobil1.png
│   └── numbers/
│       ├── number_42.png     # Car number graphics
│       └── driver_name.png   # Driver name banner
├── reference/
│   ├── input_photo.jpg       # Original user-uploaded photo
│   └── comparison_grid.png   # Side-by-side comparison render
├── previews/
│   ├── thumbnail.png         # 400×300 preview for UI
│   └── preview_3d.png        # 1920×1080 rendered 3D car preview
└── cache/
    └── uv_texture_final.dds  # Cached export (DDS or TGA)
```

#### Manifest Schema (manifest.json)

```json
{
  "gvox_version": "1.0.0",
  "created_at": "2025-01-11T14:32:00Z",
  "modified_at": "2025-01-11T15:45:00Z",
  "project_name": "Gulf Porsche Replica",

  "car": {
    "simulator": "automobilista2",
    "car_id": "porsche_992_gt3_r",
    "car_name": "Porsche 992 GT3 R",
    "uv_template_version": "v1.0"
  },

  "input": {
    "reference_photo": "reference/input_photo.jpg",
    "photo_analysis": {
      "view_angle": "side_view_45deg",
      "lighting_quality": "good",
      "quality_score": 87,
      "dominant_colors": ["#FF6B00", "#0066CC", "#FFFFFF"]
    }
  },

  "generation": {
    "ai_model": "auv_net_porsche_992_v1.2",
    "generation_timestamp": "2025-01-11T14:32:45Z",
    "inference_time_seconds": 28.3,
    "quality_metrics": {
      "accuracy_score": 89,
      "semantic_accuracy": 92,
      "color_accuracy": 87
    }
  },

  "layers": [
    {
      "id": "base_layer",
      "type": "ai_generated",
      "path": "layers/base_layer.png",
      "visible": true,
      "opacity": 1.0,
      "blend_mode": "normal"
    },
    {
      "id": "user_edits",
      "type": "user_edits",
      "path": "layers/user_edits.png",
      "visible": true,
      "opacity": 1.0,
      "blend_mode": "normal"
    },
    {
      "id": "logo_shell",
      "type": "sponsor_logo",
      "path": "layers/sponsors/logo_shell.png",
      "position": {"uv_x": 1024, "uv_y": 768},
      "scale": 1.5,
      "rotation": 0,
      "visible": true,
      "opacity": 1.0
    }
  ],

  "export_settings": {
    "format": "dds",
    "resolution": 2048,
    "compression": "bc3",
    "mipmaps": true,
    "car_number": "42",
    "driver_name": "A. Rodriguez"
  },

  "history": [
    {
      "timestamp": "2025-01-11T14:32:00Z",
      "action": "ai_generation",
      "description": "Generated base livery from photo"
    },
    {
      "timestamp": "2025-01-11T14:38:00Z",
      "action": "user_edit",
      "description": "Adjusted Shell logo position"
    },
    {
      "timestamp": "2025-01-11T15:45:00Z",
      "action": "export",
      "description": "Exported to AMS2 (DDS, 2048×2048)"
    }
  ]
}
```

#### Compression Settings
```
ZIP Compression Level: 6 (deflate algorithm)
Typical File Sizes:
- Uncompressed (all layers + metadata): 40-60MB
- Compressed (.gvox): 8-15MB (70-80% reduction)

Why Not Higher Compression?
- Level 9 only saves 5-10% more but takes 3x longer to save
- Level 6 is optimal for user experience (fast save/load)
```

---

## GMT/GMTK Format (AMS2 3D Models)

### Overview
**Usage:** Automobilista 2 car 3D models
**File Extension:** `.gmt` (static mesh), `.gmtk` (skinned mesh with bones)
**Purpose:** Store 3D geometry, UV coordinates, materials

### Technical Specifications

#### Format Type
```
Binary format (proprietary, reverse-engineered by modding community)
Endianness: Little-endian (Intel x86)
```

#### File Structure (Simplified)

```
GMT File Layout:
Bytes 0-3:   Magic Number "GMT " (0x20544D47)
Bytes 4-7:   Version (usually 2 or 3)
Bytes 8-11:  Vertex Count (e.g., 42,000 for GT3 car)
Bytes 12+:   Vertex Data (position, normal, UV, color)
...
Bytes X+:    Face Indices (triangles, 3 indices per face)
...
Bytes Y+:    Material Definitions (texture names, shaders)
...

Total File Size: 5-15MB per car model
```

#### UV Coordinates

```
UV Data in GMT:
- Stored per-vertex (each vertex has U, V coordinates)
- Format: Float32 (4 bytes per coordinate)
- Range: 0.0-1.0 (normalized, 0,0 = top-left, 1,1 = bottom-right)

Example Vertex Data:
Position: (x=1.23, y=0.45, z=-0.67)
Normal:   (nx=0.0, ny=1.0, nz=0.0)
UV:       (u=0.523, v=0.741)
Color:    (r=255, g=255, b=255, a=255)

Total: 40 bytes per vertex
Car with 42,000 vertices = 1.68MB just for vertex data
```

#### Extracting UV Template from GMT

SimVox.ai doesn't need to parse GMT directly. Instead, use PCarsTools (see [PCARSTOOLS-EXTRACTION-GUIDE.md](PCARSTOOLS-EXTRACTION-GUIDE.md)) to extract pre-rendered UV templates.

---

## MAS/BFF Format (AMS2 Archives)

### Overview
**Usage:** Automobilista 2 asset archives
**File Extension:** `.mas` (archive), `.bff` (big file format)
**Purpose:** Bundle multiple files (models, textures, physics) into single archive

### Technical Specifications

#### Format Type
```
Container: Custom archive format (proprietary)
Compression: oo2core_4 (Oodle compression, licensed by Reiza Studios)
```

#### Extraction

**DO NOT parse manually.** Use PCarsTools:
```bash
# Extract all files from .mas archive
pcarstools.exe extract "C:\Program Files\Automobilista 2\GameData\Vehicles\Textures\CustomLiveries.mas" -o "C:\extracted"
```

See [PCARSTOOLS-EXTRACTION-GUIDE.md](PCARSTOOLS-EXTRACTION-GUIDE.md) for full workflow.

---

## MIP Format (iRacing Textures)

### Overview
**Usage:** iRacing car paints (in game's internal format)
**File Extension:** `.mip`
**Purpose:** iRacing's proprietary texture format (similar to DDS)

### Technical Specifications

#### Format Type
```
Binary format: Proprietary DirectX texture format
Compression: BC1/BC3 (same as DDS)
Mipmaps: Always included
```

#### SimVox.ai Handling

```
SimVox.ai DOES NOT generate .mip files directly.

Workflow:
1. SimVox.ai exports .tga to iRacing paint folder
2. iRacing converts .tga → .mip on-the-fly when loading car
3. .mip files cached in: C:\Users\<User>\AppData\Local\iRacing\cache\

Note: .tga is the ONLY format users should install. iRacing handles .mip conversion.
```

---

## Export Format Matrix

### Which Format for Which Simulator?

| Simulator | Format | Compression | Resolution | Mipmaps | Alpha | Naming Convention |
|-----------|--------|-------------|-----------|---------|-------|-------------------|
| **Automobilista 2** | DDS | BC3 (DXT5) | 2048×2048 | ✅ Required | ✅ Yes | `body2.dds` |
| **iRacing** | TGA | RLE | 2048×2048 | ❌ No (game generates) | ⚠️ Rarely | `car_<carid>_<num>.tga` |
| **Assetto Corsa Competizione** | DDS | BC3 (DXT5) | 2048×2048 | ✅ Required | ✅ Yes | `<carid>_<teamid>.dds` |
| **Le Mans Ultimate** | TGA | RLE | 2048×2048 | ❌ No | ✅ Yes | `<teamid>_<num>.tga` |

### SimVox.ai Export Pipeline

```python
# Simplified export workflow

def export_livery(
    uv_texture: np.ndarray,  # 2048×2048 RGBA array
    simulator: str,          # "automobilista2", "iracing", "acc", "lmu"
    car_id: str,
    car_number: int,
    driver_name: str = None
):
    if simulator == "automobilista2":
        # Export DDS with BC3 compression
        dds_path = generate_dds(
            uv_texture,
            compression="BC3",
            mipmaps=True,
            premultiply_alpha=True
        )
        install_path = get_ams2_path(car_id, "body2.dds")
        shutil.copy(dds_path, install_path)

    elif simulator == "iracing":
        # Export TGA with RLE compression
        tga_path = generate_tga(
            uv_texture,
            compression="RLE",
            bit_depth=24  # Most iRacing cars don't need alpha
        )
        filename = f"car_{car_id}_{car_number}.tga"
        install_path = get_iracing_path(car_id, filename)
        shutil.copy(tga_path, install_path)

    elif simulator == "acc":
        # Similar to AMS2 (DDS, BC3)
        dds_path = generate_dds(uv_texture, compression="BC3", mipmaps=True)
        install_path = get_acc_path(car_id, f"{car_id}_custom.dds")
        shutil.copy(dds_path, install_path)

    elif simulator == "lmu":
        # Similar to iRacing (TGA, but with alpha support)
        tga_path = generate_tga(uv_texture, compression="RLE", bit_depth=32)
        filename = f"team_SimVox.ai_{car_number}.tga"
        install_path = get_lmu_path(car_id, filename)
        shutil.copy(tga_path, install_path)
```

---

## Tools & Libraries

### Python Libraries for Format Handling

```python
# requirements.txt
Pillow==11.0.0              # PNG, TGA read/write
numpy==2.1.0                # Array manipulation
imageio==2.36.0             # Additional format support
pydds==0.2.0                # DDS read/write (limited)
# Note: pydds doesn't support BC3 compression - must use custom implementation

# Custom DDS Library (Recommended):
# Use nvidia-texture-tools or DirectXTex (C++ with Python bindings)
# Or implement with ctypes + DirectXTex.dll
```

### Recommended Tools

```
NVIDIA Texture Tools (nvcompress):
- CLI tool for DDS compression
- Best BC3 quality
- GPU-accelerated compression
Download: https://developer.nvidia.com/nvidia-texture-tools-exporter

DirectXTex (texconv.exe):
- Microsoft's official DDS tool
- Supports all BC formats
- Reliable mipmap generation
Download: https://github.com/microsoft/DirectXTex/releases

SimVox.ai Strategy:
- Use texconv.exe via subprocess for DDS export (more reliable than pure Python)
```

---

**Last Updated:** January 11, 2025
**Status:** ✅ Format specifications complete → Ready for Phase 4 export implementation
