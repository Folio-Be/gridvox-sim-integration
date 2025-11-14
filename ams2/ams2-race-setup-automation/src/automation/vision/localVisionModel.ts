export interface VisionInferenceResult {
  elements: Array<{
    id: string;
    text?: string;
    confidence: number;
    boundingBox: [number, number, number, number];
  }>;
}

export interface LocalVisionModel {
  load(): Promise<void>;
  infer(imagePath: string): Promise<VisionInferenceResult>;
}

/**
 * Minimal mock implementation until we wire up a real VLM.
 */
export class MockVisionModel implements LocalVisionModel {
  private loaded = false;

  async load(): Promise<void> {
    // simulate weight loading
    await sleep(200);
    this.loaded = true;
  }

  async infer(imagePath: string): Promise<VisionInferenceResult> {
    if (!this.loaded) {
      throw new Error('Vision model not initialized.');
    }
    return {
      elements: [
        {
          id: 'mock-tile',
          text: `Parsed from ${imagePath}`,
          confidence: 0.9,
          boundingBox: [100, 100, 300, 200],
        },
      ],
    };
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
