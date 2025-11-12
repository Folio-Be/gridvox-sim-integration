/**
 * Quick test to verify the library works
 */

const { detectSimulators } = require('./dist/index.js');

async function test() {
  console.log('Testing @SimVox.ai/sim-detection...\n');

  try {
    const result = await detectSimulators({
      enableSteam: true,
      enableEpic: true,
      enableEA: true,
      enableManualScan: false,
      useCache: false,
    });

    console.log(`✓ Detection completed in ${result.detectionTime}ms`);
    console.log(`✓ Found ${result.simulators.length} racing simulator(s)\n`);

    if (result.simulators.length > 0) {
      console.log('Detected simulators:');
      result.simulators.forEach((sim, index) => {
        console.log(`  ${index + 1}. ${sim.name} (${sim.source})`);
      });
    }

    if (result.errors && result.errors.length > 0) {
      console.log('\nNon-fatal errors:');
      result.errors.forEach((err) => {
        console.log(`  - ${err.detector}: ${err.error}`);
      });
    }

    console.log('\n✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
}

test();
