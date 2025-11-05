# AMS2 Car Image Extractor

**Developer-only tool** for extracting individual car images from Automobilista 2 .bff archives.

## Purpose

Automobilista 2 stores car livery textures in compressed .bff archive files, not as individual thumbnail images. This tool:

1. **Extracts** livery textures from .bff files using PCarsTools
2. **Converts** DDS textures to web-friendly PNG format
3. **Crops & Resizes** to thumbnail dimensions (512x128)
4. **Organizes** output by manufacturer, class, and DLC
5. **Generates** manifest for GridVox integration

## Output Use Cases

Extracted images can be:
- **Bundled** with GridVox installer (shipped with app)
- **Hosted** on CDN/website for on-demand loading
- **Cached** locally by users on first launch

## ⚠️ NOT for End Users

This is a **developer tool** for the GridVox team. It requires:
- .NET 6.0 Runtime
- PCarsTools binary
- Oodle compression DLL (`oo2core_7_win64.dll`)
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

1. Download latest `PCarsTools_x64.zip`
2. Extract to `tools/PCarsTools/`
3. Verify `tools/PCarsTools/pcarstools_x64.exe` exists

### 3. Oodle DLL

**Legal Note:** This DLL is proprietary. You must:
- Extract from your own AMS2 installation
- OR use from PCarsTools dependencies
- DO NOT redistribute

Location:
- Copy `oo2core_7_win64.dll` to `tools/PCarsTools/` directory

### 4. Node.js Dependencies

```bash
npm install
```

## Installation

```bash
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\ams2-car-image-extractor
npm install
```

## Usage

### Step 1: List Available Content

```bash
npm run list
```

Scans AMS2 installation and lists all .bff files with car liveries.

### Step 2: Extract Textures

```bash
npm run extract
```

Uses PCarsTools to extract livery DDS files from .bff archives to `output/extracted/`.

**Note:** This is SLOW - may take 30-60 minutes for all 387 cars.

### Step 3: Convert to PNG Thumbnails

```bash
npm run convert
```

Processes extracted DDS files:
- Converts DDS → PNG
- Crops/resizes to 512x128 thumbnail
- Organizes by manufacturer/class
- Outputs to `output/thumbnails/`

### Step 4: Upload (Optional)

```bash
npm run upload
```

Uploads processed thumbnails to CDN or bundles with GridVox.

## Project Status

🚧 **NOT YET IMPLEMENTED** 🚧

This project is documented for future development. Implementation will be done when needed for GridVox production.

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed architecture and implementation guide.

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
output/thumbnails/
├── by-manufacturer/
│   ├── Porsche/
│   │   ├── porsche_963_gtp.png
│   │   ├── porsche_911_gt3_cup.png
│   │   └── ...
│   ├── Ferrari/
│   │   └── ...
│   └── ...
├── by-class/
│   ├── GT3/
│   │   └── ...
│   ├── LMDh/
│   │   └── ...
│   └── ...
└── by-dlc/
    ├── base/
    │   └── ...
    ├── endurancept2pack/
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
      "bffFile": "Pakfiles\\Vehicles\\Porsche_963_GTP_Livery.bff",
      "thumbnailPath": "output/thumbnails/by-manufacturer/Porsche/porsche_963_gtp.png",
      "sourceTexture": "livery_00.dds",
      "extractedAt": "2025-11-05T12:05:00Z"
    }
  ]
}
```

## Performance Estimates

| Task | Duration | Notes |
|------|----------|-------|
| Extract all .bff files | 30-60 min | PCarsTools is slow |
| Convert DDS → PNG | 5-10 min | 387 files with Sharp |
| Crop & resize | 2-3 min | Fast with Sharp |
| Upload to CDN | 5-10 min | Depends on bandwidth |
| **Total** | **45-90 min** | One-time process |

## GridVox Integration

### Option A: Bundle with Installer

1. Run extraction once during GridVox build
2. Include PNG thumbnails in installer
3. Ship to users (~20MB additional size)

### Option B: CDN Hosting

1. Upload thumbnails to GridVox CDN
2. GridVox app downloads on first launch
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
- Used for legitimate GridVox functionality

**Safest Approach:**
- User extracts images themselves (via GridVox)
- GridVox provides tool, not images
- Like game mod managers

**Alternative:**
- Host on GridVox servers
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
- **GridVox** - Main sim racing companion app

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

This is part of the GridVox sim racing companion project.

**To implement this tool:**
1. Review [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
2. Set up prerequisites (PCarsTools, .NET 6.0)
3. Implement extraction pipeline
4. Test with subset of vehicles first
5. Run full extraction once ready
6. Decide distribution method (bundle vs CDN)

## Contact

For GridVox team only. Questions: see main GridVox repository.
