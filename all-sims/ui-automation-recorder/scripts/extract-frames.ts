#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';
import { getSimProfileOrExit, resolveCaptureRegionOrExit } from './utils';
import { extractFrames } from '../src/extraction/frameExtractor';
import { writeFrameMetadata } from '../src/extraction/metadataWriter';

interface CliArgs {
  [key: string]: string | undefined;
}

const args = parseArgs(process.argv.slice(2));
const sim = args.sim ?? 'ams2';
const profile = getSimProfileOrExit(sim);
const regionName = args.region ?? profile.capture?.defaultRegion;
const { name: captureRegionName, preset: captureRegion } =
  resolveCaptureRegionOrExit(profile, regionName);
let videoPath = args.video ?? findLatestVideo(profile.paths?.recordingsDir ?? 'data/recordings');

if (!videoPath) {
  console.error('No video provided and none found in recordings directory.');
  process.exit(1);
}
const video = videoPath;
const sessionId = path.basename(video, path.extname(video));
const captureDir = path.join('data', 'captures', sessionId);

async function run() {
  console.log(
    `Extracting frames from ${video} -> ${captureDir} (region=${captureRegionName} ${captureRegion.crop.join(
      ',',
    )})`,
  );
  const frames = await extractFrames(video, captureDir, {
    fps: profile.extraction?.fps ?? 0.5,
    sceneThreshold: profile.extraction?.sceneThreshold ?? 0.3,
    ffmpegPath: profile.extraction?.ffmpegPath ?? 'ffmpeg',
    logger: (msg) => console.log(`[extract-frames] ${msg}`),
  });
  writeFrameMetadata(frames, {
    sourceVideo: path.resolve(video),
    sim,
    resolution: [
      captureRegion.crop[2] ?? profile.resolution?.[0] ?? 1920,
      captureRegion.crop[3] ?? profile.resolution?.[1] ?? 1080,
    ],
    captureRegion: captureRegionName,
    crop: captureRegion.crop,
  });
  console.log(`Generated ${frames.length} frames`);
}

run().catch((err) => {
  console.error(err);
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

function findLatestVideo(dir: string): string | undefined {
  if (!fs.existsSync(dir)) return undefined;
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith('.mp4'))
    .map((file) => path.join(dir, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}
