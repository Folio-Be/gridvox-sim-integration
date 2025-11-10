#!/usr/bin/env tsx

/**
 * Extract AMS2 track geometry using PCarsTools + MEB Parser
 * 
 * Workflow:
 * 1. Extract TOC file to get list of BFF archives
 * 2. Find track-specific BFF archives
 * 3. Extract .meb mesh files from BFFs
 * 4. Decrypt .meb files with PCarsTools
 * 5. Parse decrypted .meb files  
 * 6. Convert to glTF format
 * 
 * Usage:
 *   npm run extract -- --track silverstone
 *   npm run extract -- --list-tracks
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { MebParser } from '../src/parsers/MebParser.js';
import { MebToGltfConverter } from '../src/converters/MebToGltfConverter.js';
import { NodeIO } from '@gltf-transform/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const PCARSTOOLS_DIR = path.join(PROJECT_ROOT, 'tools', 'PCarsTools');
const PCARSTOOLS_EXE = path.join(PCARSTOOLS_DIR, 'pcarstools_x64.exe');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'extracted-tracks');
const TEMP_DIR = path.join(PROJECT_ROOT, '.temp-extraction');

// Common AMS2 installation paths
const COMMON_AMS2_PATHS = [
    'C:\\GAMES\\Automobilista 2',
    'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Automobilista 2',
    'D:\\SteamLibrary\\steamapps\\common\\Automobilista 2',
    'E:\\SteamLibrary\\steamapps\\common\\Automobilista 2',
];

/**
 * Find AMS2 installation directory
 */
function findAMS2Installation(): string | null {
    const providedPath = process.env.AMS2_PATH;
    if (providedPath && fs.existsSync(providedPath)) {
        return providedPath;
    }

    for (const gamePath of COMMON_AMS2_PATHS) {
        if (fs.existsSync(gamePath)) {
            const tracksPath = path.join(gamePath, 'Tracks');
            if (fs.existsSync(tracksPath)) {
                return gamePath;
            }
        }
    }

    return null;
}

/**
 * List available tracks in AMS2 installation
 */
function listAvailableTracks(ams2Path: string): string[] {
    const tracksPath = path.join(ams2Path, 'Tracks');

    if (!fs.existsSync(tracksPath)) {
        console.error(chalk.red(`✗ Tracks directory not found: ${tracksPath}`));
        return [];
    }

    const tracks: string[] = [];

    try {
        const dirs = fs.readdirSync(tracksPath, { withFileTypes: true });

        for (const dir of dirs) {
            if (dir.isDirectory() && !dir.name.startsWith('_')) {
                const trackDir = path.join(tracksPath, dir.name);
                const files = fs.readdirSync(trackDir);
                const hasTrd = files.some(f => f.endsWith('.trd'));

                if (hasTrd) {
                    tracks.push(dir.name);
                }
            }
        }
    } catch (error) {
        console.error(chalk.red(`✗ Error reading tracks directory: ${error}`));
    }

    return tracks.sort();
}

/**
 * Execute PCarsTools command
 */
function executePCarsTools(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const child = spawn(PCARSTOOLS_EXE, args, {
            cwd: PCARSTOOLS_DIR,
            stdio: 'pipe',
        });

        let stdout = '';
        let stderr = '';

        child.stdout?.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`PCarsTools exited with code ${code}\n${stderr}`));
            } else {
                resolve({ stdout, stderr });
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Extract TOC file to find all BFF archives
 */
async function extractTOC(ams2Path: string, spinner: Ora): Promise<string[]> {
    spinner.text = 'Extracting TOC file...';

    const tocPath = path.join(ams2Path, 'TOCFiles', 'DirPaks.toc');
    if (!fs.existsSync(tocPath)) {
        throw new Error(`TOC file not found: ${tocPath}`);
    }

    const tempTocDir = path.join(TEMP_DIR, 'toc-extraction');
    fs.mkdirSync(tempTocDir, { recursive: true });

    try {
        const { stdout } = await executePCarsTools([
            'toc',
            '-i', tocPath,
            '-g', ams2Path,
            '-o', tempTocDir,
        ]);

        // Parse output to find BFF archive names
        const bffMatches = stdout.match(/- (.+\.bff)/gi) || [];
        const bffFiles = bffMatches.map(m => m.replace(/^- /, ''));

        spinner.succeed(`Found ${bffFiles.length} BFF archives`);
        return bffFiles;
    } catch (error) {
        spinner.fail('TOC extraction failed');
        throw error;
    }
}

/**
 * Find .meb files recursively in a directory
 */
function findMebFiles(dir: string): string[] {
    const mebFiles: string[] = [];

    function search(currentDir: string) {
        if (!fs.existsSync(currentDir)) return;

        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                search(fullPath);
            } else if (entry.name.toLowerCase().endsWith('.meb')) {
                mebFiles.push(fullPath);
            }
        }
    }

    search(dir);
    return mebFiles;
}

