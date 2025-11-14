import { VisionInferenceResult } from './localVisionModel';
import { HybridLayoutParser } from './hybridLayoutParser';

export class VisionLayoutParser {
  private latest?: VisionInferenceResult;

  constructor(private readonly hybrid: HybridLayoutParser) {}

  public async refreshLayout(imagePath = 'data/captures/sample.png') {
    this.latest = await this.hybrid.refreshLayout(imagePath);
    return this.latest;
  }

  public findElementByText(text: string) {
    return this.latest?.elements.find(
      (element) => element.text?.toLowerCase() === text.toLowerCase(),
    );
  }
}
