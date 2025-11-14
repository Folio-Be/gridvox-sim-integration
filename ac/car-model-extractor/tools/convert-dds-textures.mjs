#!/usr/bin/env node
/**
 * Convert DDS textures to PNG for obj2gltf compatibility
 * Assetto Corsa uses DirectDraw Surface (.dds) textures which obj2gltf can't read
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename, dirname, extname } from 'path';
import parseDDS from 'parse-dds';
import pngjsPkg from 'pngjs';

const { PNG } = pngjsPkg;

/**
 * Convert single DDS file to PNG
 */
function convertDDStoPNG(ddsPath, pngPath) {
  try {
    const ddsBuffer = readFileSync(ddsPath);
    const ddsData = parseDDS(ddsBuffer);

    // Create PNG from DDS data
    const png = new PNG({
      width: ddsData.width,
      height: ddsData.height
    });

    // Copy image data (DDS uses RGBA or RGB formats)
    const imageData = ddsData.images[0].data; // Use first mipmap level

    // DDS data might be in different formats, handle RGBA
    if (imageData.length === ddsData.width * ddsData.height * 4) {
      // RGBA format
      png.data = Buffer.from(imageData);
    } else if (imageData.length === ddsData.width * ddsData.height * 3) {
      // RGB format - convert to RGBA
      for (let i = 0; i < ddsData.width * ddsData.height; i++) {
        const srcIdx = i * 3;
        const dstIdx = i * 4;
        png.data[dstIdx + 0] = imageData[srcIdx + 0]; // R
        png.data[dstIdx + 1] = imageData[srcIdx + 1]; // G
        png.data[dstIdx + 2] = imageData[srcIdx + 2]; // B
        png.data[dstIdx + 3] = 255; // Alpha = opaque
      }
    } else {
      throw new Error(`Unsupported DDS format: ${imageData.length} bytes for ${ddsData.width}x${ddsData.height}`);
    }

    // Write PNG
    const buffer = PNG.sync.write(png);
    writeFileSync(pngPath, buffer);

    return { success: true, width: ddsData.width, height: ddsData.height };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Convert all DDS textures in a directory to PNG
 */
function convertTextureDirectory(textureDir) {
  if (!existsSync(textureDir)) {
    console.log(`Texture directory not found: ${textureDir}`);
    return { converted: 0, failed: 0 };
  }

  const files = readdirSync(textureDir);
  const ddsFiles = files.filter(f => f.toLowerCase().endsWith('.dds'));

  console.log(`Found ${ddsFiles.length} DDS textures in ${textureDir}`);

  let converted = 0;
  let failed = 0;

  for (const ddsFile of ddsFiles) {
    const ddsPath = join(textureDir, ddsFile);
    const pngFile = basename(ddsFile, extname(ddsFile)) + '.png';
    const pngPath = join(textureDir, pngFile);

    // Skip if PNG already exists
    if (existsSync(pngPath)) {
      console.log(`  ✓ Already converted: ${pngFile}`);
      converted++;
      continue;
    }

    process.stdout.write(`  Converting ${ddsFile}...`);
    const result = convertDDStoPNG(ddsPath, pngPath);

    if (result.success) {
      console.log(` ✓ ${result.width}x${result.height}`);
      converted++;
    } else {
      console.log(` ✗ ${result.error}`);
      failed++;
    }
  }

  return { converted, failed, total: ddsFiles.length };
}

/**
 * Update MTL file to reference PNG instead of DDS
 */
function updateMTLFile(mtlPath) {
  if (!existsSync(mtlPath)) {
    return false;
  }

  let content = readFileSync(mtlPath, 'utf8');
  const originalContent = content;

  // Replace .dds/.DDS with .png in texture map references
  content = content.replace(/\.dds(\s|$)/gi, '.png$1');
  content = content.replace(/\.DDS(\s|$)/g, '.png$1');

  if (content !== originalContent) {
    writeFileSync(mtlPath, content, 'utf8');
    console.log(`✓ Updated MTL file: ${basename(mtlPath)}`);
    return true;
  }

  return false;
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
Usage: node convert-dds-textures.mjs <obj-directory>

Converts DDS textures to PNG and updates MTL file references.

Example:
  node convert-dds-textures.mjs "C:/path/to/car/output"
`);
    process.exit(1);
  }

  const objDir = args[0];
  const textureDir = join(objDir, 'texture');
  const mtlFiles = readdirSync(objDir).filter(f => f.endsWith('.mtl'));

  console.log('\n=== DDS to PNG Texture Converter ===\n');

  // Convert textures
  const result = convertTextureDirectory(textureDir);

  console.log(`\nConversion summary:`);
  console.log(`  Converted: ${result.converted}/${result.total}`);
  if (result.failed > 0) {
    console.log(`  Failed: ${result.failed}`);
  }

  // Update MTL files
  if (mtlFiles.length > 0) {
    console.log(`\nUpdating MTL files...`);
    for (const mtlFile of mtlFiles) {
      updateMTLFile(join(objDir, mtlFile));
    }
  }

  console.log('\n✓ Texture conversion complete!\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertDDStoPNG, convertTextureDirectory, updateMTLFile };
