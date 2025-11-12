# Unified Pipeline Implementation Roadmap

## Current Status (2025-11-12)

### ✅ Completed
- [x] AMS2 PSD loader (`@webtoon/psd`)
- [x] LMU TGA loader (`tga-js`)
- [x] Dual-format POC UI (PSD + TGA buttons)
- [x] Canvas rendering with blend modes
- [x] PNG export
- [x] Documentation for PSD and TGA formats

### 📦 Downloaded Templates
- [x] AMS2: 4 PSD templates (219 MB extracted)
- [x] LMU: 3 TGA liveries (210 MB extracted)
- [x] MSFS2024: 2 DDS packages (~700 MB)
- [ ] ACC: Google Drive folder found (pending download)
- [ ] AC: Google Drive folder found (pending download)

## Phase 1: DDS Support (Priority: HIGH)

### Goal
Enable loading and viewing DDS textures from MSFS2024 packages and prepare for ACC/AC support.

### Tasks

#### 1.1 DDS Parser (1-2 days)
- [ ] Port UTEX.js from `ams2-content-listing` POC
- [ ] Create `DDSParser.ts` class
  - Parse DDS header (dimensions, format, mipmaps)
  - Detect DXT1/DXT3/DXT5 compression
  - Extract raw compressed data
- [ ] Test with MSFS DDS files
  - Load `A339_AIRFRAME_BOTTOM_ALBD.PNG.DDS`
  - Verify header parsing (4096x4096, DXT5)
  - Extract compressed pixel data

**Files to Create:**
```
src/parsers/dds/
├── DDSParser.ts          # Header parsing, format detection
├── DDSTypes.ts          # TypeScript interfaces for DDS structures
└── DDSConstants.ts      # FourCC codes, format flags
```

#### 1.2 DXT Decompression (2-3 days)
- [ ] Implement DXT1 decompressor (RGB, no alpha)
- [ ] Implement DXT5 decompressor (RGBA)
- [ ] Convert to ImageData for canvas
- [ ] Performance optimization (Web Workers?)

**Options:**
1. **Pure JS**: Implement DXT algorithms directly (slower but portable)
2. **WASM**: Port C++ decompressor (squish, crunch) to WebAssembly (faster)
3. **WebGL**: GPU-based decompression (fastest but more complex)

**Recommended**: Start with pure JS, optimize later if needed.

**Files to Create:**
```
src/parsers/dds/
├── DXTDecompressor.ts   # DXT1/3/5 decompression algorithms
└── ImageDataConverter.ts # DXT → RGBA → ImageData
```

#### 1.3 DDS Loader Integration (1 day)
- [ ] Create `DDSLoader.tsx` component (similar to TGALoader)
- [ ] Add DDS file filter to Tauri dialog
- [ ] Parse DDS and convert to ImageData
- [ ] Pass to `UnifiedCanvas` for rendering

**Files to Create:**
```
src/components/
└── DDSLoader.tsx        # File picker + DDS parsing + ImageData conversion
```

#### 1.4 Update POC UI (1 day)
- [ ] Add "Load DDS Texture" button
- [ ] Update App.tsx to handle `dds` file type
- [ ] Test with MSFS AIRFRAME_BOTTOM_ALBD.dds
- [ ] Verify zoom/export still works

**Test Files:**
- `sims/MSFS2024/example-templates/.../A339_AIRFRAME_BOTTOM_ALBD.PNG.DDS`

**Deliverable**: POC can load and display DDS textures from MSFS packages.

---

## Phase 2: Unified Loader Architecture (Priority: MEDIUM)

### Goal
Refactor to single "Open Livery" button that auto-detects format.

### Tasks

#### 2.1 Format Detection (1 day)
- [ ] Create `FormatDetector.ts`
  - Detect by file extension (`.psd`, `.tga`, `.dds`)
  - Detect by directory structure (MSFS package = has `manifest.json`)
  - Detect by file header (fallback for misnamed files)
- [ ] Return `LiveryFormat` object with sim/type metadata

**Files to Create:**
```
src/loaders/base/
├── FormatDetector.ts     # Auto-detection logic
└── LiveryFormat.ts       # TypeScript interfaces
```

#### 2.2 Loader Registry (1 day)
- [ ] Create `LiveryLoaderRegistry.ts`
  - Map format types to loader classes
  - Factory method: `load(path) → LiveryDocument`
- [ ] Abstract base class `LiveryLoader`
  - `load(files: string[]): Promise<LiveryDocument>`
  - `save(doc: LiveryDocument, path: string): Promise<void>`

**Files to Create:**
```
src/loaders/base/
├── LiveryLoader.ts       # Abstract base class
├── LiveryDocument.ts     # Document interface
└── LiveryLoaderRegistry.ts # Factory/registry
```

