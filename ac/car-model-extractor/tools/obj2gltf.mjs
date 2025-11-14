#!/usr/bin/env node
/**
 * Custom OBJ to GLTF converter using three.js
 * Compatible with Node.js v24
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

// three.js imports
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Convert OBJ file to GLTF/GLB
 */
async function convertObjToGltf(inputPath, outputPath, options = {}) {
  const {
    binary = true,
    onlyVisible = true,
    embedImages = true,
    maxTextureSize = 4096
  } = options;

  console.log(`Loading OBJ: ${inputPath}`);

  // Read OBJ file
  const objData = readFileSync(inputPath, 'utf8');
  const objDir = dirname(inputPath);
  const objName = basename(inputPath, extname(inputPath));

  // Load OBJ (skip materials for now - textures need special handling in Node.js)
  const objLoader = new OBJLoader();
  const object = objLoader.parse(objData);
  console.log(`Loaded OBJ with ${object.children.length} meshes`);

  // Count triangles
  let triangleCount = 0;
  object.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const positions = child.geometry.attributes.position;
      if (positions) {
        triangleCount += positions.count / 3;
      }
    }
  });
  console.log(`Total triangles: ${Math.floor(triangleCount)}`);

  // Export to GLTF
  console.log(`Exporting to ${binary ? 'GLB' : 'GLTF'}...`);

  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      object,
      (result) => {
        if (binary) {
          // GLB format (binary)
          const buffer = Buffer.from(result);
          writeFileSync(outputPath, buffer);
          console.log(`✓ Exported GLB: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
        } else {
          // GLTF format (JSON)
          const json = JSON.stringify(result, null, 2);
          writeFileSync(outputPath, json);
          console.log(`✓ Exported GLTF: ${outputPath}`);
        }
        resolve({ success: true, outputPath });
      },
      (error) => {
        console.error('Export failed:', error);
        reject(error);
      },
      {
        binary,
        onlyVisible,
        embedImages,
        maxTextureSize
      }
    );
  });
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: node obj2gltf.mjs <input.obj> <output.glb> [options]

Options:
  --gltf              Output GLTF JSON instead of binary GLB
  --max-texture SIZE  Maximum texture size (default: 4096)

Example:
  node obj2gltf.mjs model.obj model.glb
  node obj2gltf.mjs model.obj model.gltf --gltf
`);
    process.exit(1);
  }

  const inputPath = resolve(args[0]);
  const outputPath = resolve(args[1]);

  const options = {
    binary: !args.includes('--gltf'),
    embedImages: true,
    onlyVisible: true,
    maxTextureSize: 4096
  };

  const maxTexIdx = args.indexOf('--max-texture');
  if (maxTexIdx !== -1 && args[maxTexIdx + 1]) {
    options.maxTextureSize = parseInt(args[maxTexIdx + 1], 10);
  }

  try {
    await convertObjToGltf(inputPath, outputPath, options);
    process.exit(0);
  } catch (error) {
    console.error('Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertObjToGltf };
