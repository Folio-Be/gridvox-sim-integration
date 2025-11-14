import { probeHardware } from './hardwareProbe';
import { planModels } from '../services/modelPlanner';

async function run() {
  const hardware = await probeHardware();
  const modelPlan = planModels(hardware);

  console.log(JSON.stringify({ hardware, modelPlan }, null, 2));
}

run().catch((error) => {
  console.error('Hardware probe failed', error);
  process.exit(1);
});