#### 2.3 Refactor Existing Loaders (1-2 days)
- [ ] Convert `PSDLoader` to extend `LiveryLoader`
- [ ] Convert `TGALoader` to extend `LiveryLoader`
- [ ] Convert `DDSLoader` to extend `LiveryLoader`
- [ ] Return `LiveryDocument` instead of raw data

**Files to Modify:**
```
src/components/PSDLoader.tsx  → src/loaders/PSDLoader.ts
src/components/TGALoader.tsx  → src/loaders/TGALoader.ts
src/components/DDSLoader.tsx  → src/loaders/DDSLoader.ts
```

#### 2.4 Unified File Picker UI (1 day)
- [ ] Create `LiveryFilePicker.tsx`
  - Single "Open Livery" button
  - File filter: all supported extensions
  - Auto-detect format on selection
  - Load via registry
- [ ] Replace triple buttons (PSD/TGA/DDS) with single button
- [ ] Show detected format in badge

**Files to Create:**
```
src/components/
└── LiveryFilePicker.tsx  # Unified picker replacing PSD/TGA/DDS loaders
```

**Deliverable**: Single-button interface that handles all formats automatically.

---

## Phase 3: MSFS Package Support (Priority: MEDIUM)

### Goal
Handle multi-file MSFS packages (50+ DDS files organized in components).

### Tasks

#### 3.1 Package Structure Parser (1-2 days)
- [ ] Parse `manifest.json` (metadata)
- [ ] Parse `layout.json` (file listing)
- [ ] Build component tree:
  ```
  AIRFRAME
  ├── BOTTOM (ALBD, NORM, COMP)
  ├── TOP (ALBD, NORM, COMP)
  └── DECALS (ALBD)
  WINGS
  ├── UPPER (ALBD, NORM, COMP)
  └── LOWER (ALBD, NORM, COMP)
  COCKPIT (...)
  ```
- [ ] Identify main livery textures (AIRFRAME_BOTTOM_ALBD priority)

**Files to Create:**
```
src/loaders/msfs/
├── MSFSPackageParser.ts  # Manifest/layout parsing
├── MSFSComponent.ts      # Component tree structure
└── MSFSPackageLoader.ts  # Package loader (extends LiveryLoader)
```

#### 3.2 Component Selector UI (2 days)
- [ ] Tree view of aircraft components
- [ ] Click to select component
- [ ] Load selected texture to canvas
- [ ] Show related textures (NORM, COMP) as layers

**Files to Create:**
```
src/components/msfs/
├── MSFSComponentTree.tsx # Tree view UI
└── MSFSControls.tsx      # MSFS-specific controls
```

#### 3.3 Multi-Texture Editing (2-3 days)
- [ ] Load ALBD (albedo) as main texture
- [ ] Load NORM (normal map) as reference layer (view-only)
- [ ] Load COMP (composite) as reference layer
- [ ] Switch between components without reloading entire package

**Deliverable**: Edit MSFS packages by selecting specific aircraft components.

---

## Phase 4: Export Pipeline (Priority: MEDIUM)

### Goal
Export edited liveries back to native format.

### Tasks

#### 4.1 PNG Export (Already Done)
- [x] Canvas → PNG blob
- [x] Download to file

#### 4.2 TGA Export (1 day)
- [ ] Create `TGAEncoder.ts`
  - ImageData → TGA format
  - RLE compression (optional)
- [ ] Add "Export as TGA" button for LMU liveries

**Files to Create:**
```
src/exporters/
└── TGAEncoder.ts         # ImageData → TGA bytes
```

#### 4.3 DDS Export (3-4 days)
- [ ] Create `DDSEncoder.ts`
  - ImageData → RGBA
  - Compress to DXT1 or DXT5
  - Generate mipmaps
  - Write DDS header + data
- [ ] Add "Export as DDS" button

**Challenges:**
- DXT compression is CPU-intensive (may need WASM)
- Mipmap generation requires downsampling algorithms

**Options:**
1. **JS Library**: `dds-writer`, `texture-compressor` (if exists)
2. **WASM**: Port `squish` or `crunch` compressor
3. **Server-side**: Send to Node.js/Python backend for compression

**Files to Create:**
```
src/exporters/
├── DDSEncoder.ts         # ImageData → DDS bytes
└── DXTCompressor.ts      # DXT1/5 compression algorithms
```

#### 4.4 MSFS Repackaging (2-3 days)
- [ ] Replace edited DDS in package structure
- [ ] Recalculate file hash/size for `layout.json`
- [ ] Update `layout.json`
- [ ] Zip/package for installation

