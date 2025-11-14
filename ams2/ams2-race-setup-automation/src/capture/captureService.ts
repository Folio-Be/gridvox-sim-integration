import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import screenshot from 'screenshot-desktop';
import { getCursorPosition } from './cursor';

export interface CaptureOptions {
  outputDir: string;
  prefix?: string;
  note?: string;
  hotkey?: string;
}

export interface CaptureResult {
  imagePath: string;
  metadataPath: string;
}

export async function captureScreenshot(options: CaptureOptions): Promise<CaptureResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = options.prefix ?? 'ams2';
  await fs.mkdir(options.outputDir, { recursive: true });

  const imagePath = join(options.outputDir, `${prefix}-${timestamp}.png`);
  const metadataPath = imagePath.replace(/\.png$/, '.json');

  const imageBuffer = await screenshot({ format: 'png' });
  await fs.writeFile(imagePath, imageBuffer);

  const metadata = {
    capturedAt: new Date().toISOString(),
    note: options.note ?? '',
    hotkey: options.hotkey ?? null,
    cursor: getCursorPosition(),
    source: 'ams2-race-setup-automation/captureCli',
  };
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  return { imagePath, metadataPath };
}
