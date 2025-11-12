/**
 * Example usage of @SimVox/sim-detection
 */

import {
  detectSimulators,
  getInstalledSimulators,
  isSimulatorInstalled,
  getSimulator,
  detectRunningSimulators,
  isSimulatorRunning,
  refreshDetection,
} from './src/index';

async function main() {
  console.log('=== SimVox Simulator Detection Example ===\n');

  // Example 1: Simple detection
  console.log('1. Detecting installed simulators...');
  const simulators = await getInstalledSimulators();

  console.log(`Found ${simulators.length} racing simulator(s):\n`);
  simulators.forEach((sim, index) => {
    console.log(`${index + 1}. ${sim.name}`);
    console.log(`   ID: ${sim.id}`);
    console.log(`   Source: ${sim.source}`);
    console.log(`   Path: ${sim.installPath}`);
    console.log(`   Executable: ${sim.executable}`);

    if (sim.steamAppId) {
      console.log(`   Steam AppID: ${sim.steamAppId}`);
    }

    if (sim.metadata?.sizeOnDisk) {
      const sizeGB = (sim.metadata.sizeOnDisk / 1024 / 1024 / 1024).toFixed(2);
      console.log(`   Size: ${sizeGB} GB`);
    }

    if (sim.metadata?.lastPlayed) {
      console.log(`   Last Played: ${sim.metadata.lastPlayed.toLocaleDateString()}`);
    }

    console.log('');
  });

  // Example 2: Full detection with timing
  console.log('\n2. Full detection with timing...');
  const result = await detectSimulators();

  console.log(`Detection completed in ${result.detectionTime}ms`);
  console.log(`Found ${result.simulators.length} simulator(s)`);

  if (result.errors && result.errors.length > 0) {
    console.log('\nErrors encountered:');
    result.errors.forEach((err) => {
      console.log(`  - ${err.detector}: ${err.error}`);
    });
  }

  // Example 3: Check for specific simulator
  console.log('\n3. Checking for specific simulators...');

  const iracingInstalled = await isSimulatorInstalled('iracing');
  console.log(`iRacing installed: ${iracingInstalled}`);

  const acInstalled = await isSimulatorInstalled('assetto-corsa');
  console.log(`Assetto Corsa installed: ${acInstalled}`);

  const accInstalled = await isSimulatorInstalled('assetto-corsa-competizione');
  console.log(`ACC installed: ${accInstalled}`);

  // Example 4: Get specific simulator details
  console.log('\n4. Getting specific simulator details...');

  const iracing = await getSimulator('iracing');
  if (iracing) {
    console.log('\niRacing Details:');
    console.log(JSON.stringify(iracing, null, 2));
  } else {
    console.log('iRacing not found');
  }

  // Example 5: Detect running simulators
  console.log('\n5. Detecting running simulators...');

  const running = await detectRunningSimulators();

  if (running.length > 0) {
    console.log(`Found ${running.length} running simulator(s):`);
    running.forEach((sim) => {
      console.log(`  - ${sim.name} (PID: ${sim.pid})`);
    });
  } else {
    console.log('No racing simulators currently running');
  }

  // Example 6: Check if specific sim is running
  if (iracingInstalled) {
    const iracingRunning = await isSimulatorRunning('iracing');
    console.log(`\niRacing currently running: ${iracingRunning}`);
  }

  // Example 7: Custom detection options
  console.log('\n6. Detection with custom options...');

  const customResult = await detectSimulators({
    enableSteam: true,
    enableEpic: true,
    enableEA: true,
    enableManualScan: true, // Enable filesystem scanning
    customPaths: ['D:\\Games', 'E:\\SteamLibrary'], // Custom paths
    useCache: false, // Disable cache for fresh scan
  });

  console.log(`Custom detection found ${customResult.simulators.length} simulator(s)`);
  console.log(`Detection time: ${customResult.detectionTime}ms`);

  // Example 8: Refresh detection (clear cache)
  console.log('\n7. Refreshing detection...');
  const refreshed = await refreshDetection();
  console.log(`Refreshed detection found ${refreshed.simulators.length} simulator(s)`);

  // Example 9: Group by source
  console.log('\n8. Simulators grouped by source:');

  const groupedBySteam = simulators.filter((s) => s.source === 'steam');
  const groupedByEpic = simulators.filter((s) => s.source === 'epic');
  const groupedByEA = simulators.filter((s) => s.source === 'ea' || s.source === 'origin');
  const groupedByManual = simulators.filter((s) => s.source === 'manual');

  console.log(`  Steam: ${groupedBySteam.length}`);
  console.log(`  Epic Games: ${groupedByEpic.length}`);
  console.log(`  EA/Origin: ${groupedByEA.length}`);
  console.log(`  Manual: ${groupedByManual.length}`);

  console.log('\n=== Example Complete ===');
}

// Run example
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
