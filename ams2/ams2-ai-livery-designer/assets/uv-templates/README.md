# UV Templates - Week 3-4

This directory will contain UV texture templates extracted from AMS2 game files.

## Extraction Process

Using **PCarsTools** to extract from AMS2:

```powershell
# Locate AMS2 vehicle packages
C:\GAMES\Automobilista 2\vehicles\

# Extract .mas/.gmt files for target cars:
- Porsche_992_GT3R\Porsche_992_GT3R.crd
- McLaren_720S_GT3_Evo\McLaren_720S_GT3_Evo.crd
- BMW_M4_GT3\BMW_M4_GT3.crd
```

## Expected Files

```
uv-templates/
├── porsche-992-gt3r/
│   ├── livery_template.dds
│   ├── uv_layout.png
│   ├── wireframe_overlay.png
│   └── metadata.json
├── mclaren-720s-gt3-evo/
│   ├── livery_template.dds
│   ├── uv_layout.png
│   ├── wireframe_overlay.png
│   └── metadata.json
└── bmw-m4-gt3/
    ├── livery_template.dds
    ├── uv_layout.png
    ├── wireframe_overlay.png
    └── metadata.json
```

## File Formats

- **DDS** - DirectDraw Surface (AMS2 native format)
- **PNG** - UV layout visualization
- **JSON** - Metadata (resolution, seam locations, problematic areas)

## Metadata Example

```json
{
  "car_id": "Porsche_992_GT3R",
  "car_name": "Porsche 992 GT3 R",
  "texture_resolution": "4096x4096",
  "format": "DDS BC3",
  "seam_locations": [
    "Hood center line",
    "Door edges",
    "Rear wing mounting"
  ],
  "problem_areas": [
    "Complex door panel curvature",
    "Wheel arch wrapping"
  ]
}
```

## Tools

- **PCarsTools** - Extract .mas/.gmt files
- **Photoshop/GIMP** - View and edit DDS files
- **Intel Texture Works** - DDS plugin for Photoshop
- **NVIDIA Texture Tools** - DDS command-line tools
