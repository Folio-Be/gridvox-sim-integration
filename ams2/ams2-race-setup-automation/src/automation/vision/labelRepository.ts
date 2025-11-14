import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { LayoutLabelRecord } from '../../domain/layoutLabel';

export class LabelRepository {
  private cache?: LayoutLabelRecord[];

  constructor(private readonly labelsDir: string) {}

  public async all(): Promise<LayoutLabelRecord[]> {
    if (!this.cache) {
      const files = await fs.readdir(this.labelsDir);
      const records: LayoutLabelRecord[] = [];
      for (const file of files.filter((f) => f.endsWith('.json'))) {
        const raw = await fs.readFile(join(this.labelsDir, file), 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed?.screenshot) {
          records.push(parsed);
        }
      }
      this.cache = records;
    }
    return this.cache;
  }

  public async findRecordFor(imagePath: string): Promise<LayoutLabelRecord | undefined> {
    const baseName = imagePath.split(/[\\/]/).pop()?.toLowerCase();
    const records = await this.all();
    return (
      records.find((record) =>
        record.screenshot.toLowerCase().includes(baseName ?? ''),
      ) ?? records[0]
    );
  }
}
