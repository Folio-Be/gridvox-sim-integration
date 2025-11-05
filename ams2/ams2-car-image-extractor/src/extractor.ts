/**
 * Main extraction orchestration
 */

import * as path from 'path';
import * as fs from 'fs';
import { AMS2ContentScanner } from '../../ams2-content-listing/src/scanner';
import { Vehicle } from '../../ams2-content-listing/src/types';
import { extractBFF } from './pcars-tools-wrapper';
import { ExtractionResult, ProcessOptions } from './types';

/**
 * Extract GUI vehicle images from GUIVEHICLEIMAGES.bff
 * This contains all the 3D-rendered car preview images
 */
export async function extractGUIVehicleImages(
  ams2Path: string,
  outputBaseDir: string,
  verbose: boolean = false
): Promise<{ success: boolean; outputPath: string; error?: string }> {
  const startTime = Date.now();
  const bffPath = path.join(ams2Path, 'Pakfiles', 'GUIVEHICLEIMAGES.bff');
  const outputPath = path.join(outputBaseDir, 'extracted', 'gui');

  if (!fs.existsSync(bffPath)) {
    return {
      success: false,
      outputPath: '',
      error: `GUIVEHICLEIMAGES.bff not found at ${bffPath}`,
    };
  }

  console.log('Extracting GUIVEHICLEIMAGES.bff...');
  console.log(`  Source: ${bffPath}`);
  console.log(`  Target: ${outputPath}`);
  console.log('  (This is a 1.1GB file, will take 5-10 minutes)');
  console.log();

  // Extract using PCarsTools
  const result = await extractBFF(bffPath, outputPath, ams2Path);

  const duration = Date.now() - startTime;

  if (!result.success) {
    return {
      success: false,
      outputPath: '',
      error: result.error || 'Unknown extraction error',
    };
  }

  console.log(`✓ Extraction complete (${(duration / 1000).toFixed(1)}s)`);
  console.log();

  return {
    success: true,
    outputPath,
  };
}

/**
 * Verify extracted GUI images exist for vehicles
 */
export async function extractAllVehicles(
  options: ProcessOptions
): Promise<ExtractionResult[]> {
  const { ams2Path, testMode, limit, skipExisting, verbose } = options;

  console.log('='.repeat(60));
  console.log('AMS2 Car Image Extractor - Extraction Phase');
  console.log('='.repeat(60));
  console.log(`AMS2 Path: ${ams2Path}`);
  console.log(`Mode: ${testMode ? 'TEST' : 'FULL'}`);
  if (limit) {
    console.log(`Limit: ${limit} vehicles`);
  }
  console.log();

  // Scan for vehicles
  console.log('Scanning AMS2 installation...');
  const scanner = new AMS2ContentScanner(ams2Path);
  const scanResult = await scanner.scan();

  const allVehicles = scanResult.database.vehicles;
  console.log(`Found ${allVehicles.length} vehicles total`);
  console.log();

  // Apply limits
  let vehiclesToProcess = allVehicles;

  if (testMode) {
    vehiclesToProcess = allVehicles.slice(0, 5);
    console.log(`TEST MODE: Processing only ${vehiclesToProcess.length} vehicles`);
  } else if (limit) {
    vehiclesToProcess = allVehicles.slice(0, limit);
    console.log(`Processing ${vehiclesToProcess.length} vehicles (limited)`);
  } else {
    console.log(`Processing all ${vehiclesToProcess.length} vehicles`);
  }
  console.log();

  // Extract GUIVEHICLEIMAGES.bff (once for all vehicles)
  const outputBaseDir = path.join(__dirname, '..', 'output');
  const guiExtractPath = path.join(outputBaseDir, 'extracted', 'gui');

  // Check if already extracted
  if (fs.existsSync(guiExtractPath) && fs.readdirSync(guiExtractPath).length > 0) {
    console.log('✓ GUIVEHICLEIMAGES.bff already extracted, skipping...');
    console.log();
  } else {
    const extractResult = await extractGUIVehicleImages(ams2Path, outputBaseDir, verbose);

    if (!extractResult.success) {
      console.error(`✗ Failed to extract GUIVEHICLEIMAGES.bff: ${extractResult.error}`);
      throw new Error(extractResult.error);
    }
  }

  // Create extraction results for each vehicle
  const results: ExtractionResult[] = [];
  const guiVehicleImagesPath = path.join(guiExtractPath, 'vehicleimages');

  for (let i = 0; i < vehiclesToProcess.length; i++) {
    const vehicle = vehiclesToProcess[i];
    const progress = `[${i + 1}/${vehiclesToProcess.length}]`;

    // Look for vehicle's GUI images directory
    // Try exact match first, then fuzzy match
    const vehicleIdNormalized = vehicle.id.toLowerCase().replace(/\s+/g, '_');
    const expectedDirName = `vehicleimages_${vehicleIdNormalized}`;
    let vehicleImagesPath = path.join(guiVehicleImagesPath, expectedDirName);

    console.log(`${progress} ${vehicle.displayName} (${vehicle.manufacturer})`);

    // If exact match doesn't exist, try fuzzy matching
    if (!fs.existsSync(vehicleImagesPath)) {
      // List all directories and find closest match
      const allDirs = fs.readdirSync(guiVehicleImagesPath);
      const vehicleIdForMatch = vehicle.id.toLowerCase().replace(/[\s_-]+/g, '');

      const match = allDirs.find(dir => {
        const dirNormalized = dir.toLowerCase().replace(/^vehicleimages_/, '').replace(/[\s_-]+/g, '');
        return dirNormalized === vehicleIdForMatch;
      });

      if (match) {
        vehicleImagesPath = path.join(guiVehicleImagesPath, match);
      }
    }

    if (fs.existsSync(vehicleImagesPath)) {
      const files = fs.readdirSync(vehicleImagesPath);
      const ddsFiles = files.filter(f => f.toLowerCase().endsWith('.dds'));

      console.log(`  ✓ Found ${ddsFiles.length} preview images`);

      results.push({
        vehicle,
        success: true,
        extractedFiles: ddsFiles.map(f => path.join(vehicleImagesPath, f)),
        outputPath: vehicleImagesPath,
        durationMs: 0,
      });
    } else {
      console.log(`  ✗ No GUI images found (expected: ${expectedDirName})`);

      results.push({
        vehicle,
        success: false,
        extractedFiles: [],
        outputPath: '',
        error: `GUI images directory not found: ${expectedDirName}`,
        durationMs: 0,
      });
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log();
  console.log('='.repeat(60));
  console.log('Extraction Summary');
  console.log('='.repeat(60));
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log();
    console.log('Failed vehicles:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.vehicle.displayName}: ${r.error}`);
    });
  }

  return results;
}
