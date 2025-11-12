# AMS2 Car Image Extractor

**Developer-only tool** for extracting individual car images from Automobilista 2 .bff archives.

## Purpose

Automobilista 2 stores car preview images in a compressed `GUIVEHICLEIMAGES.bff` archive, not as individual thumbnail files. This tool:

1. **Extracts** 3D-rendered car preview images from GUIVEHICLEIMAGES.bff using PCarsTools
2. **Converts** DDS textures to web-friendly PNG format
3. **Crops & Resizes** to thumbnail dimensions (512×128)
4. **Organizes** output by manufacturer, class, and DLC
5. **Generates** manifest for SimVox.ai integration

**Note:** This tool extracts proper 3D-rendered car showcase images (2048×768), NOT UV-mapped livery textures.

## Output Use Cases

Extracted images can be:
- **Bundled** with SimVox.ai installer (shipped with app)
- **Hosted** on CDN/website for on-demand loading
- **Cached** locally by users on first launch

## ⚠️ NOT for End Users

This is a **developer tool** for the SimVox.ai team. It requires:
- .NET 6.0 Runtime
- PCarsTools binary
- Oodle compression DLL (`oo2core_4_win64.dll`)
- AMS2 installation with full game files

End users will **NOT** run this tool - they receive pre-processed images.

## Prerequisites

### 1. .NET 6.0 Runtime

Download from: https://dotnet.microsoft.com/download/dotnet/6.0

```bash
# Verify installation
dotnet --version
# Should output: 6.0.x or higher
```

### 2. PCarsTools

Download from: https://github.com/Nenkai/PCarsTools/releases

**Steps:**
1. Go to https://github.com/Nenkai/PCarsTools/releases
2. Download latest `PCarsTools_x64.zip` (or similar)
3. Extract the ZIP file
4. Create directory: `tools/PCarsTools/` in this project
5. Copy `pcarstools_x64.exe` to `tools/PCarsTools/`
6. Verify: `tools/PCarsTools/pcarstools_x64.exe` exists

### 3. Oodle DLL

**Legal Note:** This DLL is proprietary. You must:
- Extract from your own AMS2 installation
- OR obtain from PCarsTools releases (if included)
- DO NOT redistribute publicly

**Option A: Extract from AMS2 (Recommended)**

The `oo2core_4_win64.dll` file is located in your AMS2 installation root directory:

```bash
# Default location
C:\GAMES\Automobilista 2\oo2core_4_win64.dll

# Or in Steam
C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\oo2core_4_win64.dll
```

**Steps:**
1. Copy `oo2core_4_win64.dll` from your AMS2 installation
2. Paste it into `tools/PCarsTools/` directory in this project
3. Verify: `tools/PCarsTools/oo2core_4_win64.dll` exists

**Option B: From other sources**
- May be included with PCarsTools releases
- May be in other Codemasters/Slightly Mad Studios games

### 4. Node.js Dependencies

```bash
npm install
```

## Installation

```bash
cd C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-car-image-extractor
npm install
```

## Usage

### Quick Start

```bash
# Test mode - process only 5 vehicles
npm run test

# Full extraction - all 387 vehicles (45-90 min)
npm run process-all

# With options
npm run process-all -- --limit 10 --verbose
```

### Command Options

```bash
# Show help
npm run help

# Custom AMS2 installation path
npm run process-all -- --path "D:\Games\Automobilista 2"

# Process specific number of vehicles
npm run process-all -- --limit 50

# Test mode (5 vehicles only)
npm run process-all -- --test

# Verbose output
npm run process-all -- --verbose
```

### What the Tool Does

The `process-all` command runs all phases automatically:

1. ✅ **Verification** - Checks PCarsTools and Oodle DLL
2. 🔍 **Scanning** - Finds all vehicles using ams2-content-listing
3. 📦 **Extraction** - Extracts GUIVEHICLEIMAGES.bff (once for all vehicles)
4. 🖼️ **Conversion** - Converts DDS→PNG, crops to 512×128
5. 📁 **Organization** - Sorts by manufacturer/class/DLC
6. 📄 **Manifest** - Generates JSON metadata

**Performance:**
- Test mode (5 vehicles): <1 second (after initial extraction)
- Initial GUIVEHICLEIMAGES.bff extraction: ~5-10 minutes (1.1GB file)
- Full processing (387 vehicles): ~10-15 minutes total

## Project Status

✅ **IMPLEMENTED**

Core functionality complete. Tool is ready for production use.

## Directory Structure

```
ams2-car-image-extractor/
├── README.md                    # This file
├── IMPLEMENTATION_PLAN.md       # Detailed implementation guide
├── package.json
├── tsconfig.json
├── .gitignore
├── src/
│   ├── cli.ts                  # CLI interface
│   ├── extractor.ts            # .bff extraction logic
│   ├── pcars-tools-wrapper.ts  # PCarsTools CLI wrapper
│   ├── image-processor.ts      # DDS→PNG conversion & cropping
│   ├── uploader.ts             # CDN upload logic
│   └── types.ts                # TypeScript types
├── tools/
│   └── PCarsTools/             # PCarsTools binary (gitignored)
│       ├── pcarstools_x64.exe
│       └── oo2core_7_win64.dll
├── output/
│   ├── extracted/              # Raw DDS files from .bff (gitignored)
│   ├── thumbnails/             # Processed PNG thumbnails (gitignored)
│   └── manifest.json           # Extraction tracking (gitignored)
└── manifest.json               # Tracks processed files
```

