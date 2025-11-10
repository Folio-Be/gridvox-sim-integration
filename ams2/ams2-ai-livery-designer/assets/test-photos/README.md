# Reference Photos - Week 3-4

This directory will contain real-world GT3 race car photos collected during Week 3-4.

## Structure

```
test-photos/
├── porsche-992-gt3r/
│   ├── front/
│   ├── side/
│   ├── rear/
│   └── 3-4-view/
├── mclaren-720s-gt3-evo/
│   ├── front/
│   ├── side/
│   ├── rear/
│   └── 3-4-view/
└── bmw-m4-gt3/
    ├── front/
    ├── side/
    ├── rear/
    └── 3-4-view/
```

## Requirements

- **Resolution:** 1920x1080 or higher
- **Format:** JPG or PNG
- **Lighting:** Good, even lighting (avoid harsh shadows)
- **Angles:** Front, side, rear, and 3/4 views
- **Background:** Any (will be removed by SAM)
- **Quantity:** 10+ photos per car

## Sources

- Racing team official photos
- Race event photography
- GT3 manufacturer press images
- Motorsport photography websites
- iRacing/ACC/AMS2 community livery references

## Notes

Photos will be used as:
1. **Training data** for style transfer (IPAdapter)
2. **Reference input** for ControlNet conditioning
3. **Ground truth** for quality comparison