/**
 * Decrypt a .meb file using PCarsTools
 */
async function decryptMeb(mebPath: string, spinner: Ora): Promise<void> {
    spinner.text = `Decrypting ${path.basename(mebPath)}...`;

    try {
        await executePCarsTools([
            'decryptmodel',
            '-i', mebPath,
        ]);

        spinner.succeed(`Decrypted ${path.basename(mebPath)}`);
    } catch (error) {
        spinner.warn(`Could not decrypt ${path.basename(mebPath)}: ${error}`);
    }
}

/**
 * Extract track geometry
 */
async function extractTrack(trackName: string, ams2Path: string, outputPath: string) {
    console.log(chalk.blue('\n🎯 AMS2 Track Extractor\n'));

    // Create temp and output directories
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    fs.mkdirSync(outputPath, { recursive: true });

    const spinner = ora('Initializing extraction...').start();

    try {
        // Step 1: List available tracks
        spinner.text = 'Searching for track...';
        const tracks = listAvailableTracks(ams2Path);
        const matchedTrack = tracks.find(t =>
            t.toLowerCase().includes(trackName.toLowerCase())
        );

        if (!matchedTrack) {
            spinner.fail(`Track not found: ${trackName}`);
            console.log(chalk.yellow('\nAvailable tracks:'));
            tracks.slice(0, 10).forEach(t => console.log(`  - ${t}`));
            if (tracks.length > 10) {
                console.log(chalk.gray(`  ... and ${tracks.length - 10} more`));
            }
            return;
        }

        spinner.succeed(`Found track: ${matchedTrack}`);

        // Step 2: Search for track-specific .meb files in BFF archives
        console.log(chalk.blue('\n📦 Searching for track geometry...'));
        spinner.start('Scanning Pakfiles directory...'); const pakfilesDir = path.join(ams2Path, 'Pakfiles');
        const trackSearchTerms = [
            matchedTrack.toLowerCase(),
            matchedTrack.toLowerCase().replace(/_/g, ''),
            matchedTrack.toLowerCase().split('_')[0],
        ];

        // Look for track-related BFF files
        const bffFiles = fs.readdirSync(pakfilesDir)
            .filter(f => f.toLowerCase().endsWith('.bff'));

        let foundMebFiles: string[] = [];

        for (const bffFile of bffFiles) {
            // Check if BFF might contain track data
            const bffLower = bffFile.toLowerCase();
            const isTrackRelated = trackSearchTerms.some(term => bffLower.includes(term)) ||
                bffLower.includes('track') ||
                bffLower.includes('venue');

            if (!isTrackRelated) continue;

            spinner.text = `Extracting ${bffFile}...`;

            const bffPath = path.join(pakfilesDir, bffFile);
            const extractDir = path.join(TEMP_DIR, 'bff-extractions', path.basename(bffFile, '.bff'));

            try {
                await executePCarsTools([
                    'pak',
                    '-i', bffPath,
                    '-g', ams2Path,
                    '-o', extractDir,
                ]);

                // Search extracted files for .meb
                const mebFiles = findMebFiles(extractDir);
                if (mebFiles.length > 0) {
                    foundMebFiles.push(...mebFiles);
                    spinner.succeed(`Found ${mebFiles.length} mesh files in ${bffFile}`);
                }
            } catch (error) {
                spinner.warn(`Could not extract ${bffFile}`);
            }
        }

        if (foundMebFiles.length === 0) {
            spinner.fail('No mesh files found for this track');
            console.log(chalk.yellow('\n💡 Tip: Track geometry might be in a generic BFF archive'));
            return;
        }

        spinner.succeed(`Found ${foundMebFiles.length} total mesh files`);

        // Step 4: Decrypt .meb files
        console.log(chalk.blue('\n🔓 Decrypting mesh files...'));
        for (const mebFile of foundMebFiles) {
            await decryptMeb(mebFile, spinner);
        }

        // Step 5: Parse .meb files and convert to glTF
        console.log(chalk.blue('\n🎨 Converting to glTF...'));

        const meshes: any[] = [];

        for (const mebFile of foundMebFiles) {
            try {
                spinner.text = `Parsing ${path.basename(mebFile)}...`;

                const meshData = MebParser.parseFile(mebFile);
                meshes.push({
                    name: meshData.name,
                    data: meshData,
                    sourcePath: mebFile,
                });

                spinner.succeed(`Parsed ${meshData.name} (${meshData.vertexCount} vertices)`);
            } catch (error) {
                spinner.warn(`Could not parse ${path.basename(mebFile)}: ${error}`);
            }
        }

        if (meshes.length === 0) {
            spinner.fail('No meshes could be parsed');
            return;
        }

        // Step 6: Export to glTF
        spinner.start('Exporting to glTF...');

        const io = new NodeIO();

        for (const mesh of meshes) {
            const converter = new MebToGltfConverter();
            const document = converter.convert(mesh.data, {
                convertCoordinates: true,
                flipUVs: true,
                meshName: mesh.name,
            });

            const outputFile = path.join(outputPath, `${mesh.name}.glb`);
            await io.write(outputFile, document);

            spinner.succeed(`Exported ${mesh.name}.glb`);
        }

        // Cleanup temp directory
        spinner.start('Cleaning up...');
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        spinner.succeed('Cleanup complete');

        console.log(chalk.green(`\n✅ Extraction complete!`));
        console.log(chalk.gray(`Output: ${outputPath}`));
        console.log(chalk.gray(`Meshes: ${meshes.length}`));

    } catch (error) {
        spinner.fail('Extraction failed');
        console.error(chalk.red(`\n❌ Error: ${error}`));
        throw error;
    }
}

