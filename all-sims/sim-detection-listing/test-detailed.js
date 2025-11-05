/**
 * Detailed test output
 */

const { detectSimulators } = require('./dist/index.js');

async function test() {
  console.log('=== Detailed Simulator Detection ===\n');

  const result = await detectSimulators({
    enableSteam: true,
    enableEpic: true,
    enableEA: true,
    enableManualScan: false,
    useCache: false,
  });

  console.log(`Detection time: ${result.detectionTime}ms`);
  console.log(`Found: ${result.simulators.length} simulator(s)\n`);

  result.simulators.forEach((sim, i) => {
    console.log(`${i + 1}. ${sim.name}`);
    console.log(`   ID: ${sim.id}`);
    console.log(`   Source: ${sim.source}`);
    console.log(`   Path: ${sim.installPath}`);
    console.log(`   Executable: ${sim.executable}`);

    if (sim.steamAppId) {
      console.log(`   Steam AppID: ${sim.steamAppId}`);
    }

    if (sim.metadata?.sizeOnDisk) {
      const gb = (sim.metadata.sizeOnDisk / 1024 / 1024 / 1024).toFixed(2);
      console.log(`   Size: ${gb} GB`);
    }

    if (sim.metadata?.lastPlayed) {
      console.log(`   Last Played: ${sim.metadata.lastPlayed.toLocaleString()}`);
    }

    console.log('');
  });

  if (result.errors?.length) {
    console.log('Errors:');
    result.errors.forEach(err => {
      console.log(`  - ${err.detector}: ${err.error}`);
    });
  }
}

test().catch(console.error);