## Expected Output

### Thumbnail Organization

```
output/
├── extracted/
│   └── gui/
│       └── vehicleimages/
│           ├── vehicleimages_alpine_a424/
│           │   ├── alpine_a424_livery_51.dds  (2048×768 preview)
│           │   ├── alpine_a424_livery_52.dds
│           │   └── ...
│           └── ...
└── thumbnails/
    ├── by-manufacturer/
    │   ├── Porsche/
    │   │   ├── Porsche_963_GTP.png  (512×128)
    │   │   └── ...
    │   └── ...
    ├── by-class/
    │   ├── GT3/
    │   │   └── ...
    │   └── ...
    └── by-dlc/
        ├── base/
        │   └── ...
        └── ...
```

### Manifest Format

```json
{
  "version": "1.0.0",
  "extractedAt": "2025-11-05T12:00:00Z",
  "ams2InstallPath": "C:\\GAMES\\Automobilista 2",
  "totalVehicles": 387,
  "processed": 387,
  "failed": 0,
  "vehicles": [
    {
      "id": "porsche_963_gtp",
      "displayName": "Porsche 963",
      "manufacturer": "Porsche",
      "class": "LMDh",
      "dlc": "endurancept2pack",
      "bffFile": "Pakfiles\\GUIVEHICLEIMAGES.bff",
      "thumbnailPath": "thumbnails/by-manufacturer/Porsche/Porsche_963_GTP.png",
      "sourceTexture": "porsche_963_gtp_livery_51.dds",
      "extractedAt": "2025-11-05T12:05:00Z"
    }
  ]
}
```

## Performance Estimates

| Task | Duration | Notes |
|------|----------|-------|
| Extract GUIVEHICLEIMAGES.bff | 5-10 min | One-time, 1.1GB archive |
| Convert DDS → PNG | 3-5 min | 387 files with Sharp |
| Crop & resize | Included | Sharp resizes during conversion |
| Organization | <1 min | File copying |
| Upload to CDN | 5-10 min | Depends on bandwidth |
| **Total** | **10-20 min** | One-time process |

## SimVox.ai Integration

### Option A: Bundle with Installer

1. Run extraction once during SimVox.ai build
2. Include PNG thumbnails in installer
3. Ship to users (~20MB additional size)

### Option B: CDN Hosting

1. Upload thumbnails to SimVox.ai CDN
2. SimVox.ai app downloads on first launch
3. Cache locally (~20MB in user's AppData)

### Option C: Hybrid

1. Bundle base game thumbnails with installer
2. Download DLC thumbnails on-demand
3. Best user experience

## Legal Considerations

### Can We Redistribute Images?

**Gray Area** - These are:
- Extracted from game files user owns
- Transformed (cropped, resized)
- Used for legitimate SimVox.ai functionality

**Safest Approach:**
- User extracts images themselves (via SimVox.ai)
- SimVox.ai provides tool, not images
- Like game mod managers

**Alternative:**
- Host on SimVox.ai servers
- Terms of service agreement
- Fair use argument (thumbnails for companion app)

Consult legal counsel before final distribution method.

## Troubleshooting

### PCarsTools Not Found

```
Error: pcarstools_x64.exe not found
```

**Solution:** Download PC

arsTools and place in `tools/PCarsTools/`

### Oodle DLL Missing

```
Error: oo2core_7_win64.dll not found
```

**Solution:** Copy Oodle DLL to `tools/PCarsTools/`

### Extraction Fails

```
Error: Failed to extract [filename].bff
```

**Possible causes:**
- Corrupted .bff file
- Insufficient disk space
- Antivirus blocking PCarsTools

**Solution:**
- Verify AMS2 game files (Steam/Properties/Verify)
- Free up disk space (need ~2GB temporary)
- Add PCarsTools to antivirus exceptions

### Conversion Fails

```
Error: Failed to convert DDS to PNG
```

**Possible causes:**
- Unsupported DDS format
- Corrupted texture file
- Sharp library issue

**Solution:**
- Skip failed files (non-critical)
- Log errors for manual review
- Use fallback (class badge instead)

## Related Projects

- **ams2-content-listing** - Scans AMS2 content metadata
- **PCarsTools** - https://github.com/Nenkai/PCarsTools
- **SimVox.ai** - Main sim racing companion app

## Future Enhancements

- [ ] Parallel .bff extraction (faster)
- [ ] GPU-accelerated DDS conversion
- [ ] Incremental updates (only new DLC)
- [ ] Quality presets (high/medium/low)
- [ ] WebP output option (smaller files)
- [ ] Automatic CDN sync
- [ ] Progress UI for long operations

## License

MIT

## Contributing

This is part of the SimVox.ai sim racing companion project.

**To implement this tool:**
1. Review [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
2. Set up prerequisites (PCarsTools, .NET 6.0)
3. Implement extraction pipeline
4. Test with subset of vehicles first
5. Run full extraction once ready
6. Decide distribution method (bundle vs CDN)

## Contact

For SimVox.ai team only. Questions: see main SimVox.ai repository.
