/**
 * Patch obj2gltf to work with Node.js v24
 * Adds fallbacks for missing Cesium functions
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const obj2gltfDir = join(__dirname, '../node_modules/obj2gltf');

const cesiumFallbacks = `
// Fallbacks for missing Cesium functions (Node.js v24 compatibility)
const defaultValue = Cesium.defaultValue || ((a, b) => a !== undefined ? a : b);
const defined = Cesium.defined || ((value) => value !== undefined && value !== null);
const DeveloperError = Cesium.DeveloperError || class DeveloperError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DeveloperError';
  }
};
const clone = Cesium.clone || ((obj, deep = false) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (deep) return JSON.parse(JSON.stringify(obj));
  return { ...obj };
});
const combine = Cesium.combine || ((obj1, obj2, deep = false) => {
  const result = clone(obj1, deep);
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      result[key] = deep && typeof obj2[key] === 'object' ? clone(obj2[key], deep) : obj2[key];
    }
  }
  return result;
});
`.trim();

function patchFile(filePath) {
  let content = readFileSync(filePath, 'utf8');

  // Check if already patched
  if (content.includes('// Fallbacks for missing Cesium functions')) {
    console.log(`✓ Already patched: ${filePath}`);
    return false;
  }

  // Find the Cesium require/import
  const cesiumImportRegex = /const Cesium = require\(["']cesium["']\);/;
  const match = content.match(cesiumImportRegex);

  if (!match) {
    console.log(`  Skipped (no Cesium import): ${filePath}`);
    return false;
  }

  // Remove existing const declarations for Cesium functions
  content = content.replace(/^const defaultValue = Cesium\.defaultValue;?\s*$/gm, '');
  content = content.replace(/^const defined = Cesium\.defined;?\s*$/gm, '');
  content = content.replace(/^const DeveloperError = Cesium\.DeveloperError;?\s*$/gm, '');
  content = content.replace(/^const clone = Cesium\.clone;?\s*$/gm, '');
  content = content.replace(/^const combine = Cesium\.combine;?\s*$/gm, '');

  // Insert fallbacks after Cesium import
  const patchedContent = content.replace(
    cesiumImportRegex,
    match[0] + '\n' + cesiumFallbacks
  );

  writeFileSync(filePath, patchedContent, 'utf8');
  console.log(`✓ Patched: ${filePath}`);
  return true;
}

function findJsFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && entry !== 'node_modules') {
      findJsFiles(fullPath, files);
    } else if (stat.isFile() && entry.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

console.log('Patching obj2gltf for Node.js v24 compatibility...\n');

const jsFiles = findJsFiles(obj2gltfDir);
let patchedCount = 0;

for (const file of jsFiles) {
  if (patchFile(file)) {
    patchedCount++;
  }
}

console.log(`\nPatched ${patchedCount} files successfully!`);
