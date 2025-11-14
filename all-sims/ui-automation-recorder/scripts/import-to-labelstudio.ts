#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { LabelStudioClient } from '../src/labeling/labelStudioClient';

dotenv.config();

interface CliArgs {
  [key: string]: string | undefined;
}

const args = parseArgs(process.argv.slice(2));
const sim = args.sim ?? 'ams2';
const capturesDir = args.captures ?? findLatestCaptureDir() ?? '';

if (!capturesDir) {
  console.error('No captures directory provided and none found.');
  process.exit(1);
}

const baseUrl = process.env.LABEL_STUDIO_URL ?? 'http://127.0.0.1:8080';
const token = process.env.LABEL_STUDIO_TOKEN;
if (!token) {
  console.error('LABEL_STUDIO_TOKEN not set.');
  process.exit(1);
}

const labelConfig =
  process.env.LABEL_STUDIO_CONFIG ??
  `<View><Image name="img" value="$image"/><RectangleLabels name="tag" toName="img"><Label value="element"/></RectangleLabels></View>`;

const client = new LabelStudioClient({ baseUrl, token });
const projectName = args.project ?? `SimVox - ${sim.toUpperCase()} - ${path.basename(capturesDir)}`;

async function run() {
  const projectId = await client.ensureProject(projectName, labelConfig);
  const tasks = loadTasks(capturesDir);
  console.log(`Importing ${tasks.length} tasks to project ${projectName}...`);
  await client.importTasks(projectId, tasks);
  console.log('Import complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

function loadTasks(dir: string): any[] {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.png.json'));
  return files.map((metaFile) => {
    const metadata = JSON.parse(fs.readFileSync(path.join(dir, metaFile), 'utf-8'));
    const imageFile = metaFile.replace('.json', '');
    return {
      data: {
        image: path.resolve(dir, imageFile),
        metadata,
      },
    };
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
      }
    }
  }
  return result;
}

function findLatestCaptureDir(): string | undefined {
  const parent = path.join('data', 'captures');
  if (!fs.existsSync(parent)) return undefined;
  const dirs = fs
    .readdirSync(parent)
    .map((dir) => path.join(parent, dir))
    .filter((dir) => fs.statSync(dir).isDirectory())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return dirs[0];
}
