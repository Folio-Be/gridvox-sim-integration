#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

interface CliArgs {
  [key: string]: string | undefined;
}

const args = parseArgs(process.argv.slice(2));
const captureDir = args.dir ?? args.session ?? findLatestCaptureDir();

if (!captureDir) {
  console.error('Usage: pnpm run verify-capture -- --dir data/captures/<session>');
  process.exit(1);
}

if (!fs.existsSync(captureDir)) {
  console.error(`Capture directory not found: ${captureDir}`);
  process.exit(1);
}

interface CaptureSummary {
  regionCounts: Record<string, number>;
  missingMetadata: string[];
  missingImages: string[];
  frameCount: number;
}

function verify(dir: string): CaptureSummary {
  const files = fs.readdirSync(dir);
  const pngFiles = files.filter((file) => file.toLowerCase().endsWith('.png')).sort();
  const jsonFiles = files.filter((file) => file.toLowerCase().endsWith('.png.json')).sort();
  const summary: CaptureSummary = { regionCounts: {}, missingMetadata: [], missingImages: [], frameCount: pngFiles.length };

  for (const png of pngFiles) {
    const metaPath = path.join(dir, `${png}.json`);
    if (!fs.existsSync(metaPath)) {
      summary.missingMetadata.push(png);
      continue;
    }
    try {
      const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      const region = metadata.captureRegion ?? 'unknown';
      summary.regionCounts[region] = (summary.regionCounts[region] ?? 0) + 1;
    } catch (err) {
      summary.missingMetadata.push(png);
      console.error(`Failed parsing metadata for ${png}: ${(err as Error).message}`);
    }
  }

  for (const json of jsonFiles) {
    const imageName = json.replace(/\.json$/i, '');
    if (!fs.existsSync(path.join(dir, imageName))) {
      summary.missingImages.push(imageName);
    }
  }

  return summary;
}

const summary = verify(captureDir);
console.log(`\nCapture verification for ${captureDir}`);
console.log(`Frames: ${summary.frameCount}`);
console.log('Region distribution:');
for (const [region, count] of Object.entries(summary.regionCounts)) {
  console.log(`  - ${region}: ${count}`);
}
if (summary.missingMetadata.length) {
  console.warn(`Missing metadata for ${summary.missingMetadata.length} frames`);
}
if (summary.missingImages.length) {
  console.warn(`Metadata without PNG for ${summary.missingImages.length} entries`);
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

function findLatestCaptureDir(): string | undefined {
  const root = path.join('data', 'captures');
  if (!fs.existsSync(root)) return undefined;
  return fs
    .readdirSync(root)
    .map((dir) => path.join(root, dir))
    .filter((dir) => fs.statSync(dir).isDirectory())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}
