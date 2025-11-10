#!/usr/bin/env tsx

/**
 * Extract AMS2 track using PCarsTools
 * 
 * Usage:
 *   npm run extract -- --track "Silverstone International"
 *   npm run extract -- --track silverstone --format gltf
 *   npm run extract -- --list-tracks
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const PCARSTOOLS_DIR = path.join(PROJECT_ROOT, 'tools', 'PCarsTools');
const PCARSTOOLS_EXE = path.join(PCARSTOOLS_DIR, 'pcarstools_x64.exe');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'extracted-tracks');

// Common AMS2 installation paths
const COMMON_AMS2_PATHS = [
    'C:\\GAMES\\Automobilista 2',
    'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Automobilista 2',
    'D:\\SteamLibrary\\steamapps\\common\\Automobilista 2',
    'E:\\SteamLibrary\\steamapps\\common\\Automobilista 2',
];

interface ExtractionOptions {
    track: string;
    ams2Path?: string;
    output?: string;
    format: 'gltf' | 'obj' | 'dae' | 'fbx';
    listTracks?: boolean;
}

/**
 * Find AMS2 installation directory
 */
function findAMS2Installation(): string | null {
    // Check if user provided path
    const providedPath = process.env.AMS2_PATH;
    if (providedPath && fs.existsSync(providedPath)) {
        return providedPath;
    }

    // Try common installation paths
    for (const gamePath of COMMON_AMS2_PATHS) {
        if (fs.existsSync(gamePath)) {
            const tracksPath = path.join(gamePath, 'Vehicles');
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
                // Check if directory contains a .trd file
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
 * Find track TRD file
 */
function findTrackFile(ams2Path: string, trackName: string): string | null {
    const tracksPath = path.join(ams2Path, 'Tracks');

    // Try exact match first
    const exactDir = path.join(tracksPath, trackName);
    if (fs.existsSync(exactDir)) {
        const trdFile = path.join(exactDir, `${trackName}.trd`);
        if (fs.existsSync(trdFile)) {
            return trdFile;
        }
        // Check for any .trd file in the directory
        const files = fs.readdirSync(exactDir);
        const trd = files.find(f => f.endsWith('.trd'));
        if (trd) {
            return path.join(exactDir, trd);
        }
    }

    // Try case-insensitive search
    try {
        const dirs = fs.readdirSync(tracksPath, { withFileTypes: true });
        const match = dirs.find(d =>
            d.isDirectory() && d.name.toLowerCase() === trackName.toLowerCase()
        );

        if (match) {
            const trackDir = path.join(tracksPath, match.name);
            const files = fs.readdirSync(trackDir);
            const trd = files.find(f => f.endsWith('.trd'));
            if (trd) {
                return path.join(trackDir, trd);
            }
        }
    } catch (error) {
        console.error(chalk.red(`✗ Error searching for track: ${error}`));
    }

    return null;
}

/**
 * Execute PCarsTools extraction
 */
async function executePCarsTools(
    bffPath: string,
    outputDir: string,
    ams2Path: string,
    format: string
): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // PCarsTools command: pcarstools_x64.exe pak -i <bffPath> -g <gameDir> -o <outputDir>
        const args = ['pak', '-i', bffPath, '-g', ams2Path, '-o', outputDir];

        let stdout = '';
        let stderr = '';

        const child = spawn(PCARSTOOLS_EXE, args, {
            cwd: PCARSTOOLS_DIR,
            env: { ...process.env },
        });

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            // Show progress
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    console.log(chalk.gray(`  ${line.trim()}`));
                }
            }
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('error', (error) => {
            resolve({
                success: false,
                error: `Failed to spawn PCarsTools: ${error.message}`,
            });
        });

        child.on('close', (exitCode) => {
            if (exitCode === 0) {
                resolve({ success: true });
            } else {
                resolve({
                    success: false,
                    error: `PCarsTools exited with code ${exitCode}\n${stderr}`,
                });
            }
        });
    });
}

/**
 * Find extracted geometry files
 */
function findGeometryFiles(extractedDir: string): string[] {
    const geometryExtensions = ['.gmt', '.obj', '.dae', '.glb', '.gltf'];
    const geometryFiles: string[] = [];

    function searchDir(dir: string) {
        if (!fs.existsSync(dir)) return;

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                searchDir(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (geometryExtensions.includes(ext)) {
                    geometryFiles.push(fullPath);
                }
            }
        }
    }

    searchDir(extractedDir);
    return geometryFiles;
}

/**
 * Main extraction function
 */
