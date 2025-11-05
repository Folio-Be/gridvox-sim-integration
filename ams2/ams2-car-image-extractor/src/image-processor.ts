/**
 * Image processing: DDS→PNG conversion and thumbnail generation
 */

import * as path from 'path';
import * as fs from 'fs';
import { readFile, mkdir, stat } from 'fs/promises';
import sharp from 'sharp';
import { DDSToPNGConverter } from '../../ams2-content-listing/src/dds-to-png-converter';
import { Vehicle } from '../../ams2-content-listing/src/types';
import { ConversionResult, ExtractionResult, ManifestEntry, Manifest } from './types';

// Load UTEX.js for DDS decoding (same as ams2-content-listing)
// @ts-ignore
import '../../ams2-content-listing/src/vendor/utex/UTEX.js';
// @ts-ignore
import '../../ams2-content-listing/src/vendor/utex/UTEX.DDS.js';

// Access UTEX from global scope
declare const UTEX: any;

const TARGET_WIDTH = 512;
const TARGET_HEIGHT = 128;

/**
 * Find the main GUI preview DDS file for a vehicle
 * GUI images are in: gui/vehicleimages/vehicleimages_{vehicle_id}/{vehicle_id}_livery_{number}.dds
 */
function findGUIPreviewDDS(extractedDir: string, vehicleId: string): string | null {
  if (!fs.existsSync(extractedDir)) {
    return null;
  }

  // List all DDS files in the directory
  const files = fs.readdirSync(extractedDir);
  const ddsFiles = files.filter(f => f.toLowerCase().endsWith('.dds'));

  if (ddsFiles.length === 0) {
    return null;
  }

  // Prefer livery_51.dds (first/default livery)
  const vehicleIdLower = vehicleId.toLowerCase();
  const preferredName = `${vehicleIdLower}_livery_51.dds`;

  const preferred = ddsFiles.find(f => f.toLowerCase() === preferredName);
  if (preferred) {
    return path.join(extractedDir, preferred);
  }

  // Fallback: Use first available DDS file
  return path.join(extractedDir, ddsFiles[0]);
}

/**
 * Convert DDS to PNG and crop to thumbnail size
 */
async function convertAndCropDDS(
  ddsPath: string,
  outputPath: string
): Promise<{ width: number; height: number; fileSize: number }> {
  // Read DDS file
  const ddsBuffer = await readFile(ddsPath);
  const arrayBuffer = ddsBuffer.buffer.slice(
    ddsBuffer.byteOffset,
    ddsBuffer.byteOffset + ddsBuffer.byteLength
  );

  // Decode using UTEX.DDS
  const images = UTEX.DDS.decode(arrayBuffer);

  if (!images || images.length === 0) {
    throw new Error(`No images found in DDS file: ${ddsPath}`);
  }

  // Get the first mipmap level (main image)
  const mainImage = images[0];
  const { width, height, image } = mainImage;

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    await mkdir(outDir, { recursive: true });
  }

  // Convert RGBA buffer to PNG using sharp, resize to target dimensions
  await sharp(Buffer.from(image), {
    raw: {
      width,
      height,
      channels: 4, // RGBA
    },
  })
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'cover', // Crop to fill the dimensions
      position: 'center',
    })
    .png()
    .toFile(outputPath);

  // Get file size
  const stats = await stat(outputPath);

  return {
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT,
    fileSize: stats.size,
  };
}

/**
 * Process a single vehicle's extracted files
 */
