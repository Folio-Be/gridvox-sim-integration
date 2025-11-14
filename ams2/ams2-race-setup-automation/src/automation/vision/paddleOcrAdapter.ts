import { LabelRepository } from './labelRepository';
import { LayoutElementLabel } from '../../domain/layoutLabel';

export interface RecognizedText {
  bbox: [number, number, number, number];
  text: string;
}

/**
 * Placeholder adapter representing PaddleOCR outputs.
 * Reads from curated label JSON until actual OCR integration lands.
 */
export class PaddleOcrAdapter {
  constructor(private readonly repo: LabelRepository) {}

  public async recognize(imagePath: string): Promise<RecognizedText[]> {
    const record = await this.repo.findRecordFor(imagePath);
    if (!record) return [];
    return record.elements
      .filter((el) => Boolean(el.text))
      .map((el) => ({
        bbox: el.bbox,
        text: el.text ?? '',
      }));
  }

  public async recognizeForElements(
    imagePath: string,
    elements: LayoutElementLabel[],
  ): Promise<RecognizedText[]> {
    const record = await this.repo.findRecordFor(imagePath);
    if (!record) return [];
    return elements.map((el) => {
      const match = record.elements.find((candidate) => candidate.bbox.join() === el.bbox.join());
      return {
        bbox: el.bbox,
        text: match?.text ?? '',
      };
    });
  }
}
