#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Detailed content listing with image paths
 */
async function main() {
  const jsonPath = join(process.cwd(), 'ams2-content.json');
  const data = JSON.parse(await readFile(jsonPath, 'utf8'));

  console.log('='.repeat(80));
  console.log('AMS2 COMPLETE CONTENT LISTING');
  console.log('='.repeat(80));
  console.log();

  // Show summary
  console.log(`Installation: ${data.installPath}`);
  console.log(`Last Scanned: ${new Date(data.lastScanned).toLocaleString()}`);
  console.log(`Total Vehicles: ${data.vehicles.length} (${data.modVehicleCount} mods)`);
  console.log(`Total Tracks: ${data.tracks.length} (${data.modTrackCount} mods)`);
  console.log();

  // List all vehicles with thumbnails
  console.log('='.repeat(80));
  console.log('VEHICLES');
  console.log('='.repeat(80));
  console.log();

  const vehiclesByClass = data.vehicles.reduce((acc: any, v: any) => {
    if (!acc[v.vehicleClass]) acc[v.vehicleClass] = [];
    acc[v.vehicleClass].push(v);
    return acc;
  }, {});

  const classes = Object.keys(vehiclesByClass).sort();

  for (const vehicleClass of classes) {
    const vehicles = vehiclesByClass[vehicleClass];
    console.log(`\n${vehicleClass} (${vehicles.length} vehicles)`);
    console.log('-'.repeat(80));

    for (const v of vehicles) {
      console.log(`  ${v.displayName}`);
      console.log(`    ID: ${v.id}`);
      console.log(`    Manufacturer: ${v.manufacturer} | Year: ${v.year || 'N/A'} | Country: ${v.country}`);
      console.log(`    DLC: ${v.dlcId === 'base' ? 'Base Game' : v.dlcId}`);
      if (v.thumbnail) {
        console.log(`    Thumbnail: ${v.thumbnail}`);
      }
      console.log(`    Source: ${v.filePath}`);
      console.log();
    }
  }

  // List all tracks with thumbnails
  console.log('='.repeat(80));
  console.log('TRACKS');
  console.log('='.repeat(80));
  console.log();

  const tracksByCountry = data.tracks.reduce((acc: any, t: any) => {
    const country = t.country || 'Unknown';
    if (!acc[country]) acc[country] = [];
    acc[country].push(t);
    return acc;
  }, {});

  const countries = Object.keys(tracksByCountry).sort();

  for (const country of countries) {
    const tracks = tracksByCountry[country];
    console.log(`\n${country} (${tracks.length} tracks)`);
    console.log('-'.repeat(80));

    for (const t of tracks) {
      console.log(`  ${t.displayName} (${t.variation})`);
      console.log(`    ID: ${t.id}`);
      console.log(`    Location: ${t.location} | Length: ${t.length}m | Turns: ${t.turns}`);
      console.log(`    Type: ${t.trackType} | Max AI: ${t.maxAI} | Year: ${t.year || 'N/A'}`);
      console.log(`    DLC: ${t.dlcId === 'base' ? 'Base Game' : t.dlcId}`);
      if (t.thumbnail) {
        console.log(`    Logo: ${t.thumbnail}`);
      }
      if (t.photo) {
        console.log(`    Photo: ${t.photo}`);
      }
      if (t.latitude && t.longitude) {
        console.log(`    GPS: ${t.latitude}, ${t.longitude}`);
      }
      console.log(`    Source: ${t.filePath}`);
      console.log();
    }
  }

  // List all thumbnails found
  console.log('='.repeat(80));
  console.log('THUMBNAIL SUMMARY');
  console.log('='.repeat(80));
  console.log();

  const vehiclesWithThumbnails = data.vehicles.filter((v: any) => v.thumbnail);
  const tracksWithLogos = data.tracks.filter((t: any) => t.thumbnail);
  const tracksWithPhotos = data.tracks.filter((t: any) => t.photo);

  console.log(`Vehicles with thumbnails: ${vehiclesWithThumbnails.length}/${data.vehicles.length}`);
  console.log(`Tracks with logos: ${tracksWithLogos.length}/${data.tracks.length}`);
  console.log(`Tracks with photos: ${tracksWithPhotos.length}/${data.tracks.length}`);
  console.log();

  // List unique thumbnail paths
  const uniqueVehicleThumbnails = [...new Set(vehiclesWithThumbnails.map((v: any) => v.thumbnail))];
  const uniqueTrackLogos = [...new Set(tracksWithLogos.map((t: any) => t.thumbnail))];
  const uniqueTrackPhotos = [...new Set(tracksWithPhotos.map((t: any) => t.photo))];

  console.log(`Unique vehicle class logos: ${uniqueVehicleThumbnails.length}`);
  console.log(`Unique track logos: ${uniqueTrackLogos.length}`);
  console.log(`Unique track photos: ${uniqueTrackPhotos.length}`);
  console.log();

  console.log('Vehicle Class Logo Files:');
  (uniqueVehicleThumbnails as string[]).sort().forEach((path) => {
    const filename = path.split('\\').pop();
    console.log(`  - ${filename}`);
  });

  console.log();
  console.log('Track Logo Files:');
  (uniqueTrackLogos as string[]).sort().forEach((path) => {
    const filename = path.split('\\').pop();
    console.log(`  - ${filename}`);
  });

  console.log();
  console.log('Track Photo Files:');
  (uniqueTrackPhotos as string[]).sort().forEach((path) => {
    const filename = path.split('\\').pop();
    console.log(`  - ${filename}`);
  });
}

main().catch(console.error);
