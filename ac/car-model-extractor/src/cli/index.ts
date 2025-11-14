#!/usr/bin/env node

/**
 * CLI for Assetto Corsa car model extraction
 *
 * Usage:
 *   ac-extract --car ks_ferrari_488_gt3
 *   ac-extract --cars ks_ferrari_488_gt3,ks_porsche_911_gt3_r_2016
 *   ac-extract --all
 *   ac-extract --test
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ACCarExtractor } from '../lib/extractor.js';
import { getDefaultConfig } from '../utils/config.js';
import type { ExtractionProgress } from '../lib/types.js';

const program = new Command();

program
  .name('ac-extract')
  .description('Extract and convert Assetto Corsa car models to GLTF')
  .version('0.1.0');

// Extract single car
program
  .command('car <carId>')
  .description('Extract a single car model')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('--no-draco', 'Disable Draco compression')
  .option('--draco-level <level>', 'Draco compression level (0-10)', '7')
  .option('-v, --verbose', 'Verbose logging')
  .action(async (carId: string, options) => {
    const spinner = ora(`Extracting ${carId}`).start();

    try {
      const extractor = new ACCarExtractor({
        outputDir: options.output,
        dracoCompression: options.draco,
        dracoLevel: parseInt(options.dracoLevel, 10),
        verbose: options.verbose
      });

      const result = await extractor.extractCar(carId);

      if (result.success) {
        spinner.succeed(chalk.green(`Extracted ${carId}`));
        console.log(chalk.gray(`  GLTF: ${result.gltfPath}`));
        console.log(chalk.gray(`  Duration: ${Math.round(result.duration! / 1000)}s`));
      } else {
        spinner.fail(chalk.red(`Failed to extract ${carId}`));
        console.log(chalk.red(`  Error: ${result.error?.message}`));
        process.exit(1);
      }
    } catch (error: any) {
      spinner.fail(chalk.red('Extraction failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Extract multiple cars
program
  .command('batch')
  .description('Extract multiple car models')
  .option('--cars <carIds>', 'Comma-separated car IDs')
  .option('--all', 'Extract all available cars')
  .option('--test', 'Extract 5 test cars')
  .option('--gt3', 'Extract popular GT3 cars')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('--no-draco', 'Disable Draco compression')
  .option('--draco-level <level>', 'Draco compression level (0-10)', '7')
  .option('--skip-existing', 'Skip already converted cars')
  .option('-v, --verbose', 'Verbose logging')
  .action(async (options) => {
    try {
      const extractor = new ACCarExtractor({
        outputDir: options.output,
        dracoCompression: options.draco,
        dracoLevel: parseInt(options.dracoLevel, 10),
        skipExisting: options.skipExisting,
        verbose: options.verbose
      });

      // Determine which cars to extract
      let carIds: string[] = [];

      if (options.cars) {
        carIds = options.cars.split(',').map((id: string) => id.trim());
      } else if (options.all) {
        carIds = extractor.listAvailableCars();
      } else if (options.test) {
        carIds = extractor.getTestCars();
      } else if (options.gt3) {
        carIds = extractor.getPopularGT3Cars();
      } else {
        console.error(chalk.red('Error: Specify --cars, --all, --test, or --gt3'));
        program.help();
        process.exit(1);
      }

      if (carIds.length === 0) {
        console.error(chalk.red('No cars to extract'));
        process.exit(1);
      }

      console.log();
      console.log(chalk.cyan('═══════════════════════════════════════════'));
      console.log(chalk.cyan(' AC Car Model Batch Extraction'));
      console.log(chalk.cyan('═══════════════════════════════════════════'));
      console.log();
      console.log(chalk.blue(`Total cars: ${carIds.length}`));
      console.log(chalk.gray(`Output: ${options.output}`));
      console.log();

      const spinner = ora('Starting extraction...').start();
      let currentCar = '';

      // Progress handler
      extractor.on('progress', (progress: ExtractionProgress) => {
        currentCar = progress.carId;
        const percent = Math.round(progress.percentage);
        spinner.text = `[${progress.current}/${progress.total}] ${progress.carId} (${percent}%)`;
      });

      // Extract batch
      const batchResult = await extractor.extractBatch(carIds);

      spinner.stop();

      console.log();
      console.log(chalk.cyan('═══════════════════════════════════════════'));
      console.log(chalk.cyan(' Extraction Complete'));
      console.log(chalk.cyan('═══════════════════════════════════════════'));
      console.log();
      console.log(chalk.blue(`Total:      ${batchResult.total}`));
      console.log(chalk.green(`Successful: ${batchResult.successful}`));
      console.log(chalk.red(`Failed:     ${batchResult.failed}`));
      console.log(chalk.gray(`Duration:   ${Math.round(batchResult.duration / 1000)}s`));
      console.log();
      console.log(chalk.gray(`Output: ${options.output}/gltf/`));
      console.log();

      // Show failures if any
      if (batchResult.failed > 0) {
        console.log(chalk.yellow('Failed cars:'));
        batchResult.results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(chalk.red(`  ✖ ${r.carId}: ${r.error?.message}`));
          });
        console.log();
      }

      // Exit with error if any failed
      if (batchResult.failed > 0) {
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red('Batch extraction failed:'), error.message);
      process.exit(1);
    }
  });

// List available cars
program
  .command('list')
  .description('List available cars from AC installation')
  .option('--gt3', 'Only show GT3 cars')
  .option('--brand <brand>', 'Filter by brand')
  .option('--class <class>', 'Filter by class')
  .action(async (options) => {
    try {
      const extractor = new ACCarExtractor();

      let cars: string[];

      if (options.gt3) {
        cars = extractor.getPopularGT3Cars();
      } else {
        cars = extractor.listAvailableCars();

        // Apply filters
        if (options.brand || options.class) {
          const metadata = cars.map(id => extractor.getCarMetadata(id)).filter(Boolean);
          const filtered = metadata.filter(car => {
            if (options.brand && car!.brand !== options.brand) return false;
            if (options.class && car!.class !== options.class) return false;
            return true;
          });

          cars = filtered.map(car => car!.id);
        }
      }

      console.log();
      console.log(chalk.cyan(`Found ${cars.length} cars:`));
      console.log();

      // Group by first few characters (kunos_, ks_, etc.)
      const groups: Record<string, string[]> = {};

      for (const carId of cars) {
        const prefix = carId.match(/^[a-z]+_/)?.[0] || 'other_';
        if (!groups[prefix]) {
          groups[prefix] = [];
        }
        groups[prefix].push(carId);
      }

      // Display grouped
      for (const [prefix, groupCars] of Object.entries(groups)) {
        console.log(chalk.blue(`${prefix} (${groupCars.length})`));
        groupCars.slice(0, 10).forEach(id => {
          const meta = extractor.getCarMetadata(id);
          console.log(chalk.gray(`  - ${id}${meta?.name && meta.name !== id ? ` (${meta.name})` : ''}`));
        });

        if (groupCars.length > 10) {
          console.log(chalk.gray(`  ... and ${groupCars.length - 10} more`));
        }

        console.log();
      }
    } catch (error: any) {
      console.error(chalk.red('Failed to list cars:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
