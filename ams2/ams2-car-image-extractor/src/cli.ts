#!/usr/bin/env node

/**
 * CLI for AMS2 Car Image Extractor
 */

import * as path from 'path';
import { verifyInstallation } from './pcars-tools-wrapper';
import { extractAllVehicles } from './extractor';
import { processAllImages, organizeThumbnails, generateManifest } from './image-processor';
import { ProcessOptions } from './types';

const DEFAULT_AMS2_PATH = 'C:\\GAMES\\Automobilista 2';

/**
 * Parse command line arguments
 */
function parseArgs(): ProcessOptions {
  const args = process.argv.slice(2);

  const options: ProcessOptions = {
    ams2Path: DEFAULT_AMS2_PATH,
    testMode: false,
    limit: undefined,
    skipExisting: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--test':
        options.testMode = true;
        break;

      case '--limit':
        const limitValue = parseInt(args[++i], 10);
        if (!isNaN(limitValue) && limitValue > 0) {
          options.limit = limitValue;
        }
        break;

      case '--path':
        options.ams2Path = args[++i];
        break;

      case '--skip-existing':
        options.skipExisting = true;
        break;

      case '--verbose':
      case '-v':
        options.verbose = true;
        break;

      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;

      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
AMS2 Car Image Extractor
========================

Usage: npm run process-all [options]

Options:
  --test              Run in test mode (process only 5 vehicles)
  --limit <N>         Process only N vehicles
  --path <PATH>       AMS2 installation path (default: ${DEFAULT_AMS2_PATH})
  --skip-existing     Skip vehicles that already have thumbnails
  --verbose, -v       Verbose output
  --help, -h          Show this help message

Examples:
  npm run process-all --test
  npm run process-all --limit 10
  npm run process-all --path "D:\\Games\\Automobilista 2"
  npm run process-all --verbose

Output:
  Thumbnails will be generated in the output/ directory:
    output/thumbnails/by-manufacturer/
    output/thumbnails/by-class/
    output/thumbnails/by-dlc/
    output/manifest.json
`);
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          AMS2 Car Image Extractor v1.0.0                   ║
║          GridVox Developer Tool                            ║
╚════════════════════════════════════════════════════════════╝
`);

  // Parse arguments
  const options = parseArgs();

  // Verify prerequisites
  console.log('Checking prerequisites...');
  const installation = verifyInstallation();

  if (!installation.valid) {
    console.error('\n❌ Missing required files:');
    installation.missing.forEach(file => {
      console.error(`  - ${file}`);
    });
    console.error('\nPlease see README.md for setup instructions.');
    process.exit(1);
  }

  console.log('✓ PCarsTools found');
  console.log('✓ Oodle DLL found');
  console.log();

  const startTime = Date.now();
  const outputDir = path.join(__dirname, '..', 'output');

  try {
    // Phase 1: Extract BFF files
    const extractions = await extractAllVehicles(options);

    // Phase 2: Process images (DDS→PNG)
    const conversions = await processAllImages(extractions, outputDir, options.verbose);

    // Phase 3: Organize thumbnails
    await organizeThumbnails(conversions, outputDir);

    // Phase 4: Generate manifest
    await generateManifest(conversions, options.ams2Path, outputDir);

    // Final summary
    const totalTime = (Date.now() - startTime) / 1000;

    console.log();
    console.log('='.repeat(60));
    console.log('✅ ALL PHASES COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total time: ${totalTime.toFixed(2)}s`);
    console.log(`Output directory: ${outputDir}`);
    console.log();
    console.log('Next steps:');
    console.log('  1. Review thumbnails in output/thumbnails/');
    console.log('  2. Check manifest.json for metadata');
    console.log('  3. Integrate with GridVox application');
    console.log();

  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ PROCESS FAILED');
    console.error('='.repeat(60));
    console.error(error instanceof Error ? error.message : String(error));
    console.error();

    const totalTime = (Date.now() - startTime) / 1000;
    console.error(`Failed after ${totalTime.toFixed(2)}s`);

    process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