async function extractTrack(options: ExtractionOptions) {
    console.log(chalk.blue.bold('\n🏁 AMS2 Track Extractor (PCarsTools)\n'));

    // Find AMS2 installation
    const spinner = ora('Finding AMS2 installation...').start();
    const ams2Path = options.ams2Path || findAMS2Installation();

    if (!ams2Path) {
        spinner.fail('AMS2 installation not found');
        console.log(chalk.yellow('\nTried these locations:'));
        COMMON_AMS2_PATHS.forEach(p => console.log(`  - ${p}`));
        console.log(chalk.yellow('\nUse --ams2-path to specify custom location'));
        process.exit(1);
    }

    spinner.succeed(`Found AMS2: ${ams2Path}`);

    // List tracks mode
    if (options.listTracks) {
        console.log(chalk.blue('\n📋 Available Tracks:\n'));
        const tracks = listAvailableTracks(ams2Path);

        if (tracks.length === 0) {
            console.log(chalk.yellow('No tracks found'));
            process.exit(1);
        }

        tracks.forEach((track, index) => {
            console.log(chalk.green(`  ${(index + 1).toString().padStart(3)}. ${track}`));
        });
        console.log(chalk.gray(`\nTotal: ${tracks.length} tracks\n`));
        process.exit(0);
    }

    // Validate track name
    if (!options.track) {
        console.error(chalk.red('✗ Track name required'));
        console.log(chalk.yellow('Use --list-tracks to see available tracks'));
        process.exit(1);
    }

    // Find track file
    const trackSpinner = ora(`Searching for track: ${options.track}...`).start();
    const trackPath = findTrackFile(ams2Path, options.track);

    if (!trackPath) {
        trackSpinner.fail(`Track not found: ${options.track}`);
        console.log(chalk.yellow('\nUse --list-tracks to see available tracks'));
        process.exit(1);
    }

    trackSpinner.succeed(`Found track: ${path.basename(trackPath)}`);

    // Prepare output directory
    const trackSlug = options.track.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const outputDir = options.output || path.join(OUTPUT_DIR, trackSlug);

    console.log(chalk.gray(`\nOutput: ${outputDir}\n`));

    // Verify PCarsTools
    if (!fs.existsSync(PCARSTOOLS_EXE)) {
        console.error(chalk.red('✗ PCarsTools executable not found'));
        console.log(chalk.yellow(`Expected: ${PCARSTOOLS_EXE}`));
        console.log(chalk.yellow('Run: npm run verify-setup'));
        process.exit(1);
    }

    // Execute extraction
    const extractSpinner = ora('Extracting with PCarsTools...').start();
    extractSpinner.text = 'Extracting track files (this may take 10-30 minutes)...';

    const result = await executePCarsTools(trackPath, outputDir, ams2Path, options.format);

    if (!result.success) {
        extractSpinner.fail('Extraction failed');
        console.error(chalk.red(`\n${result.error}`));
        process.exit(1);
    }

    extractSpinner.succeed('Extraction complete');

    // Find geometry files
    console.log(chalk.blue('\n📦 Searching for geometry files...\n'));
    const geometryFiles = findGeometryFiles(outputDir);

    if (geometryFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No geometry files found (.gmt, .obj, .dae, .glb, .gltf)'));
        console.log(chalk.gray('\nExtracted files may require manual conversion in Blender'));
    } else {
        console.log(chalk.green(`✓ Found ${geometryFiles.length} geometry file(s):\n`));
        geometryFiles.forEach(file => {
            const relativePath = path.relative(outputDir, file);
            const size = fs.statSync(file).size;
            const sizeMB = (size / 1024 / 1024).toFixed(2);
            console.log(chalk.gray(`  ${relativePath} (${sizeMB} MB)`));
        });
    }

    // Next steps
    console.log(chalk.blue('\n✨ Next Steps:\n'));

    if (geometryFiles.some(f => f.endsWith('.glb') || f.endsWith('.gltf'))) {
        console.log(chalk.green('  1. Optimize for web:'));
        console.log(chalk.gray(`     npm run optimize -- "${geometryFiles.find(f => f.endsWith('.glb') || f.endsWith('.gltf'))}"`));
    } else {
        console.log(chalk.yellow('  1. Convert to glTF in Blender (see GETTING-STARTED.md)'));
        console.log(chalk.gray('     - Import extracted geometry'));
        console.log(chalk.gray('     - Clean up (remove buildings, etc.)'));
        console.log(chalk.gray('     - Export as glTF 2.0'));
    }

    console.log(chalk.green('\n  2. Manual coordinate alignment'));
    console.log(chalk.gray('     - Load telemetry data'));
    console.log(chalk.gray('     - Trial and error to match coordinates'));
    console.log(chalk.gray('     - Save calibration JSON\n'));
}

// CLI Setup
program
    .name('extract-track')
    .description('Extract AMS2 track using PCarsTools')
    .option('-t, --track <name>', 'Track name (e.g., "Silverstone International")')
    .option('-a, --ams2-path <path>', 'AMS2 installation directory')
    .option('-o, --output <path>', 'Output directory')
    .option('-f, --format <format>', 'Export format (gltf, obj, dae, fbx)', 'gltf')
    .option('-l, --list-tracks', 'List all available tracks')
    .parse();

const options = program.opts<ExtractionOptions>();

// Run extraction
extractTrack(options).catch((error) => {
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    process.exit(1);
});