export async function processVehicleImages(
  extractionResult: ExtractionResult,
  outputBaseDir: string,
  verbose: boolean = false
): Promise<ConversionResult> {
  const startTime = Date.now();
  const { vehicle, extractedFiles, outputPath } = extractionResult;

  if (!extractionResult.success) {
    return {
      vehicle,
      success: false,
      sourceDdsPath: '',
      outputPngPath: '',
      dimensions: { width: 0, height: 0 },
      fileSizeBytes: 0,
      error: 'Extraction failed, cannot process images',
      durationMs: 0,
    };
  }

  // Find the GUI preview DDS
  const ddsPath = findGUIPreviewDDS(outputPath, vehicle.id);

  // Determine output path
  const outputPngPath = path.join(
    outputBaseDir,
    'thumbnails',
    'by-manufacturer',
    vehicle.manufacturer,
    `${vehicle.id}.png`
  );

  // If no GUI preview found, fail
  if (!ddsPath) {
    return {
      vehicle,
      success: false,
      sourceDdsPath: '',
      outputPngPath: '',
      dimensions: { width: 0, height: 0 },
      fileSizeBytes: 0,
      error: `Could not find GUI preview DDS in ${outputPath}`,
      durationMs: Date.now() - startTime,
    };
  }

  if (verbose) {
    console.log(`Processing ${vehicle.displayName}...`);
    console.log(`  DDS: ${path.basename(ddsPath)}`);
  }

  try {
    const { width, height, fileSize } = await convertAndCropDDS(ddsPath, outputPngPath);

    if (verbose) {
      console.log(`  ✓ ${width}×${height} PNG (${(fileSize / 1024).toFixed(1)}KB)`);
    }

    return {
      vehicle,
      success: true,
      sourceDdsPath: ddsPath,
      outputPngPath,
      dimensions: { width, height },
      fileSizeBytes: fileSize,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      vehicle,
      success: false,
      sourceDdsPath: ddsPath,
      outputPngPath,
      dimensions: { width: 0, height: 0 },
      fileSizeBytes: 0,
      error: errorMsg,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Process all extracted vehicles
 */
export async function processAllImages(
  extractions: ExtractionResult[],
  outputBaseDir: string,
  verbose: boolean = false
): Promise<ConversionResult[]> {
  console.log();
  console.log('='.repeat(60));
  console.log('Image Processing Phase');
  console.log('='.repeat(60));
  console.log(`Processing ${extractions.length} vehicles`);
  console.log();

  const results: ConversionResult[] = [];

  for (let i = 0; i < extractions.length; i++) {
    const extraction = extractions[i];
    const progress = `[${i + 1}/${extractions.length}]`;

    console.log(`${progress} ${extraction.vehicle.displayName}`);

    try {
      const result = await processVehicleImages(extraction, outputBaseDir, verbose);
      results.push(result);

      if (!result.success) {
        console.log(`  ✗ SKIPPED: ${result.error}`);
      } else {
        console.log(
          `  ✓ ${result.dimensions.width}×${result.dimensions.height} ` +
          `(${(result.fileSizeBytes / 1024).toFixed(1)}KB)`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ EXCEPTION: ${errorMsg}`);

      results.push({
        vehicle: extraction.vehicle,
        success: false,
        sourceDdsPath: '',
        outputPngPath: '',
        dimensions: { width: 0, height: 0 },
        fileSizeBytes: 0,
        error: errorMsg,
        durationMs: 0,
      });

      // Halt on error
      throw error;
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalSizeKB = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.fileSizeBytes, 0) / 1024;

  console.log();
  console.log('='.repeat(60));
  console.log('Processing Summary');
  console.log('='.repeat(60));
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total size: ${(totalSizeKB / 1024).toFixed(2)}MB`);

  return results;
}

/**
 * Organize thumbnails into multiple directory structures
 */
export async function organizeThumbnails(
  conversions: ConversionResult[],
  outputBaseDir: string
): Promise<void> {
  console.log();
  console.log('Organizing thumbnails...');

  const thumbnailsDir = path.join(outputBaseDir, 'thumbnails');

  // Create directory structure
  const byClassDir = path.join(thumbnailsDir, 'by-class');
  const byDlcDir = path.join(thumbnailsDir, 'by-dlc');

  await mkdir(byClassDir, { recursive: true });
  await mkdir(byDlcDir, { recursive: true });

  for (const conversion of conversions) {
    if (!conversion.success) continue;

    const { vehicle, outputPngPath } = conversion;

    // Copy to by-class
    const classDestination = path.join(byClassDir, vehicle.vehicleClass, `${vehicle.id}.png`);
    const classDir = path.dirname(classDestination);
    if (!fs.existsSync(classDir)) {
      await mkdir(classDir, { recursive: true });
    }
    fs.copyFileSync(outputPngPath, classDestination);

    // Copy to by-dlc
    const dlcDestination = path.join(byDlcDir, vehicle.dlcId, `${vehicle.id}.png`);
    const dlcDir = path.dirname(dlcDestination);
    if (!fs.existsSync(dlcDir)) {
      await mkdir(dlcDir, { recursive: true });
    }
    fs.copyFileSync(outputPngPath, dlcDestination);
  }

  console.log('  ✓ Organized by class');
  console.log('  ✓ Organized by DLC');
}

/**
 * Generate manifest JSON
 */
export async function generateManifest(
  conversions: ConversionResult[],
  ams2Path: string,
  outputBaseDir: string
): Promise<void> {
  console.log();
  console.log('Generating manifest...');

  const successful = conversions.filter(c => c.success);

  const manifestEntries: ManifestEntry[] = successful.map(conversion => {
    const { vehicle, outputPngPath, sourceDdsPath } = conversion;

    return {
      id: vehicle.id,
      displayName: vehicle.displayName,
      manufacturer: vehicle.manufacturer,
      class: vehicle.vehicleClass,
      dlc: vehicle.dlcId,
      bffFile: '', // We'll fill this later if needed
      thumbnailPath: path.relative(outputBaseDir, outputPngPath),
      sourceTexture: path.basename(sourceDdsPath),
      extractedAt: new Date().toISOString(),
      isBasGame: vehicle.dlcId === 'base',
    };
  });

  const manifest: Manifest = {
    version: '1.0.0',
    extractedAt: new Date().toISOString(),
    ams2InstallPath: ams2Path,
    totalVehicles: conversions.length,
    processed: successful.length,
    failed: conversions.length - successful.length,
    vehicles: manifestEntries,
  };

  const manifestPath = path.join(outputBaseDir, 'manifest.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`  ✓ Manifest saved: ${manifestPath}`);
  console.log(`  ✓ ${manifest.processed} vehicles included`);
}
