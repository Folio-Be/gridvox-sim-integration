# Sample Liveries - Week 3-4

This directory will contain existing AMS2 liveries for quality comparison.

## Purpose

Extract 5-10 existing high-quality liveries per test car to:
1. Understand how real-world designs translate to UV space
2. Study color space and compression settings
3. Create "ground truth" examples for AI quality comparison
4. Learn best practices for livery design

## Extraction

From AMS2 installation:

```
C:\GAMES\Automobilista 2\vehicles\{car_folder}\
  ├── {car}_livery_01.dds
  ├── {car}_livery_02.dds
  └── ...
```

Example:
```
C:\GAMES\Automobilista 2\vehicles\Porsche_992_GT3R\
  ├── porsche_992_gt3r_livery_51.dds  (Default livery)
  ├── porsche_992_gt3r_livery_01.dds
  └── ...
```

## Structure

```
sample-liveries/
├── porsche-992-gt3r/
│   ├── official_01.dds
│   ├── official_02.dds
│   ├── preview_01.png
│   └── preview_02.png
├── mclaren-720s-gt3-evo/
│   ├── official_01.dds
│   ├── official_02.dds
│   ├── preview_01.png
│   └── preview_02.png
└── bmw-m4-gt3/
    ├── official_01.dds
    ├── official_02.dds
    ├── preview_01.png
    └── preview_02.png
```

## Analysis Checklist

For each livery:
- [ ] DDS format (BC1/BC3/BC7?)
- [ ] Resolution (4096x4096?)
- [ ] Color space (sRGB/Linear?)
- [ ] Compression artifacts?
- [ ] Seam alignment quality
- [ ] Detail preservation
- [ ] Real-world photo it's based on (if any)
