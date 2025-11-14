#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { LabelStudioClient } from '../src/labeling/labelStudioClient';

dotenv.config();

const args = parseArgs(process.argv.slice(2));
const baseUrl = process.env.LABEL_STUDIO_URL ?? 'http://127.0.0.1:8080';
const token = process.env.LABEL_STUDIO_TOKEN;
if (!token) {
  console.error('LABEL_STUDIO_TOKEN not set.');
  process.exit(1);
}

const projectId = Number(args.project ?? process.env.LABEL_STUDIO_PROJECT_ID);
if (!projectId) {
  console.error('Project id required (--project or LABEL_STUDIO_PROJECT_ID).');
  process.exit(1);
}

const output = args.output ?? path.join('data', 'labeled', `project-${projectId}.json`);
const client = new LabelStudioClient({ baseUrl, token });

async function run() {
  const data = await client.exportAnnotations(projectId);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Exported ${data.length} tasks to ${output}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

function parseArgs(argv: string[]) {
  const result: Record<string, string | undefined> = {};
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
