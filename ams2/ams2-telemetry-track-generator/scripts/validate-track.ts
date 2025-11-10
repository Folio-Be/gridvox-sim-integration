#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

/**
 * Validate glTF track files for Three.js compatibility
 * 
 * Checks:
 * - Valid glTF 2.0 structure
 * - File size constraints
 * - Vertex count limits
 * - Material assignments
 * - Texture presence
 * - Three.js compatibility
 */

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    info: {
        fileSize: number;
        vertices: number;
        meshes: number;
        materials: number;
        textures: number;
    };
}

const program = new Command();

program
    .name('validate-track')
    .description('Validate glTF track files for Three.js compatibility')
    .option('-i, --input <path>', 'Input glTF/GLB file to validate')
    .option('-t, --track <name>', 'Track name (searches in converted-tracks/)')
    .option('--max-size <mb>', 'Maximum file size in MB', '50')
    .option('--max-vertices <count>', 'Maximum vertex count', '500000')
    .option('--test', 'Run validation tests on sample files')
    .parse(process.argv);

const options = program.opts();

async function main() {
    console.log(chalk.bold.blue('✅ glTF Track Validator\n'));

    if (options.test) {
        await runTests();
        return;
    }

    // Determine input file
    let inputPath: string;
    if (options.input) {
        inputPath = path.resolve(options.input);
    } else if (options.track) {
        inputPath = path.join(process.cwd(), 'converted-tracks', `${options.track}.glb`);
    } else {
        console.error(chalk.red('Error: Either --input or --track must be specified'));
        process.exit(1);
    }

    // Check file exists
    try {
        await fs.access(inputPath);
    } catch {
        console.error(chalk.red(`Error: File not found: ${inputPath}`));
        process.exit(1);
    }

    // Run validation
    const result = await validateTrack(inputPath);

    // Print results
    printValidationResult(result, inputPath);

    // Exit with appropriate code
    process.exit(result.valid ? 0 : 1);
}