// CLI
program
    .name('extract-track')
    .description('Extract AMS2 track geometry using PCarsTools')
    .version('1.0.0');

program
    .option('--track <name>', 'Track name to extract (e.g., "silverstone")')
    .option('--ams2-path <path>', 'Path to AMS2 installation')
    .option('--output <path>', 'Output directory for extracted files')
    .option('--list-tracks', 'List all available tracks')
    .action(async (options) => {
        // Find AMS2 installation
        const ams2Path = options.ams2Path || findAMS2Installation();

        if (!ams2Path) {
            console.error(chalk.red('✗ AMS2 installation not found'));
            console.log(chalk.yellow('\nTried paths:'));
            COMMON_AMS2_PATHS.forEach(p => console.log(`  - ${p}`));
            console.log(chalk.gray('\nSet AMS2_PATH environment variable or use --ams2-path option'));
            process.exit(1);
        }

        console.log(chalk.green(`✓ Found AMS2: ${ams2Path}`));

        // List tracks
        if (options.listTracks) {
            console.log(chalk.blue('\n📋 Available Tracks:\n'));
            const tracks = listAvailableTracks(ams2Path);
            tracks.forEach(track => console.log(`  - ${track}`));
            console.log(chalk.gray(`\nTotal: ${tracks.length} tracks`));
            return;
        }

        // Extract track
        if (!options.track) {
            console.error(chalk.red('✗ Please specify a track name with --track'));
            console.log(chalk.gray('Use --list-tracks to see available tracks'));
            process.exit(1);
        }

        const trackName = options.track;
        const outputPath = options.output || path.join(OUTPUT_DIR, trackName);

        await extractTrack(trackName, ams2Path, outputPath);
    });

program.parse();
