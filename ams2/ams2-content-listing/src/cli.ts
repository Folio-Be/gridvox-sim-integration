#!/usr/bin/env node

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { AMS2ContentScanner } from './scanner';
import { ThumbnailConverter } from './thumbnail-converter';

/**
 * CLI tool to scan AMS2 content
 */
async function main() {
  const args = process.argv.slice(2);
  const installPath = args[0] || 'C:\\GAMES\\Automobilista 2';

  console.log('='.repeat(60));
  console.log('AMS2 Content Scanner');
  console.log('='.repeat(60));
  console.log();

  // Create scanner
  const scanner = new AMS2ContentScanner(installPath);

  // Run scan
  const result = await scanner.scan();

  // Display summary
  console.log();
  console.log(scanner.getSummary(result.database));

  // Display statistics
  console.log();
  console.log('Scan Statistics:');
  console.log('================');
  console.log(`Duration: ${result.stats.duration}ms`);
  console.log(`Errors: ${result.stats.errors.length}`);
  if (result.stats.errors.length > 0) {
    console.log('Error details:');
    result.stats.errors.forEach((err) => console.log(`  - ${err}`));
  }

  // Scan thumbnails
  console.log();
  console.log('Scanning thumbnails...');
  const thumbnailConverter = new ThumbnailConverter(installPath);
  const trackLogos = await thumbnailConverter.findTrackLogos();
  const trackPhotos = await thumbnailConverter.findTrackPhotos();
  const vehicleClassLogos = await thumbnailConverter.findVehicleClassLogos();

  console.log(`Found ${trackLogos.size} track logos`);
  console.log(`Found ${trackPhotos.size} track photos`);
  console.log(`Found ${vehicleClassLogos.size} vehicle class logos`);

  // Map thumbnails to content
  for (const track of result.database.tracks) {
    const thumbnails = thumbnailConverter.mapTrackThumbnails(track.id, trackLogos, trackPhotos);
    if (thumbnails.thumbnail) {
      track.thumbnail = thumbnails.thumbnail;
    }
    if (thumbnails.photo) {
      track.photo = thumbnails.photo;
    }
  }

  for (const vehicle of result.database.vehicles) {
    const logo = thumbnailConverter.mapVehicleClassLogo(
      vehicle.vehicleClass,
      vehicleClassLogos
    );
    if (logo) {
      vehicle.thumbnail = logo;
    }
  }

  // Save to JSON
  const outputPath = join(process.cwd(), 'ams2-content.json');
  await writeFile(outputPath, JSON.stringify(result.database, null, 2), 'utf8');
  console.log();
  console.log(`Content database saved to: ${outputPath}`);

  // Display some sample data
  console.log();
  console.log('Sample Vehicles (first 5):');
  console.log('==========================');
  result.database.vehicles.slice(0, 5).forEach((vehicle) => {
    console.log(`- ${vehicle.displayName} (${vehicle.vehicleClass}) - ${vehicle.year || 'N/A'}`);
    console.log(`  Manufacturer: ${vehicle.manufacturer}`);
    console.log(`  DLC: ${vehicle.dlcId === 'base' ? 'Base Game' : vehicle.dlcId}`);
    console.log(`  Mod: ${vehicle.isModContent ? 'Yes' : 'No'}`);
    console.log();
  });

  console.log('Sample Tracks (first 5):');
  console.log('=======================');
  result.database.tracks.slice(0, 5).forEach((track) => {
    console.log(`- ${track.displayName} (${track.variation})`);
    console.log(`  Location: ${track.location}, ${track.country}`);
    console.log(`  Length: ${track.length}m, Turns: ${track.turns}`);
    console.log(`  DLC: ${track.dlcId === 'base' ? 'Base Game' : track.dlcId}`);
    console.log(`  Mod: ${track.isModContent ? 'Yes' : 'No'}`);
    console.log();
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
