/**
 * Example: Using AC Car Extractor as a library
 *
 * Run with: tsx examples/library-usage.ts
 */

import { ACCarExtractor } from '../src/lib/index.js';

async function main() {
  console.log('AC Car Model Extractor - Library Usage Example\n');

  // Initialize extractor
  const extractor = new ACCarExtractor({
    acInstallPath: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa',
    outputDir: './output',
    dracoCompression: true,
    dracoLevel: 7,
    skipExisting: true,
    verbose: false
  });

  // Example 1: List available cars
  console.log('Example 1: List available cars');
  const allCars = extractor.listAvailableCars();
  console.log(`Found ${allCars.length} cars in AC installation\n`);

  // Example 2: Get car metadata
  console.log('Example 2: Get car metadata');
  const ferrari = extractor.getCarMetadata('ks_ferrari_488_gt3');
  if (ferrari) {
    console.log(`Car: ${ferrari.name}`);
    console.log(`Brand: ${ferrari.brand}`);
    console.log(`Class: ${ferrari.class}`);
    console.log(`KN5 Path: ${ferrari.kn5Path}\n`);
  }

  // Example 3: Extract single car
  console.log('Example 3: Extract single car');
  console.log('Extracting ks_ferrari_488_gt3...');

  const singleResult = await extractor.extractCar('ks_ferrari_488_gt3');

  if (singleResult.success) {
    console.log(`✓ Extracted successfully`);
    console.log(`  GLTF: ${singleResult.gltfPath}`);
    console.log(`  Duration: ${Math.round(singleResult.duration! / 1000)}s\n`);
  } else {
    console.log(`✖ Extraction failed: ${singleResult.error?.message}\n`);
  }

  // Example 4: Extract batch with progress events
  console.log('Example 4: Extract batch with progress events');

  const testCars = extractor.getTestCars();
  console.log(`Extracting ${testCars.length} test cars...\n`);

  // Listen to progress events
  extractor.on('progress', (progress) => {
    console.log(
      `[${progress.current}/${progress.total}] ${progress.carId} - ${progress.stage} (${Math.round(progress.percentage)}%)`
    );
  });

  extractor.on('complete', (result) => {
    console.log(`  ✓ Completed: ${result.carId}`);
  });

  extractor.on('error', (error) => {
    console.log(`  ✖ Error: ${error.carId} - ${error.message}`);
  });

  const batchResult = await extractor.extractBatch(testCars);

  console.log('\nBatch extraction complete:');
  console.log(`  Total: ${batchResult.total}`);
  console.log(`  Successful: ${batchResult.successful}`);
  console.log(`  Failed: ${batchResult.failed}`);
  console.log(`  Duration: ${Math.round(batchResult.duration / 1000)}s\n`);

  // Example 5: Extract popular GT3 cars for SimVox MVP
  console.log('Example 5: Extract popular GT3 cars for SimVox MVP');

  const gt3Cars = extractor.getPopularGT3Cars();
  console.log(`Found ${gt3Cars.length} popular GT3 cars:`);
  console.log(gt3Cars.join(', '));
  console.log('\nExtraction would take approximately 2-3 minutes\n');

  // Uncomment to actually extract:
  // const gt3Result = await extractor.extractBatch(gt3Cars);

  console.log('Examples complete!');
}

main().catch(console.error);
