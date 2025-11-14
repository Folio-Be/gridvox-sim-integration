import { join } from 'node:path';
import assert from 'node:assert';
import { LabelRepository } from '../src/automation/vision/labelRepository';
import { YoloDetectorAdapter } from '../src/automation/vision/yoloDetectorAdapter';
import { PaddleOcrAdapter } from '../src/automation/vision/paddleOcrAdapter';
import { HybridLayoutParser } from '../src/automation/vision/hybridLayoutParser';
import { VisionLayoutParser } from '../src/automation/vision/visionLayoutParser';

async function run() {
  const labelsDir = join(__dirname, '..', 'data', 'labels');
  const repo = new LabelRepository(labelsDir);
  const parser = new VisionLayoutParser(new HybridLayoutParser(new YoloDetectorAdapter(repo), new PaddleOcrAdapter(repo)));

  const result = await parser.refreshLayout('sample-car-grid.png');
  assert(result.elements.length > 0, 'Expected elements from label replay');

  const tile = parser.findElementByText('Mercedes-AMG GT3');
  assert(tile, 'Expected Mercedes tile');

  console.log('layoutParser.spec.ts passed', {
    totalElements: result.elements.length,
    foundElement: tile?.id,
  });
}

run().catch((err) => {
  console.error('layoutParser.spec.ts failed', err);
  process.exit(1);
});
