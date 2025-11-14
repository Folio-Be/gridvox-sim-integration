import { LabelRepository } from './labelRepository';
import { LayoutElementLabel } from '../../domain/layoutLabel';

export interface Detection {
  label: string;
  bbox: [number, number, number, number];
  confidence: number;
}

/**
 * Placeholder adapter representing YOLOv8-n detection results.
 */
export class YoloDetectorAdapter {
  constructor(private readonly repo: LabelRepository) {}

  public async detect(imagePath: string): Promise<LayoutElementLabel[]> {
    const record = await this.repo.findRecordFor(imagePath);
    if (!record) return [];
    return record.elements;
  }
}
