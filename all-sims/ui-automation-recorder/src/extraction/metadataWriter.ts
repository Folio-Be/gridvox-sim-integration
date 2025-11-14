import fs from 'fs';
import path from 'path';

export interface FrameMetadataOptions {
  sourceVideo: string;
  sim: string;
  resolution: [number, number];
  inputLog?: string;
  ffmpegVersion?: string;
  captureRegion?: string;
  crop?: [number, number, number, number];
}

export function writeFrameMetadata(
  frames: string[],
  options: FrameMetadataOptions,
): string[] {
  return frames.map((framePath, index) => {
    const metadata = {
      framePath: framePath.replace(/\\/g, '/'),
      frameFile: path.basename(framePath),
      index,
      sourceVideo: options.sourceVideo.replace(/\\/g, '/'),
      sim: options.sim,
      resolution: options.resolution,
      inputLog: options.inputLog,
      ffmpegVersion: options.ffmpegVersion,
      captureRegion: options.captureRegion,
      crop: options.crop,
      createdAt: new Date().toISOString(),
    };
    const outputPath = `${framePath}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');
    return outputPath;
  });
}