**Files to Create:**
```
src/exporters/msfs/
├── MSFSPackager.ts       # Rebuild package structure
└── LayoutJsonUpdater.ts  # Update layout.json with new files
```

**Deliverable**: Export edited MSFS liveries as installable packages.

---

## Phase 5: ACC/AC Support (Priority: LOW)

### Goal
Download and support ACC/AC templates from Google Drive.

### Tasks

#### 5.1 Download Templates (1 day)
- [ ] Manual download from https://drive.google.com/drive/folders/1er3RbPLwVHSFcs_5S_vNEJZvLewK5M9l
- [ ] Extract and analyze structure
- [ ] Document format (likely DDS, maybe PSD)
- [ ] Create format analysis markdown

**Location:**
```
sims/ACC/example-templates/
sims/AC/example-templates/
```

#### 5.2 Format Integration (1-2 days)
- [ ] If DDS: Already supported via DDSLoader
- [ ] If PSD: Already supported via PSDLoader
- [ ] Add format detection rules for ACC/AC
- [ ] Test loading ACC/AC templates

**Deliverable**: POC supports ACC and AC livery formats.

---

## Phase 6: Advanced Features (Priority: LOW - Future)

### Drawing Tools
- [ ] Brush tool (size, opacity, color)
- [ ] Shape tools (rectangle, circle, line)
- [ ] Text tool (font selection, size, color)
- [ ] Eraser tool
- [ ] Color picker / palette

### Layer Management
- [ ] Create new layers on top of base
- [ ] Layer visibility toggles
- [ ] Layer blending modes
- [ ] Layer reordering (bring to front, send to back)
- [ ] Delete layers

### Template Library
- [ ] Browse templates by sim
- [ ] Thumbnail previews
- [ ] Search/filter by car/class
- [ ] Favorites system
- [ ] Recent files

---

## Timeline Estimate

### Sprint 1: DDS Foundation (1-2 weeks)
- Phase 1.1-1.4: DDS parser + loader + POC integration
- **Deliverable**: Load and view MSFS DDS textures

### Sprint 2: Unified Architecture (1 week)
- Phase 2.1-2.4: Format detection + loader registry + unified UI
- **Deliverable**: Single "Open Livery" button

### Sprint 3: MSFS Packages (1-2 weeks)
- Phase 3.1-3.3: Package parsing + component selector + multi-texture
- **Deliverable**: Edit MSFS packages by component

### Sprint 4: Export Pipeline (1-2 weeks)
- Phase 4.2-4.4: TGA/DDS export + MSFS repackaging
- **Deliverable**: Export to native formats

### Sprint 5: ACC/AC (1 week)
- Phase 5.1-5.2: Download + integrate ACC/AC templates
- **Deliverable**: Full multi-sim support

**Total MVP**: 5-8 weeks

---

## Immediate Next Steps (This Week)

1. **Install DDS dependencies** (if needed)
   ```bash
   npm install utif  # Multi-format image parser (includes DDS)
   ```

2. **Port UTEX.js** from `ams2-content-listing`
   - Copy DDS parsing code
   - Adapt to TypeScript
   - Create standalone `DDSParser.ts`

3. **Create DDSLoader component**
   - Similar structure to `TGALoader.tsx`
   - Parse DDS → ImageData
   - Test with MSFS albedo texture

4. **Add DDS button to POC**
   - Update `App.tsx` with `dds` file type
   - Add "Load DDS Texture" button
   - Wire up to UnifiedCanvas

5. **Test end-to-end**
   - Load BMW M4 GT3 PSD (AMS2) ✅
   - Load Aston Martin TGA (LMU) ✅
   - Load A330 ALBD DDS (MSFS) ⚠️ NEW
   - Verify all render correctly
   - Export each to PNG

---

## Success Metrics

### Phase 1 Complete When:
- ✅ Can load MSFS DDS file
- ✅ Displays correctly on canvas
- ✅ Zoom/export works same as PSD/TGA
- ✅ No errors in console

### Phase 2 Complete When:
- ✅ Single "Open Livery" button
- ✅ Auto-detects PSD/TGA/DDS
- ✅ Shows format badge (e.g., "MSFS2024 - DDS")
- ✅ All existing functionality preserved

### Full Pipeline Complete When:
- ✅ Load any format from any sim
- ✅ Edit on unified canvas
- ✅ Export to native format
- ✅ No manual format selection needed
- ✅ Professional UX (smooth, fast, intuitive)

---

## Notes

- **DDS is the critical path**: Blocks MSFS, ACC, AC support
- **Start simple**: Read-only first, export later
- **Incremental integration**: Add formats one at a time
- **Test constantly**: Don't build without testing
- **Document as you go**: Update format analysis docs

**Next Action**: Implement DDS parser (Phase 1.1)
