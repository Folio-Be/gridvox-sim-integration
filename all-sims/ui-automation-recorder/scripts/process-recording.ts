#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
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
const recordingsDir = profile.paths?.recordingsDir ?? path.join('data', 'recordings');
let videoCandidate = args.video ?? findLatestVideo(recordingsDir);

if (!videoCandidate) {
  console.error('No video file provided and none found in recordings directory.');
  process.exit(1);
}
const video = videoCandidate;
const sessionId = path.basename(video, path.extname(video));
const captureDir = path.join('data', 'captures', sessionId);
const preannotDir = path.join('data', 'preannotations', sessionId);
const inputLogPath = findInputLog(video);
const ffmpegPath = profile.extraction?.ffmpegPath ?? 'ffmpeg';

async function run() {
  console.log(
    `Processing recording ${video} (region=${captureRegionName} ${captureRegion.crop.join(',')})`,
  );
  const ffmpegVersion = await getFfmpegVersion(ffmpegPath);
  const frames = await extractFrames(video, captureDir, {
    fps: profile.extraction?.fps ?? 0.5,
    sceneThreshold: profile.extraction?.sceneThreshold ?? 0.3,
    ffmpegPath,
    logger: (msg) => console.log(`[process-recording] ${msg}`),
  });
  if (inputLogPath) {
    fs.copyFileSync(inputLogPath, path.join(captureDir, 'input-log.jsonl'));
  }
  writeFrameMetadata(frames, {
    sourceVideo: path.resolve(video),
    sim,
    resolution: [
      captureRegion.crop[2] ?? profile.resolution?.[0] ?? 1920,
      captureRegion.crop[3] ?? profile.resolution?.[1] ?? 1080,
    ],
    inputLog: inputLogPath ? path.resolve(inputLogPath) : undefined,
    ffmpegVersion,
    captureRegion: captureRegionName,
    crop: captureRegion.crop,
  });
  console.log(`Frames generated: ${frames.length}`);

  await runPythonPreannotator(captureDir, preannotDir);
  console.log(`Pre-annotations stored in ${preannotDir}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function runPythonPreannotator(inputDir: string, outputDir: string) {
  fs.mkdirSync(outputDir, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const child = spawn('python', ['scripts/batch_preannotate.py', '--input', inputDir, '--output', outputDir], {
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`batch_preannotate exited with code ${code}`));
    });
  });
}

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

function findInputLog(videoPath: string): string | undefined {
  const logPath = videoPath.replace(/\.mp4$/i, '.inputs.jsonl');
  return fs.existsSync(logPath) ? logPath : undefined;
}

function getFfmpegVersion(executable: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ['-version'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        const firstLine = stdout.split(/\r?\n/)[0]?.trim() ?? '';
        if (firstLine) {
          console.log(`[ffmpeg] ${firstLine}`);
        }
        resolve(firstLine);
      } else {
        reject(new Error(`ffmpeg -version failed (${stderr.trim()})`));
      }
    });
  });
}
