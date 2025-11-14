#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

const args = parseArgs(process.argv.slice(2));
const inputFile = args.input ?? path.join('data', 'labeled', 'dataset.json');
const outputDir = args.output ?? path.join('data', 'export', 'yolo');
const labelMap = new Map<string, number>();

if (!fs.existsSync(inputFile)) {
  console.error(`Dataset ${inputFile} not found.`);
  process.exit(1);
}

const dataset = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
fs.mkdirSync(outputDir, { recursive: true });

dataset.forEach((task: any) => {
  const annotations = task.annotations ?? task.predictions ?? [];
  if (annotations.length === 0) return;
  const results = annotations[0].result ?? [];
  const imagePath = task.data?.image ?? '';
  const width = task.data?.metadata?.resolution?.[0] ?? results[0]?.original_width;
  const height = task.data?.metadata?.resolution?.[1] ?? results[0]?.original_height;
  if (!width || !height) return;

  const labelFile = path.join(outputDir, `${path.basename(imagePath, path.extname(imagePath))}.txt`);
  const lines: string[] = [];
  for (const result of results) {
    const labels: string[] = result.value?.rectanglelabels ?? [];
    if (labels.length === 0) continue;
    const label = labels[0];
    if (!labelMap.has(label)) {
      labelMap.set(label, labelMap.size);
    }
    const classId = labelMap.get(label) ?? 0;
    const { x, y, width: boxWidth, height: boxHeight } = result.value || {};
    const cx = (Number(x) + Number(boxWidth) / 2) / 100;
    const cy = (Number(y) + Number(boxHeight) / 2) / 100;
    const w = Number(boxWidth) / 100;
    const h = Number(boxHeight) / 100;
    lines.push(`${classId} ${cx} ${cy} ${w} ${h}`);
  }
  if (lines.length > 0) {
    fs.writeFileSync(labelFile, lines.join('\n'), 'utf-8');
  }
});

const labelsFile = path.join(outputDir, 'labels.txt');
fs.writeFileSync(
  labelsFile,
  Array.from(labelMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([label]) => label)
    .join('\n'),
  'utf-8',
);

console.log(`YOLO export complete. Files in ${outputDir}`);

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
