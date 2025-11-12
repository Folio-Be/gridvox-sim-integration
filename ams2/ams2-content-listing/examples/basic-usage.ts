/**
 * Basic usage examples for ams2-content-listing
 */

import { AMS2ContentScanner, ThumbnailConverter, Vehicle, Track } from '../src';

async function basicExample() {
  // Create scanner with AMS2 installation path
  const ams2Path = 'C:\\GAMES\\Automobilista 2';
  const scanner = new AMS2ContentScanner(ams2Path);

  // Scan all content
  console.log('Scanning AMS2 content...');
  const result = await scanner.scan();

  console.log(`Found ${result.database.vehicles.length} vehicles`);
  console.log(`Found ${result.database.tracks.length} tracks`);
  console.log(`Scan took ${result.stats.duration}ms`);
}

async function filteringExample() {
  const scanner = new AMS2ContentScanner('C:\\GAMES\\Automobilista 2');
  const { database } = await scanner.scan();

  // Find all GT3 cars
  const gt3Cars = database.vehicles.filter((v) => v.vehicleClass.includes('GT3'));
  console.log(`GT3 Cars: ${gt3Cars.length}`);

  // Find all LMDh/Hypercar prototypes
  const prototypes = database.vehicles.filter(
    (v) => v.vehicleClass === 'LMDh' || v.vehicleClass === 'Hypercar'
  );
  console.log(`Prototypes: ${prototypes.length}`);

  // Find all Formula cars
  const formulaCars = database.vehicles.filter((v) => v.vehicleGroup.startsWith('F-'));
  console.log(`Formula Cars: ${formulaCars.length}`);

  // Find tracks in a specific country
  const brazilTracks = database.tracks.filter((t) => t.country === 'BR');
  console.log(`Brazil Tracks: ${brazilTracks.length}`);

  // Find long tracks (over 5km)
  const longTracks = database.tracks.filter((t) => t.length > 5000);
  console.log(`Long Tracks (>5km): ${longTracks.length}`);
}

async function dlcExample() {
  const scanner = new AMS2ContentScanner('C:\\GAMES\\Automobilista 2');
  const { database } = await scanner.scan();

  // List all DLCs
  console.log('Installed DLCs:');
  database.dlcs.forEach((dlc) => {
    console.log(
      `- ${dlc.displayName}: ${dlc.vehicleCount} vehicles, ${dlc.trackCount} tracks`
    );
  });

  // Get only DLC content (exclude base game)
  const dlcVehicles = database.vehicles.filter((v) => v.dlcId !== 'base');
  const dlcTracks = database.tracks.filter((t) => t.dlcId !== 'base');
  console.log(`Total DLC vehicles: ${dlcVehicles.length}`);
  console.log(`Total DLC tracks: ${dlcTracks.length}`);
}

async function thumbnailExample() {
  const ams2Path = 'C:\\GAMES\\Automobilista 2';
  const thumbnailConverter = new ThumbnailConverter(ams2Path);

  // Find all thumbnails
  const trackLogos = await thumbnailConverter.findTrackLogos();
  const trackPhotos = await thumbnailConverter.findTrackPhotos();
  const classLogos = await thumbnailConverter.findVehicleClassLogos();

  console.log(`Track Logos: ${trackLogos.size}`);
  console.log(`Track Photos: ${trackPhotos.size}`);
  console.log(`Class Logos: ${classLogos.size}`);

  // Map thumbnails to a specific track
  const trackId = 'interlagos';
  const thumbnails = thumbnailConverter.mapTrackThumbnails(trackId, trackLogos, trackPhotos);
  console.log(`Interlagos logo: ${thumbnails.thumbnail}`);
  console.log(`Interlagos photo: ${thumbnails.photo}`);
}

async function SimVoxIntegration() {
  /**
   * Example of how SimVox might use this library
   */
  const scanner = new AMS2ContentScanner('C:\\GAMES\\Automobilista 2');
  const { database } = await scanner.scan();

  // User selects a story campaign focused on GT3 racing
  const availableGT3Cars = database.vehicles.filter((v) => v.vehicleClass === 'GT3_Gen2');

  // User wants to race at a European circuit
  const europeanTracks = database.tracks.filter((t) =>
    ['GB', 'DE', 'IT', 'BE', 'ES', 'FR'].includes(t.country)
  );

  // Provide context to AI persona
  const selectedCar = availableGT3Cars[0];
  const selectedTrack = europeanTracks[0];

  const personaContext = {
    vehicle: {
      name: selectedCar.displayName,
      manufacturer: selectedCar.manufacturer,
      class: selectedCar.vehicleClass,
      year: selectedCar.year,
    },
    track: {
      name: selectedTrack.displayName,
      location: selectedTrack.location,
      country: selectedTrack.country,
      length: `${(selectedTrack.length / 1000).toFixed(2)}km`,
      turns: selectedTrack.turns,
    },
  };

  console.log('AI Persona Context:');
  console.log(JSON.stringify(personaContext, null, 2));

  // The AI can now say:
  // "Alright, we're taking the Mercedes-AMG GT3 out to Spa-Francorchamps.
  //  This 7.00km circuit with 19 turns is going to be a great challenge..."
}

async function raceSetupExample() {
  /**
   * Pre-race setup screen integration
   */
  const scanner = new AMS2ContentScanner('C:\\GAMES\\Automobilista 2');
  const { database } = await scanner.scan();

  // Group vehicles by class for dropdown menu
  const vehiclesByClass = database.vehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.vehicleClass]) {
      acc[vehicle.vehicleClass] = [];
    }
    acc[vehicle.vehicleClass].push(vehicle);
    return acc;
  }, {} as Record<string, Vehicle[]>);

  // Group tracks by country for dropdown menu
  const tracksByCountry = database.tracks.reduce((acc, track) => {
    if (!acc[track.country]) {
      acc[track.country] = [];
    }
    acc[track.country].push(track);
    return acc;
  }, {} as Record<string, Track[]>);

  console.log('Vehicle classes available:', Object.keys(vehiclesByClass).length);
  console.log('Countries with tracks:', Object.keys(tracksByCountry).length);

  // Example: Show GT3 cars sorted by manufacturer
  const gt3Cars = vehiclesByClass['GT3_Gen2'] || [];
  const sortedByMfr = gt3Cars.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));

  console.log('\nGT3 Cars by Manufacturer:');
  sortedByMfr.forEach((car) => {
    console.log(`- ${car.manufacturer} ${car.model}`);
  });
}

// Run examples
if (require.main === module) {
  (async () => {
    console.log('=== Basic Example ===');
    await basicExample();

    console.log('\n=== Filtering Example ===');
    await filteringExample();

    console.log('\n=== DLC Example ===');
    await dlcExample();

    console.log('\n=== SimVox Integration ===');
    await SimVoxIntegration();
  })();
}
