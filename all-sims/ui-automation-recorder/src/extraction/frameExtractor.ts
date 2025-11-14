import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface FrameExtractionOptions {
  ffmpegPath?: string;
  fps?: number;
  sceneThreshold?: number;
  outputPattern?: string;
  progressPollMs?: number;
  logger?: (message: string) => void;
}

export async function extractFrames(
  videoPath: string,
  outputDir: string,
  options: FrameExtractionOptions = {},
): Promise<string[]> {
  const ffmpegPath = options.ffmpegPath ?? 'ffmpeg';
  const fps = options.fps ?? 0.5;
  const sceneThreshold = options.sceneThreshold ?? 0.3;
  const outputPattern = options.outputPattern ?? 'frame-%05d.png';
  const filter = `select=gt(scene\\,${sceneThreshold}),fps=${fps}`;
  const logger = options.logger;
  const progressPollMs = options.progressPollMs ?? 2000;
  const startTime = Date.now();

  fs.mkdirSync(outputDir, { recursive: true });
  let pollHandle: NodeJS.Timeout | undefined;
  if (logger && progressPollMs > 0) {
    pollHandle = setInterval(() => {
      const count = countPngFiles(outputDir);
      logger(`Extracted ${count} frames so far...`);
    }, progressPollMs);
  }

  await runFfmpeg(ffmpegPath, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    videoPath,
    '-vf',
    filter,
    '-vsync',
    'vfr',
    path.join(outputDir, outputPattern),
  ]).finally(() => {
    if (pollHandle) {
      clearInterval(pollHandle);
    }
  });

  const frames = fs
    .readdirSync(outputDir)
    .filter((file) => file.toLowerCase().endsWith('.png'))
    .sort()
    .map((file) => path.join(outputDir, file));

  if (logger) {
    const durationSec = (Date.now() - startTime) / 1000;
    logger(`Extraction finished: ${frames.length} frames (${durationSec.toFixed(1)}s)`);
  }

  return frames;
}

function runFfmpeg(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

function countPngFiles(dir: string): number {
  try {
    return fs
      .readdirSync(dir)
      .filter((file) => file.toLowerCase().endsWith('.png')).length;
  } catch {
    return 0;
  }
}