async function validateTrack(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        info: {
            fileSize: 0,
            vertices: 0,
            meshes: 0,
            materials: 0,
            textures: 0,
        },
    };

    // 1. Check file size
    console.log(chalk.cyan('Checking file size...'));
    try {
        const stats = await fs.stat(filePath);
        result.info.fileSize = stats.size;

        const sizeMB = stats.size / (1024 * 1024);
        const maxSizeMB = parseInt(options.maxSize);

        if (sizeMB > maxSizeMB) {
            result.errors.push(`File size ${sizeMB.toFixed(2)} MB exceeds maximum ${maxSizeMB} MB`);
            result.valid = false;
        } else if (sizeMB > maxSizeMB * 0.8) {
            result.warnings.push(`File size ${sizeMB.toFixed(2)} MB is close to maximum ${maxSizeMB} MB`);
        } else {
            console.log(chalk.green(`  ✓ File size: ${sizeMB.toFixed(2)} MB`));
        }
    } catch (error) {
        result.errors.push(`Failed to read file: ${error.message}`);
        result.valid = false;
        return result;
    }

    // 2. Load and validate glTF structure
    console.log(chalk.cyan('Loading glTF...'));
    let document: Document;
    try {
        const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
        document = await io.read(filePath);
        console.log(chalk.green('  ✓ Valid glTF 2.0 structure'));
    } catch (error) {
        result.errors.push(`Invalid glTF file: ${error.message}`);
        result.valid = false;
        return result;
    }

    const root = document.getRoot();

    // 3. Check scenes
    console.log(chalk.cyan('Validating scenes...'));
    const scenes = root.listScenes();
    if (scenes.length === 0) {
        result.errors.push('No scenes found in glTF file');
        result.valid = false;
    } else if (scenes.length > 1) {
        result.warnings.push(`Multiple scenes found (${scenes.length}), only first will be used`);
    } else {
        console.log(chalk.green(`  ✓ Scene present`));
    }

    // 4. Check meshes
    console.log(chalk.cyan('Validating meshes...'));
    const meshes = root.listMeshes();
    result.info.meshes = meshes.length;

    if (meshes.length === 0) {
        result.errors.push('No meshes found in glTF file');
        result.valid = false;
    } else {
        console.log(chalk.green(`  ✓ ${meshes.length} mesh(es) found`));
    }

    // 5. Count vertices
    console.log(chalk.cyan('Counting vertices...'));
    let totalVertices = 0;

    meshes.forEach((mesh, meshIndex) => {
        mesh.listPrimitives().forEach((prim, primIndex) => {
            const position = prim.getAttribute('POSITION');
            if (position) {
                const count = position.getCount();
                totalVertices += count;

                // Check for position attribute
                if (count === 0) {
                    result.warnings.push(`Mesh ${meshIndex} primitive ${primIndex} has no vertices`);
                }
            } else {
                result.errors.push(`Mesh ${meshIndex} primitive ${primIndex} missing POSITION attribute`);
                result.valid = false;
            }

            // Check for normals
            if (!prim.getAttribute('NORMAL')) {
                result.warnings.push(`Mesh ${meshIndex} primitive ${primIndex} missing NORMAL attribute`);
            }
        });
    });

    result.info.vertices = totalVertices;
    const maxVertices = parseInt(options.maxVertices);

    if (totalVertices > maxVertices) {
        result.errors.push(`Vertex count ${totalVertices.toLocaleString()} exceeds maximum ${maxVertices.toLocaleString()}`);
        result.valid = false;
    } else if (totalVertices > maxVertices * 0.8) {
        result.warnings.push(`Vertex count ${totalVertices.toLocaleString()} is close to maximum`);
    } else {
        console.log(chalk.green(`  ✓ Vertex count: ${totalVertices.toLocaleString()}`));
    }

    // 6. Check materials
    console.log(chalk.cyan('Validating materials...'));
    const materials = root.listMaterials();
    result.info.materials = materials.length;

    if (materials.length === 0) {
        result.warnings.push('No materials found (meshes will use default material)');
    } else {
        console.log(chalk.green(`  ✓ ${materials.length} material(s) found`));

        // Check material properties
        materials.forEach((material, index) => {
            const baseColorTexture = material.getBaseColorTexture();
            const hasColor = material.getBaseColorFactor() !== null;

            if (!baseColorTexture && !hasColor) {
                result.warnings.push(`Material ${index} (${material.getName() || 'unnamed'}) has no color or texture`);
            }
        });
    }

    // 7. Check textures
    console.log(chalk.cyan('Validating textures...'));
    const textures = root.listTextures();
    result.info.textures = textures.length;

    if (textures.length > 0) {
        console.log(chalk.green(`  ✓ ${textures.length} texture(s) found`));

        textures.forEach((texture, index) => {
            const image = texture.getImage();
            const mimeType = texture.getMimeType();

            if (!image) {
                result.errors.push(`Texture ${index} missing image data`);
                result.valid = false;
            }

            if (!mimeType) {
                result.warnings.push(`Texture ${index} missing MIME type`);
            } else if (!['image/png', 'image/jpeg', 'image/webp', 'image/ktx2'].includes(mimeType)) {
                result.warnings.push(`Texture ${index} has unsupported MIME type: ${mimeType}`);
            }
        });
    } else {
        result.warnings.push('No textures found (track will appear untextured)');
    }

    // 8. Check for animations (should not be present for static tracks)
    console.log(chalk.cyan('Checking for animations...'));
    const animations = root.listAnimations();
    if (animations.length > 0) {
        result.warnings.push(`${animations.length} animation(s) found (not needed for static track)`);
    } else {
        console.log(chalk.green('  ✓ No animations (as expected)'));
    }

    // 9. Check extensions
    console.log(chalk.cyan('Checking extensions...'));
    const extensionsUsed = root.listExtensionsUsed().map(ext => ext.extensionName);
    const extensionsRequired = root.listExtensionsRequired().map(ext => ext.extensionName);

    if (extensionsRequired.length > 0) {
        console.log(chalk.yellow(`  Required extensions: ${extensionsRequired.join(', ')}`));

        // Check for supported extensions
        const unsupported = extensionsRequired.filter(ext =>
            !['KHR_draco_mesh_compression', 'KHR_materials_pbrSpecularGlossiness'].includes(ext)
        );

        if (unsupported.length > 0) {
            result.warnings.push(`Unsupported required extensions: ${unsupported.join(', ')}`);
        }
    } else {
        console.log(chalk.green('  ✓ No required extensions'));
    }

    return result;
}

