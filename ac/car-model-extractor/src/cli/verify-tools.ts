#!/usr/bin/env node

/**
 * Verify tool prerequisites for AC car model extraction
 *
 * Usage: npm run verify
 */

import { existsSync } from 'fs';
import chalk from 'chalk';
import { resolve } from 'path';
import { scanACInstallation } from '../lib/car-scanner.js';
import { KN5Converter } from '../lib/kn5-converter.js';
import { FBX2GLTFConverter } from '../lib/fbx2gltf.js';
import { getDefaultConfig, getToolPaths } from '../utils/config.js';

async function verify() {
  console.log();
  console.log(chalk.cyan('═══════════════════════════════════════════'));
  console.log(chalk.cyan(' AC Car Model Extractor - Setup Verification'));
  console.log(chalk.cyan('═══════════════════════════════════════════'));
  console.log();

  const config = getDefaultConfig();
  const toolPaths = getToolPaths(config);

  let allValid = true;

  // 1. Check kn5-converter
  console.log(chalk.blue('Checking kn5-converter...'));

  const kn5ConverterPath = resolve(toolPaths.kn5Converter);
  if (existsSync(kn5ConverterPath)) {
    console.log(chalk.green(`✓ kn5-converter found: ${kn5ConverterPath}`));

    // Try to get version
    const kn5Converter = new KN5Converter({
      toolPath: kn5ConverterPath,
      outputDir: './output/fbx'
    });

    const version = await kn5Converter.getVersion();
    if (version) {
      console.log(chalk.gray(`  Version: ${version}`));
    }
  } else {
    console.log(chalk.red(`✖ kn5-converter not found: ${kn5ConverterPath}`));
    console.log(chalk.yellow('  Download from: https://github.com/RaduMC/kn5-converter'));
    console.log(chalk.yellow('  Place in: tools/kn5-converter/kn5conv.exe'));
    allValid = false;
  }

  console.log();

  // 2. Check FBX2glTF
  console.log(chalk.blue('Checking FBX2glTF...'));

  const fbx2gltfPath = resolve(toolPaths.fbx2gltf);
  if (existsSync(fbx2gltfPath)) {
    console.log(chalk.green(`✓ FBX2glTF found: ${fbx2gltfPath}`));

    // Try to get version
    const fbx2gltfConverter = new FBX2GLTFConverter({
      toolPath: fbx2gltfPath
    });

    const version = await fbx2gltfConverter.getVersion();
    if (version) {
      console.log(chalk.gray(`  Version: ${version}`));
    }
  } else {
    console.log(chalk.red(`✖ FBX2glTF not found: ${fbx2gltfPath}`));
    console.log(chalk.yellow('  Download from: https://github.com/facebookincubator/FBX2glTF/releases'));
    console.log(chalk.yellow('  Place in: tools/FBX2glTF/FBX2glTF.exe'));
    allValid = false;
  }

  console.log();

  // 3. Check AC installation
  console.log(chalk.blue('Checking Assetto Corsa installation...'));

  const acPath = resolve(config.acInstallPath);

  if (existsSync(acPath)) {
    console.log(chalk.green(`✓ AC installation found: ${acPath}`));

    try {
      const scanner = scanACInstallation(acPath);
      const cars = scanner.listAvailableCars();

      console.log(chalk.green(`✓ Found ${cars.length} cars in content/cars/`));

      // Show some example cars
      if (cars.length > 0) {
        const examples = cars.slice(0, 5);
        console.log(chalk.gray(`  Examples: ${examples.join(', ')}...`));
      }

      // Check for popular GT3 cars
      const gt3Cars = scanner.getPopularGT3Cars();
      if (gt3Cars.length > 0) {
        console.log(chalk.gray(`  Popular GT3 cars available: ${gt3Cars.length}`));
      }
    } catch (error: any) {
      console.log(chalk.red(`✖ Failed to scan AC installation: ${error.message}`));
      allValid = false;
    }
  } else {
    console.log(chalk.red(`✖ AC installation not found: ${acPath}`));
    console.log(chalk.yellow('  Update AC_INSTALL_PATH in .env file'));
    console.log(chalk.yellow('  Common paths:'));
    console.log(chalk.yellow('    - C:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa'));
    console.log(chalk.yellow('    - C:\\Games\\assettocorsa'));
    allValid = false;
  }

  console.log();

  // 4. Check output directories
  console.log(chalk.blue('Checking output directories...'));

  const outputDir = resolve(config.outputDir);
  if (existsSync(outputDir)) {
    console.log(chalk.green(`✓ Output directory exists: ${outputDir}`));
  } else {
    console.log(chalk.yellow(`⚠ Output directory will be created: ${outputDir}`));
  }

  console.log();

  // 5. Summary
  console.log(chalk.cyan('═══════════════════════════════════════════'));

  if (allValid) {
    console.log(chalk.green('✓ All prerequisites met!'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.white('  1. Test with single car:'));
    console.log(chalk.gray('     npm run extract:single -- --car ks_ferrari_488_gt3'));
    console.log();
    console.log(chalk.white('  2. Test with 5 sample cars:'));
    console.log(chalk.gray('     npm run test'));
    console.log();
    console.log(chalk.white('  3. Extract all cars:'));
    console.log(chalk.gray('     npm run extract:batch -- --all'));
  } else {
    console.log(chalk.red('✖ Some prerequisites are missing'));
    console.log();
    console.log(chalk.yellow('Please install missing tools and update .env configuration.'));
    console.log(chalk.yellow('See tools/README.md for download instructions.'));
  }

  console.log(chalk.cyan('═══════════════════════════════════════════'));
  console.log();

  // Exit with error code if verification failed
  if (!allValid) {
    process.exit(1);
  }
}

// Run verification
verify().catch((error) => {
  console.error(chalk.red('Verification failed:'), error);
  process.exit(1);
});
