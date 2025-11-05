#!/usr/bin/env node

import { DDSToPNGConverter } from './dds-to-png-converter';

/**
 * CLI tool for DDS to PNG conversion
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const command = args[0] || 'all';
  const installPath = args[1] || 'C:\\GAMES\\Automobilista 2';
  const outputDir = args[2]; // Optional

  console.log('='.repeat(80));
  console.log('AMS2 DDS to PNG Converter');
  console.log('='.repeat(80));
  console.log();

  const converter = new DDSToPNGConverter(installPath, outputDir);

  try {
    if (command === 'all' || command === 'full') {
      // Convert everything
      await converter.convertEverything();
    } else if (command === 'delta' || command === 'update') {
      // Convert only new/changed files
      await converter.convertDelta();
    } else if (command === 'help' || command === '--help' || command === '-h') {
      printHelp();
    } else {
      console.error(`Unknown command: ${command}`);
      console.log();
      printHelp();
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during conversion:', error);
    process.exit(1);
  }
}

function printHelp() {
  console.log('Usage:');
  console.log('  npm run convert [command] [installPath] [outputDir]');
  console.log();
  console.log('Commands:');
  console.log('  all, full   - Convert all DDS files to PNG (default)');
  console.log('  delta       - Convert only new/changed DDS files');
  console.log('  help        - Show this help message');
  console.log();
  console.log('Arguments:');
  console.log('  installPath - Path to AMS2 installation (default: C:\\GAMES\\Automobilista 2)');
  console.log('  outputDir   - Output directory for PNG files (default: ../ams2-thumbnails-png)');
  console.log();
  console.log('Examples:');
  console.log('  npm run convert');
  console.log('  npm run convert delta');
  console.log('  npm run convert all "D:\\Steam\\Automobilista 2"');
  console.log('  npm run convert delta "C:\\Games\\AMS2" "C:\\Output\\PNG"');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
