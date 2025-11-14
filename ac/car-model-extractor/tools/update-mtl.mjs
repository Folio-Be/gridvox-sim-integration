#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node update-mtl.mjs <mtl-file>');
  process.exit(1);
}

const mtlPath = args[0];
let content = readFileSync(mtlPath, 'utf8');
const originalContent = content;

// Replace .dds/.DDS with .png
content = content.replace(/\.dds(\s|$)/gi, '.png$1');
content = content.replace(/\.DDS(\s|$)/g, '.png$1');

if (content !== originalContent) {
  writeFileSync(mtlPath, content, 'utf8');
  console.log('✓ Updated MTL file:', mtlPath);
  console.log('  Replaced .dds with .png');
} else {
  console.log('ℹ No changes needed');
}
