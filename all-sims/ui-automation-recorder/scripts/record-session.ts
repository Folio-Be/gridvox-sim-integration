#!/usr/bin/env ts-node
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getSimProfileOrExit, resolveCaptureRegionOrExit } from './utils';

const args = parseArgs(process.argv.slice(2));
const sim = String(args.sim ?? 'ams2');
const profile = getSimProfileOrExit(sim);
const regionName = args.region ?? profile.capture?.defaultRegion;
const { name: captureRegionName, preset: captureRegion } =
  resolveCaptureRegionOrExit(profile, regionName);
const windowTitle =
  args.windowTitle ?? args.window ?? profile.windowTitle ?? defaultWindowTitle(sim);
const outputDir = args.output ?? profile.paths?.recordingsDir ?? path.join('data', 'recordings');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputPath = path.resolve(
  outputDir,
  `${sim}-recording-${timestamp}.mp4`
);
const ffmpegPath = args.ffmpeg ?? 'ffmpeg';
const fps = Number(args.fps ?? profile.framerate ?? '60') || 60;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const cargoArgs: string[] = [
  'run',
  '--release',
  '--manifest-path',
  path.join('src-tauri', 'Cargo.toml'),
  '--',
  'record',
  '--window',
  windowTitle,
  '--output',
  outputPath,
  '--ffmpeg',
  ffmpegPath,
  '--fps',
  String(fps)
];

if (profile.bookmarkHotkey) {
  cargoArgs.push('--bookmark-ctrl', String(profile.bookmarkHotkey.ctrl ?? true));
  cargoArgs.push('--bookmark-shift', String(profile.bookmarkHotkey.shift ?? false));
  cargoArgs.push('--bookmark-key', profile.bookmarkHotkey.key ?? 'L');
  if (profile.bookmarkHotkey.noteMode) {
    cargoArgs.push('--bookmark-note-mode', profile.bookmarkHotkey.noteMode);
  }
}

cargoArgs.push('--crop-x', String(captureRegion.crop[0]));
cargoArgs.push('--crop-y', String(captureRegion.crop[1]));
cargoArgs.push('--crop-width', String(captureRegion.crop[2]));
cargoArgs.push('--crop-height', String(captureRegion.crop[3]));

console.log(
  `Recording sim="${sim}" window="${windowTitle}" -> ${outputPath} (region=${captureRegionName} ${captureRegion.crop.join(
    ',',
  )})`,
);

console.log('Press Ctrl+C to stop the recording...');

const child = spawn('cargo', cargoArgs, { stdio: 'inherit' });
child.on('exit', (code) => {
  process.exit(code ?? 1);
});

type CliArgs = Record<string, string>;

function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        result[toCamelCase(key)] = value;
        i++;
      } else {
        result[toCamelCase(key)] = 'true';
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const value = argv[i + 1];
      if (value && !value.startsWith('-')) {
        result[toCamelCase(key)] = value;
        i++;
      }
    }
  }
  return result;
}

function toCamelCase(input: string): string {
  return input.replace(/-([a-z])/gi, (_, group) => group.toUpperCase());
}

function defaultWindowTitle(simName: string): string {
  switch (simName.toLowerCase()) {
    case 'ams2':
      return 'Automobilista 2';
    case 'acc':
      return 'Assetto Corsa Competizione';
    case 'iracing':
      return 'iRacing';
    default:
      return 'Automobilista 2';
  }
}
