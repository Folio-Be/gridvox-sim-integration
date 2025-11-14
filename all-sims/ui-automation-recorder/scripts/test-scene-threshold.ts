#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import { extractFrames } from '../src/extraction/frameExtractor';
import { getSimProfileOrExit } from './utils';

interface CliArgs {
  [key: string]: string | undefined;
}

const args = parseArgs(process.argv.slice(2));
const sim = args.sim ?? 'ams2';
const video = args.video;

if (!video) {
  console.error('Usage: pnpm run test-scene -- --video <path-to-mp4> [--sim ams2] [--fps 0.5] [--threshold 0.3] [--keep]');
  process.exit(1);
}

const profile = getSimProfileOrExit(sim);
const fps = Number(args.fps ?? profile.extraction?.fps ?? 0.5);
const sceneThreshold = Number(args.threshold ?? profile.extraction?.sceneThreshold ?? 0.3);
const keep = args.keep === 'true' || args.keep === '1';

const tempDir = path.join(
  profile.paths?.capturesDir ?? 'data/captures',
  `scene-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
);

(async () => {
  console.log(`[scene-test] sim=${sim} fps=${fps} threshold=${sceneThreshold}`);
  console.log(`[scene-test] writing temporary frames to ${tempDir}`);
  const frames = await extractFrames(video, tempDir, {
    fps,
    sceneThreshold,
    ffmpegPath: profile.extraction?.ffmpegPath ?? 'ffmpeg',
    logger: (msg) => console.log(`[scene-test] ${msg}`),
    progressPollMs: 1500,
  });
  console.log(`[scene-test] frames flagged by scene detection: ${frames.length}`);
  if (!keep) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('[scene-test] temporary frames removed (pass --keep to retain)');
  } else {
    console.log('[scene-test] temporary frames kept for manual review');
  }
})().catch((err) => {
  console.error(err);
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  process.exit(1);
});

function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        result[key] = value;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}