function printValidationResult(result: ValidationResult, filePath: string): void {
    console.log(chalk.bold.cyan('\n' + '='.repeat(60)));
    console.log(chalk.bold.cyan('Validation Results'));
    console.log(chalk.bold.cyan('='.repeat(60) + '\n'));

    console.log(chalk.bold('File:'), path.basename(filePath));
    console.log(chalk.bold('Path:'), filePath);
    console.log();

    // Info
    console.log(chalk.bold('Statistics:'));
    console.log(`  File Size: ${(result.info.fileSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  Vertices: ${result.info.vertices.toLocaleString()}`);
    console.log(`  Meshes: ${result.info.meshes}`);
    console.log(`  Materials: ${result.info.materials}`);
    console.log(`  Textures: ${result.info.textures}`);
    console.log();

    // Errors
    if (result.errors.length > 0) {
        console.log(chalk.bold.red(`Errors (${result.errors.length}):`));
        result.errors.forEach(error => {
            console.log(chalk.red(`  ✗ ${error}`));
        });
        console.log();
    }

    // Warnings
    if (result.warnings.length > 0) {
        console.log(chalk.bold.yellow(`Warnings (${result.warnings.length}):`));
        result.warnings.forEach(warning => {
            console.log(chalk.yellow(`  ⚠ ${warning}`));
        });
        console.log();
    }

    // Final verdict
    if (result.valid) {
        if (result.warnings.length === 0) {
            console.log(chalk.bold.green('✅ VALIDATION PASSED - No issues found'));
        } else {
            console.log(chalk.bold.green('✅ VALIDATION PASSED - With warnings'));
        }
    } else {
        console.log(chalk.bold.red('❌ VALIDATION FAILED - Errors must be fixed'));
    }
}

async function runTests(): Promise<void> {
    console.log(chalk.yellow('🧪 Running validation tests...\n'));

    // List all files in converted-tracks directory
    const tracksDir = path.join(process.cwd(), 'converted-tracks');

    try {
        const files = await fs.readdir(tracksDir);
        const glbFiles = files.filter(f => f.endsWith('.glb') || f.endsWith('.gltf'));

        if (glbFiles.length === 0) {
            console.log(chalk.yellow('No track files found in converted-tracks/'));
            return;
        }

        console.log(chalk.cyan(`Found ${glbFiles.length} track file(s):\n`));

        const results: Array<{ file: string; valid: boolean }> = [];

        for (const file of glbFiles) {
            const filePath = path.join(tracksDir, file);
            console.log(chalk.bold(`\nValidating: ${file}`));
            console.log('-'.repeat(60));

            const result = await validateTrack(filePath);
            results.push({ file, valid: result.valid });

            if (result.valid) {
                console.log(chalk.green(`✓ ${file} - PASS`));
            } else {
                console.log(chalk.red(`✗ ${file} - FAIL`));
            }
        }

        // Summary
        console.log(chalk.bold.cyan('\n' + '='.repeat(60)));
        console.log(chalk.bold.cyan('Test Summary'));
        console.log(chalk.bold.cyan('='.repeat(60)));

        const passed = results.filter(r => r.valid).length;
        const failed = results.filter(r => !r.valid).length;

        console.log(`Total: ${results.length}`);
        console.log(chalk.green(`Passed: ${passed}`));
        console.log(chalk.red(`Failed: ${failed}`));

        if (failed === 0) {
            console.log(chalk.bold.green('\n✅ All tracks validated successfully!'));
        } else {
            console.log(chalk.bold.red('\n❌ Some tracks failed validation'));
        }
    } catch (error) {
        console.error(chalk.red(`Error reading tracks directory: ${error.message}`));
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(chalk.bold.red('\n❌ Error:'), error.message);
    if (error.stack) {
        console.error(chalk.gray(error.stack));
    }
    process.exit(1);
});
