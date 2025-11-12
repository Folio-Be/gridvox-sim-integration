# AMS2 Car Image Extractor - Implementation Plan

Comprehensive guide for implementing the car image extraction tool.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Design](#component-design)
3. [Implementation Steps](#implementation-steps)
4. [PCarsTools Integration](#pcarstools-integration)
5. [Image Processing Pipeline](#image-processing-pipeline)
6. [Error Handling](#error-handling)
7. [Testing Strategy](#testing-strategy)
8. [Distribution Strategy](#distribution-strategy)

---

## Architecture Overview

### System Flow

```
AMS2 Installation
      ↓
[1. Content Scanner] ← (Uses ams2-content-listing)
      ↓
[2. .BFF Extractor] ← (PCarsTools wrapper)
      ↓
[3. DDS Processor] ← (UTEX.js decoder)
      ↓
[4. Image Cropper] ← (Sharp library)
      ↓
[5. PNG Converter] ← (Sharp library)
      ↓
[6. Organizer] ← (By manufacturer/class/DLC)
      ↓
[7. Manifest Generator]
      ↓
Output Directory
```

### Technology Stack

- **Node.js/TypeScript** - Main application runtime
- **PCarsTools** - .bff archive extraction (external binary)
- **UTEX.js** - DDS decoding (from ams2-content-listing)
- **Sharp** - Image processing (crop, resize, convert)
- **Child Process** - Execute PCarsTools CLI

---

## Component Design

### 1. CLI Interface (`cli.ts`)

**Purpose:** Command-line interface for all operations

**Commands:**
```typescript
interface CLI {
  list(): Promise<void>;      // List all vehicles and .bff files
  extract(): Promise<void>;   // Extract livery textures
  convert(): Promise<void>;   // Convert DDS → PNG thumbnails
  upload(): Promise<void>;    // Upload to CDN (future)
  clean(): Promise<void>;     // Clean output directory
}
```

**Implementation:**
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { Extractor } from './extractor';
import { ImageProcessor } from './image-processor';

const program = new Command();

program
  .name('ams2-car-image-extractor')
  .description('Extract car images from AMS2 .bff archives')
  .version('1.0.0');

program
  .command('list')
  .description('List all vehicles and .bff files')
  .option('-p, --path <path>', 'AMS2 installation path')
  .action(async (options) => {
    const extractor = new Extractor(options.path);
    await extractor.listContent();
  });

program
  .command('extract')
  .description('Extract livery textures from .bff files')
  .option('-p, --path <path>', 'AMS2 installation path')
  .option('-o, --output <path>', 'Output directory')
  .option('--parallel <count>', 'Parallel extractions', '1')
  .action(async (options) => {
    const extractor = new Extractor(options.path, options.output);
    await extractor.extractAll({ parallel: parseInt(options.parallel) });
  });

program
  .command('convert')
  .description('Convert DDS files to PNG thumbnails')
  .option('-i, --input <path>', 'Input directory with DDS files')
  .option('-o, --output <path>', 'Output directory for PNGs')
  .action(async (options) => {
    const processor = new ImageProcessor(options.input, options.output);
    await processor.convertAll();
  });

program.parse();
```

### 2. PCarsTools Wrapper (`pcars-tools-wrapper.ts`)

**Purpose:** Execute PCarsTools CLI commands

**Interface:**
```typescript
interface PCarsToolsWrapper {
  extractBFF(bffPath: string, outputDir: string): Promise<ExtractResult>;
  listContents(bffPath: string): Promise<string[]>;
  verifyInstallation(): boolean;
}

interface ExtractResult {
  success: boolean;
  extractedFiles: string[];
  errors: string[];
  duration: number;
}
```

**Implementation:**
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export class PCarsToolsWrapper {
  private toolsPath: string;
  private gameDir: string;

  constructor(gameDir: string) {
    this.toolsPath = join(__dirname, '..', 'tools', 'PCarsTools', 'pcarstools_x64.exe');
    this.gameDir = gameDir;
  }

  verifyInstallation(): boolean {
    if (!existsSync(this.toolsPath)) {
      throw new Error('PCarsTools not found at: ' + this.toolsPath);
    }

    const oodleDll = join(this.toolsPath, '..', 'oo2core_7_win64.dll');
    if (!existsSync(oodleDll)) {
      throw new Error('Oodle DLL not found at: ' + oodleDll);
    }

    return true;
  }

  async extractBFF(bffPath: string, outputDir: string): Promise<ExtractResult> {
    const startTime = Date.now();
    const result: ExtractResult = {
      success: false,
      extractedFiles: [],
      errors: [],
      duration: 0
    };

    try {
      // PCarsTools command: pak -i <bff> -g <game_dir> -o <output>
      const command = `"${this.toolsPath}" pak -i "${bffPath}" -g "${this.gameDir}" -o "${outputDir}"`;

      const { stdout, stderr } = await execAsync(command);

      result.success = true;
      result.extractedFiles = this.parseExtractedFiles(stdout);

      if (stderr) {
        result.errors.push(stderr);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private parseExtractedFiles(stdout: string): string[] {
    // Parse PCarsTools output to get list of extracted files
    // Format: "Extracted: path/to/file.dds"
    const lines = stdout.split('\n');
    const files: string[] = [];

    for (const line of lines) {
      if (line.includes('Extracted:')) {
        const file = line.split('Extracted:')[1].trim();
        files.push(file);
      }
    }

    return files;
  }

  async listContents(bffPath: string): Promise<string[]> {
    try {
      const command = `"${this.toolsPath}" pak -i "${bffPath}" --list`;
      const { stdout } = await execAsync(command);
      return stdout.split('\n').filter(line => line.trim());
    } catch (error) {
      console.error(`Failed to list ${bffPath}:`, error);
      return [];
    }
  }
}
```

### 3. Extractor (`extractor.ts`)

**Purpose:** Main extraction orchestration

**Interface:**
```typescript
interface Extractor {
  listContent(): Promise<VehicleInfo[]>;
  extractAll(options: ExtractOptions): Promise<ExtractionReport>;
  extractVehicle(vehicleId: string): Promise<ExtractResult>;
}

interface ExtractOptions {
  parallel?: number;          // Number of parallel extractions
  vehicleIds?: string[];      // Specific vehicles to extract
  skipExisting?: boolean;     // Skip already extracted
}

interface ExtractionReport {
  totalVehicles: number;
  extracted: number;
  failed: number;
  skipped: number;
  errors: Array<{ vehicleId: string; error: string }>;
  duration: number;
}
```

**Implementation:**
```typescript
import { AMS2ContentScanner, Vehicle } from 'ams2-content-listing';
import { PCarsToolsWrapper } from './pcars-tools-wrapper';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

export class Extractor {
  private scanner: AMS2ContentScanner;
  private pcarsTools: PCarsToolsWrapper;
  private installPath: string;
  private outputDir: string;

  constructor(installPath: string, outputDir?: string) {
    this.installPath = installPath;
    this.outputDir = outputDir || join(process.cwd(), 'output', 'extracted');
    this.scanner = new AMS2ContentScanner(installPath);
    this.pcarsTools = new PCarsToolsWrapper(installPath);
  }

  async listContent(): Promise<Vehicle[]> {
    console.log('Scanning AMS2 content...');
    const { database } = await this.scanner.scan();

    console.log(`\nFound ${database.vehicles.length} vehicles:\n`);

    for (const vehicle of database.vehicles) {
      const bffFile = this.getBFFPath(vehicle);
      const exists = existsSync(bffFile);
      console.log(`${vehicle.displayName} (${vehicle.manufacturer})`);
      console.log(`  ID: ${vehicle.id}`);
      console.log(`  Class: ${vehicle.vehicleClass}`);
      console.log(`  DLC: ${vehicle.dlcId}`);
      console.log(`  BFF: ${exists ? '✓' : '✗'} ${bffFile}`);
      console.log();
    }

    return database.vehicles;
  }

  async extractAll(options: ExtractOptions = {}): Promise<ExtractionReport> {
    const { parallel = 1, vehicleIds, skipExisting = true } = options;

    console.log('Starting extraction...');
    console.log(`Parallel: ${parallel}`);
    console.log(`Skip existing: ${skipExisting}\n`);

    // Verify PCarsTools installation
    this.pcarsTools.verifyInstallation();

    // Scan vehicles
    const { database } = await this.scanner.scan();
    let vehicles = database.vehicles;

    // Filter by vehicleIds if specified
    if (vehicleIds) {
      vehicles = vehicles.filter(v => vehicleIds.includes(v.id));
    }

    const report: ExtractionReport = {
      totalVehicles: vehicles.length,
      extracted: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      duration: 0
    };

    const startTime = Date.now();

    // Process in batches for parallel extraction
    for (let i = 0; i < vehicles.length; i += parallel) {
      const batch = vehicles.slice(i, i + parallel);

      const results = await Promise.allSettled(
        batch.map(v => this.extractVehicle(v, skipExisting))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            report.extracted++;
          } else if (result.value.skipped) {
            report.skipped++;
          } else {
            report.failed++;
            report.errors.push({
              vehicleId: result.value.vehicleId,
              error: result.value.error || 'Unknown error'
            });
          }
        } else {
          report.failed++;
          report.errors.push({
            vehicleId: 'unknown',
            error: result.reason
          });
        }
      }

      const progress = ((i + batch.length) / vehicles.length * 100).toFixed(1);
      console.log(`Progress: ${progress}% (${i + batch.length}/${vehicles.length})`);
    }

    report.duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('Extraction Complete!');
    console.log('='.repeat(60));
    console.log(`Total: ${report.totalVehicles}`);
    console.log(`Extracted: ${report.extracted}`);
    console.log(`Skipped: ${report.skipped}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Duration: ${(report.duration / 1000 / 60).toFixed(1)} minutes`);

    return report;
  }

  private async extractVehicle(vehicle: Vehicle, skipExisting: boolean): Promise<{
    success: boolean;
    skipped: boolean;
    vehicleId: string;
    error?: string;
  }> {
    const vehicleId = vehicle.id;
    const outputPath = join(this.outputDir, vehicleId);

    // Check if already extracted
    if (skipExisting && existsSync(outputPath)) {
      return { success: false, skipped: true, vehicleId };
    }

    // Create output directory
    await mkdir(outputPath, { recursive: true });

    // Get .bff file path
    const bffPath = this.getBFFPath(vehicle);

    if (!existsSync(bffPath)) {
      return {
        success: false,
        skipped: false,
        vehicleId,
        error: `BFF file not found: ${bffPath}`
      };
    }

    // Extract using PCarsTools
    try {
      const result = await this.pcarsTools.extractBFF(bffPath, outputPath);

      if (!result.success) {
        return {
          success: false,
          skipped: false,
          vehicleId,
          error: result.errors.join(', ')
        };
      }

      console.log(`✓ Extracted ${vehicleId} (${result.extractedFiles.length} files)`);
      return { success: true, skipped: false, vehicleId };

    } catch (error) {
      return {
        success: false,
        skipped: false,
        vehicleId,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private getBFFPath(vehicle: Vehicle): string {
    // Livery .bff file naming convention: {VehicleId}_Livery.bff
    const bffName = `${vehicle.id}_Livery.bff`;
    return join(this.installPath, 'Pakfiles', 'Vehicles', bffName);
  }
}
```

### 4. Image Processor (`image-processor.ts`)

**Purpose:** Convert DDS → PNG and create thumbnails

**Interface:**
```typescript
interface ImageProcessor {
  convertAll(): Promise<ConversionReport>;
  convertVehicle(vehicleId: string): Promise<ConversionResult>;
  cropToThumbnail(imagePath: string): Promise<Buffer>;
}

interface ConversionReport {
  totalFiles: number;
  converted: number;
  failed: number;
  duration: number;
}
```

**Implementation:**
```typescript
import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename } from 'path';
// @ts-ignore
import UTEX from '../../../ams2-content-listing/src/vendor/utex/UTEX.DDS.js';

export class ImageProcessor {
  private inputDir: string;
  private outputDir: string;

  constructor(inputDir: string, outputDir: string) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
  }

  async convertAll(): Promise<ConversionReport> {
    console.log('Starting image conversion...');
    console.log(`Input: ${this.inputDir}`);
    console.log(`Output: ${this.outputDir}\n`);

    const report: ConversionReport = {
      totalFiles: 0,
      converted: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Find all vehicle folders
    const vehicleIds = await readdir(this.inputDir);

    for (const vehicleId of vehicleIds) {
      const vehiclePath = join(this.inputDir, vehicleId);

      try {
        const result = await this.convertVehicle(vehicleId);
        if (result.success) {
          report.converted++;
        } else {
          report.failed++;
        }
        report.totalFiles++;
      } catch (error) {
        console.error(`Failed to convert ${vehicleId}:`, error);
        report.failed++;
        report.totalFiles++;
      }
    }

    report.duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('Conversion Complete!');
    console.log('='.repeat(60));
    console.log(`Total: ${report.totalFiles}`);
    console.log(`Converted: ${report.converted}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Duration: ${(report.duration / 1000).toFixed(1)}s`);

    return report;
  }

  private async convertVehicle(vehicleId: string): Promise<{ success: boolean }> {
    const vehicleInputPath = join(this.inputDir, vehicleId);
    const vehicleOutputPath = join(this.outputDir, vehicleId + '.png');

    // Find first livery DDS file
    const files = await readdir(vehicleInputPath);
    const ddsFile = files.find(f => f.toLowerCase().endsWith('.dds') && f.includes('livery'));

    if (!ddsFile) {
      console.warn(`No livery DDS found for ${vehicleId}`);
      return { success: false };
    }

    const ddsPath = join(vehicleInputPath, ddsFile);

    // Read DDS file
    const ddsBuffer = await readFile(ddsPath);
    const arrayBuffer = ddsBuffer.buffer.slice(
      ddsBuffer.byteOffset,
      ddsBuffer.byteOffset + ddsBuffer.byteLength
    );

    // Decode using UTEX
    const images = UTEX.DDS.decode(arrayBuffer);
    const mainImage = images[0];

    // Convert to PNG and crop to thumbnail size
    const rawBuffer = Buffer.from(mainImage.image);

    await sharp(rawBuffer, {
      raw: {
        width: mainImage.width,
        height: mainImage.height,
        channels: 4
      }
    })
    .resize(512, 128, { fit: 'cover', position: 'center' })
    .png()
    .toFile(vehicleOutputPath);

    console.log(`✓ Converted ${vehicleId}`);
    return { success: true };
  }
}
```

---

## Implementation Steps

### Phase 1: Project Setup (1-2 hours)

1. **Initialize project**
   ```bash
   cd ams2-car-image-extractor
   npm install
   ```

2. **Download PCarsTools**
   - Get from https://github.com/Nenkai/PCarsTools/releases
   - Extract to `tools/PCarsTools/`

3. **Get Oodle DLL**
   - Extract from AMS2 installation or PCarsTools dependencies
   - Place in `tools/PCarsTools/`

4. **Verify setup**
   ```bash
   npm run build
   # Should compile successfully
   ```

### Phase 2: PCarsTools Integration (2-3 hours)

1. Implement `pcars-tools-wrapper.ts`
2. Test with single .bff file
3. Verify extraction works
4. Handle errors gracefully

### Phase 3: Extraction Pipeline (3-4 hours)

1. Implement `extractor.ts`
2. Integrate with ams2-content-listing
3. Test with 5-10 vehicles
4. Add progress reporting

### Phase 4: Image Processing (2-3 hours)

1. Copy UTEX.js from ams2-content-listing
2. Implement `image-processor.ts`
3. Test DDS → PNG conversion
4. Implement cropping/resizing

### Phase 5: CLI & Organization (1-2 hours)

1. Implement `cli.ts`
2. Add command structure
3. Test all commands
4. Generate manifest

### Phase 6: Full Extraction (1-2 hours)

1. Run on full AMS2 installation
2. Monitor for errors
3. Review output quality
4. Generate final manifest

**Total Time Estimate: 10-16 hours**

---

## Testing Strategy

### Unit Tests

Test individual components:
- PCarsTools wrapper
- DDS decoding
- Image cropping
- Manifest generation

### Integration Tests

Test full pipeline:
1. Extract → Convert → Organize
2. Verify output structure
3. Check image quality
4. Validate manifest

### Test Vehicles

Start with subset:
- Porsche 963 (LMDh)
- Mercedes GT3 (GT3_Gen2)
- Formula Ultimate (F-Ultimate)
- Stock Car (StockCarV8)

Different classes to test variety.

---

## Distribution Strategy

### Option A: Bundle with SimVox.ai

**Pros:**
- Instant availability
- No download wait
- Works offline

**Cons:**
- Larger installer (~20MB)
- Needs updates for new DLC

**Implementation:**
1. Extract once during build
2. Include in `resources/` folder
3. Copy to app data on install

### Option B: CDN Hosting

**Pros:**
- Smaller installer
- Easy updates
- Incremental downloads

**Cons:**
- Requires internet
- CDN costs
- First-launch delay

**Implementation:**
1. Upload to SimVox.ai CDN
2. Download on first launch
3. Cache in AppData

### Option C: Hybrid (Recommended)

**Base game:** Bundle with installer
**DLC:** Download on-demand

**Best of both worlds.**

---

## Error Handling

### Extraction Errors

- **BFF not found:** Skip, use fallback
- **Extraction fails:** Log, continue
- **Corrupted file:** Skip, report

### Conversion Errors

- **Invalid DDS:** Use class badge fallback
- **Crop fails:** Use original size
- **Write fails:** Retry once

### Fallback Strategy

```typescript
function getVehicleThumbnail(vehicle: Vehicle): string {
  // Priority order:
  // 1. Extracted car image
  if (existsExtractedImage(vehicle.id)) {
    return getExtractedImagePath(vehicle.id);
  }

  // 2. Mod thumbnail
  if (vehicle.thumbnail) {
    return vehicle.thumbnail;
  }

  // 3. Manufacturer logo
  if (vehicle.manufacturerLogo) {
    return vehicle.manufacturerLogo;
  }

  // 4. Class badge
  return getClassBadge(vehicle.vehicleClass);

  // 5. Generic car icon
  // return 'assets/generic-car.png';
}
```

---

## Performance Optimization

### Parallel Extraction

```typescript
const parallel = 4; // Extract 4 vehicles at once
await extractor.extractAll({ parallel });
```

### Caching

Skip already extracted files:
```typescript
await extractor.extractAll({ skipExisting: true });
```

### Progress Reporting

Real-time progress updates:
```typescript
extractor.on('progress', (current, total) => {
  console.log(`${current}/${total} (${(current/total*100).toFixed(1)}%)`);
});
```

---

## Next Steps

When ready to implement:

1. ✅ Review this plan
2. ⬜ Set up development environment
3. ⬜ Download prerequisites
4. ⬜ Implement Phase 1
5. ⬜ Test with 5 vehicles
6. ⬜ Implement remaining phases
7. ⬜ Full extraction
8. ⬜ Decide distribution method
9. ⬜ Integrate with SimVox.ai

---

## Questions to Resolve

Before implementation:

1. **Legal:** Can we redistribute extracted images?
2. **Distribution:** Bundle or CDN or hybrid?
3. **Quality:** What thumbnail dimensions? (512x128 recommended)
4. **Format:** PNG or WebP? (PNG for compatibility)
5. **Fallbacks:** What to use when extraction fails?

---

## References

- PCarsTools: https://github.com/Nenkai/PCarsTools
- AMS2 Modding: https://mmodding3.net
- DDS Format: https://docs.microsoft.com/en-us/windows/win32/direct3ddds/
- Sharp Library: https://sharp.pixelplumbing.com/

---

**Document Version:** 1.0
**Last Updated:** 2025-11-05
**Status:** Planning Phase
