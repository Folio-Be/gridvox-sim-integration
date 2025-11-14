import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ams2AutomationPipeline } from './automation/pipeline';
import { VisionLayoutParser } from './automation/vision/visionLayoutParser';
import { LabelRepository } from './automation/vision/labelRepository';
import { PaddleOcrAdapter } from './automation/vision/paddleOcrAdapter';
import { YoloDetectorAdapter } from './automation/vision/yoloDetectorAdapter';
import { HybridLayoutParser } from './automation/vision/hybridLayoutParser';
import { planModels } from './services/modelPlanner';
import { AutomationModeManager } from './services/automationModeManager';
import { probeHardware } from './probe/hardwareProbe';
import { RaceStoryRequest } from './domain/raceDsl';

async function main() {
  const hardware = await probeHardware();
  const modelPlan = planModels(hardware);
  const modeManager = new AutomationModeManager(modelPlan);

  console.log('[probe] hardware profile', hardware);
  console.log('[planner] model plan', modelPlan);

  const story = loadSampleStory();
  const labelsDir = join(__dirname, '..', 'data', 'labels');
  const labelRepo = new LabelRepository(labelsDir);
  const yolo = new YoloDetectorAdapter(labelRepo);
  const ocr = new PaddleOcrAdapter(labelRepo);
  const hybrid = new HybridLayoutParser(yolo, ocr);
  const layoutParser = new VisionLayoutParser(hybrid);

  const pipeline = new Ams2AutomationPipeline({
    story,
    layoutParser,
  });

  modeManager.transition('race-setup');

  const plan = await pipeline.plan();
  await pipeline.execute(plan);

  modeManager.transition('idle');
}

function loadSampleStory(): RaceStoryRequest {
  const file = join(__dirname, '..', 'data', 'sample-story-race.json');
  const raw = readFileSync(file, 'utf-8');
  return JSON.parse(raw);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
