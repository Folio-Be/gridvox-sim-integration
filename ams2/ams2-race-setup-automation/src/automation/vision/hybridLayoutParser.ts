import { VisionInferenceResult } from './localVisionModel';
import { PaddleOcrAdapter } from './paddleOcrAdapter';
import { YoloDetectorAdapter } from './yoloDetectorAdapter';

export class HybridLayoutParser {
  private latest?: VisionInferenceResult;

  constructor(
    private readonly yolo: YoloDetectorAdapter,
    private readonly ocr: PaddleOcrAdapter,
  ) {}

  public async refreshLayout(imagePath: string): Promise<VisionInferenceResult> {
    const detections = await this.yolo.detect(imagePath);
    const textOverlays = await this.ocr.recognizeForElements(imagePath, detections);

    this.latest = {
      elements: detections.map((det, index) => ({
        id: `${det.label}-${index}`,
        text: textOverlays[index]?.text ?? '',
        confidence: 0.9,
        boundingBox: det.bbox,
      })),
    };

    return this.latest;
  }

  public getLatest(): VisionInferenceResult | undefined {
    return this.latest;
  }
}
