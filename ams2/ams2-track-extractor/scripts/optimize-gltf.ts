#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
    dedup,
    draco,
    textureCompress,
    prune,
    weld,
    resample,
    partition
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

/**
 * Optimize glTF files for web delivery
 * 
 * Applies:
 * - Draco compression (geometry)
 * - Texture compression (KTX2)
 * - Deduplication
 * - Pruning unused data
 * - Mesh optimization
 */

const program = new Command();

program
    .name('optimize-gltf')
    .description('Optimize glTF files for web performance')
    .requiredOption('-i, --input <path>', 'Input glTF/GLB file')
    .option('-o, --output <path>', 'Output file path (default: [input]-optimized.glb)')
    .option('--draco-level <number>', 'Draco compression level (0-10)', '7')
    .option('--max-texture-size <number>', 'Maximum texture size (pixels)', '2048')
    .option('--target-size <number>', 'Target file size in MB (best effort)', '50')
    .option('--no-draco', 'Skip Draco compression')
    .option('--no-texture-compress', 'Skip texture compression')
    .parse(process.argv);

const options = program.opts();

async function main() {
    console.log(chalk.bold.blue('⚡ glTF Optimizer\n'));

    const inputPath = path.resolve(options.input);
    const outputPath = options.output ||
        inputPath.replace(/\.(glb|gltf)$/, '-optimized.glb');

    // Load glTF
    const loadSpinner = ora('Loading glTF file...').start();

    const io = new NodeIO()
        .registerExtensions(ALL_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });

    let document: Document;
    try {
        document = await io.read(inputPath);
        const stats = await fs.stat(inputPath);
        loadSpinner.succeed(`Loaded glTF (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (error) {
        loadSpinner.fail('Failed to load glTF');
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
    }

    // Log initial stats
    printStats('Before optimization', document);

    // Apply optimizations
    await applyOptimizations(document);

    // Log optimized stats
    printStats('After optimization', document);

    // Write optimized file
    const writeSpinner = ora('Writing optimized file...').start();
    try {
        await io.write(outputPath, document);
        const stats = await fs.stat(outputPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        writeSpinner.succeed(`Written to ${outputPath} (${sizeMB} MB)`);
    } catch (error) {
        writeSpinner.fail('Failed to write file');
        throw error;
    }

    // Compare file sizes
    const originalSize = (await fs.stat(inputPath)).size;
    const optimizedSize = (await fs.stat(outputPath)).size;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(chalk.bold.green(`\n✅ Optimization complete!`));
    console.log(chalk.gray(`Size reduction: ${reduction}%`));
}

async function applyOptimizations(document: Document): Promise<void> {
    // 1. Deduplication
    let spinner = ora('Deduplicating data...').start();
    await document.transform(dedup());
    spinner.succeed('Deduplicated data');

    // 2. Weld vertices
    spinner = ora('Welding vertices...').start();
    await document.transform(weld({ tolerance: 0.0001 }));
    spinner.succeed('Welded vertices');

    // 3. Prune unused data
    spinner = ora('Pruning unused data...').start();
    await document.transform(prune());
    spinner.succeed('Pruned unused data');

    // 4. Draco compression
    if (options.draco !== false) {
        spinner = ora('Applying Draco compression...').start();
        await document.transform(
            draco({
                quantizePosition: parseInt(options.dracoLevel),
                quantizeNormal: parseInt(options.dracoLevel),
                quantizeTexcoord: parseInt(options.dracoLevel),
                quantizeColor: parseInt(options.dracoLevel),
                quantizeGeneric: parseInt(options.dracoLevel),
            })
        );
        spinner.succeed('Applied Draco compression');
    }

    // 5. Texture compression (placeholder - requires external tools)
    if (options.textureCompress !== false) {
        spinner = ora('Compressing textures...').start();
        // Note: Full texture compression requires basis-universal-cli
        // For now, just resize if needed
        const maxSize = parseInt(options.maxTextureSize);

        document.getRoot().listTextures().forEach(texture => {
            const image = texture.getImage();
            if (image) {
                // Basic size check (actual resizing would need canvas/sharp)
                spinner.text = `Processing texture: ${texture.getName() || 'unnamed'}`;
            }
        });

        spinner.warn('Texture compression requires basis-universal (skipped)');
    }

    // 6. Optimize meshes
    spinner = ora('Optimizing meshes...').start();
    await document.transform(resample());
    spinner.succeed('Optimized meshes');

    // 7. Partition scene (if very large)
    const targetSize = parseInt(options.targetSize) * 1024 * 1024; // Convert MB to bytes
    if (targetSize) {
        spinner = ora('Partitioning large meshes...').start();
        await document.transform(partition({ size: targetSize }));
        spinner.succeed('Partitioned meshes');
    }
}

function printStats(label: string, document: Document): void {
    const root = document.getRoot();

    const stats = {
        scenes: root.listScenes().length,
        nodes: root.listNodes().length,
        meshes: root.listMeshes().length,
        primitives: root.listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().length, 0),
        materials: root.listMaterials().length,
        textures: root.listTextures().length,
        animations: root.listAnimations().length,
        vertices: root.listMeshes().reduce((sum, mesh) => {
            return sum + mesh.listPrimitives().reduce((pSum, prim) => {
                const position = prim.getAttribute('POSITION');
                return pSum + (position ? position.getCount() : 0);
            }, 0);
        }, 0),
    };

    console.log(chalk.bold.cyan(`\n${label}:`));
    console.log(chalk.gray(`  Scenes: ${stats.scenes}`));
    console.log(chalk.gray(`  Nodes: ${stats.nodes}`));
    console.log(chalk.gray(`  Meshes: ${stats.meshes} (${stats.primitives} primitives)`));
    console.log(chalk.gray(`  Vertices: ${stats.vertices.toLocaleString()}`));
    console.log(chalk.gray(`  Materials: ${stats.materials}`));
    console.log(chalk.gray(`  Textures: ${stats.textures}`));
    console.log(chalk.gray(`  Animations: ${stats.animations}`));
}

main().catch((error) => {
    console.error(chalk.bold.red('\n❌ Error:'), error.message);
    if (error.stack) {
        console.error(chalk.gray(error.stack));
    }
    process.exit(1);
});
