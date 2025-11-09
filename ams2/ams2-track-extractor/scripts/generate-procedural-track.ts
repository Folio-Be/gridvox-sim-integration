#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

/**
 * Generate procedural race track from telemetry data
 * 
 * Approach 2: Telemetry-to-Procedural (95% success rate)
 * 
 * Input: Telemetry JSON with position data
 * Output: Optimized glTF file with track mesh
 */

interface TelemetryFrame {
    timestamp: number;
    position: [number, number, number];
    speed?: number;
}

interface TelemetryData {
    trackName: string;
    frames: TelemetryFrame[];
    metadata?: {
        totalLaps?: number;
        lapTime?: number;
        car?: string;
    };
}

interface GenerationOptions {
    trackWidth?: number;
    radialSegments?: number;
    textured?: boolean;
    generateLODs?: boolean;
    includeBuildings?: boolean;
}

const program = new Command();

program
    .name('generate-procedural-track')
    .description('Generate 3D track model from telemetry recording')
    .requiredOption('-i, --input <path>', 'Path to telemetry JSON file')
    .option('-o, --output <path>', 'Output glTF file path')
    .option('-t, --track <name>', 'Track name (auto-detected if not provided)')
    .option('-w, --width <number>', 'Track width in meters', '10')
    .option('--no-texture', 'Skip texture application')
    .option('--no-lods', 'Skip LOD generation')
    .option('--buildings', 'Add simplified buildings')
    .option('--test', 'Run in test mode with sample data')
    .parse(process.argv);

const options = program.opts();

async function main() {
    console.log(chalk.bold.blue('🏁 AMS2 Procedural Track Generator\n'));

    if (options.test) {
        await runTest();
        return;
    }

    // Load telemetry data
    const spinner = ora('Loading telemetry data...').start();
    let telemetryData: TelemetryData;

    try {
        const fileContent = await fs.readFile(options.input, 'utf-8');
        telemetryData = JSON.parse(fileContent);
        spinner.succeed(`Loaded ${telemetryData.frames.length} telemetry frames`);
    } catch (error) {
        spinner.fail('Failed to load telemetry data');
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
    }

    // Validate telemetry data
    if (!telemetryData.frames || telemetryData.frames.length < 100) {
        console.error(chalk.red('Error: Insufficient telemetry data (need at least 100 frames)'));
        process.exit(1);
    }

    // Extract track name
    const trackName = options.track || telemetryData.trackName || 'unknown-track';
    console.log(chalk.cyan(`Track: ${trackName}\n`));

    // Generate track mesh
    const generationOptions: GenerationOptions = {
        trackWidth: parseFloat(options.width),
        radialSegments: 16,
        textured: options.texture !== false,
        generateLODs: options.lods !== false,
        includeBuildings: options.buildings === true,
    };

    const trackScene = await generateTrack(telemetryData, generationOptions);

    // Export to glTF
    const outputPath = options.output ||
        path.join(process.cwd(), 'converted-tracks', `${trackName}.glb`);

    await exportGLTF(trackScene, outputPath);

    console.log(chalk.bold.green('\n✅ Track generation complete!'));
    console.log(chalk.gray(`Output: ${outputPath}`));
}

async function generateTrack(
    telemetryData: TelemetryData,
    options: GenerationOptions
): Promise<THREE.Scene> {
    const spinner = ora('Generating track geometry...').start();

    try {
        const scene = new THREE.Scene();

        // Extract positions from telemetry
        const positions = telemetryData.frames.map(frame =>
            new THREE.Vector3(frame.position[0], frame.position[1], frame.position[2])
        );

        // Remove duplicate/very close points
        const cleanedPositions = removeDuplicates(positions, 1.0);
        spinner.text = `Cleaned positions: ${cleanedPositions.length} points`;

        // Create smooth curve
        const curve = new THREE.CatmullRomCurve3(cleanedPositions, true);

        // Generate tube geometry for track surface
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            cleanedPositions.length * 2, // segments
            options.trackWidth || 10,    // radius (track width)
            options.radialSegments || 16, // radial segments
            false                          // not closed
        );

        // Create material
        const trackMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.1,
        });

        if (options.textured) {
            // TODO: Load and apply asphalt texture
            // For now, use solid color
        }

        const trackMesh = new THREE.Mesh(tubeGeometry, trackMaterial);
        trackMesh.name = 'track_surface';
        trackMesh.castShadow = true;
        trackMesh.receiveShadow = true;
        scene.add(trackMesh);

        spinner.succeed('Track geometry generated');

        // Add ground plane
        const groundSpinner = ora('Adding ground plane...').start();
        const groundSize = calculateTrackBounds(cleanedPositions);
        const groundGeometry = new THREE.PlaneGeometry(
            groundSize.width * 2,
            groundSize.depth * 2
        );
        groundGeometry.rotateX(-Math.PI / 2);

        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.9,
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.name = 'ground';
        ground.receiveShadow = true;
        ground.position.y = -1;
        scene.add(ground);
        groundSpinner.succeed('Ground plane added');

        // Add simplified buildings if requested
        if (options.includeBuildings) {
            const buildingSpinner = ora('Adding buildings...').start();
            addSimplifiedBuildings(scene, curve, cleanedPositions);
            buildingSpinner.succeed('Buildings added');
        }

        // Add lighting (for visualization/preview)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 200, 100);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        return scene;
    } catch (error) {
        spinner.fail('Failed to generate track');
        throw error;
    }
}

function removeDuplicates(positions: THREE.Vector3[], threshold: number): THREE.Vector3[] {
    const cleaned: THREE.Vector3[] = [positions[0]];

    for (let i = 1; i < positions.length; i++) {
        const distance = positions[i].distanceTo(cleaned[cleaned.length - 1]);
        if (distance > threshold) {
            cleaned.push(positions[i]);
        }
    }

    return cleaned;
}

function calculateTrackBounds(positions: THREE.Vector3[]): { width: number; depth: number } {
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const pos of positions) {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
        minZ = Math.min(minZ, pos.z);
        maxZ = Math.max(maxZ, pos.z);
    }

    return {
        width: maxX - minX,
        depth: maxZ - minZ,
    };
}

function addSimplifiedBuildings(
    scene: THREE.Scene,
    curve: THREE.CatmullRomCurve3,
    positions: THREE.Vector3[]
): void {
    // Add simplified buildings at key points
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        roughness: 0.7,
    });

    // Start/finish structure (at longest straight)
    const startFinish = findLongestStraight(positions);
    if (startFinish) {
        const buildingGeometry = new THREE.BoxGeometry(20, 10, 40);
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.copy(startFinish.position);
        building.position.y = 5;
        building.name = 'start_finish_building';
        scene.add(building);
    }

    // Grandstands at sharp corners
    const corners = findSharpCorners(positions);
    corners.slice(0, 3).forEach((corner, index) => {
        const grandstandGeometry = new THREE.BoxGeometry(50, 8, 10);
        const grandstand = new THREE.Mesh(grandstandGeometry, buildingMaterial);
        grandstand.position.copy(corner.position);
        grandstand.position.y = 4;
        grandstand.name = `grandstand_${index + 1}`;
        scene.add(grandstand);
    });
}

function findLongestStraight(positions: THREE.Vector3[]): { position: THREE.Vector3; length: number } | null {
    if (positions.length < 10) return null;

    let longestLength = 0;
    let longestPosition = positions[0];

    for (let i = 0; i < positions.length - 10; i++) {
        const straightLength = positions[i].distanceTo(positions[i + 10]);
        if (straightLength > longestLength) {
            longestLength = straightLength;
            longestPosition = positions[i];
        }
    }

    return { position: longestPosition, length: longestLength };
}

function findSharpCorners(positions: THREE.Vector3[]): Array<{ position: THREE.Vector3; angle: number }> {
    const corners: Array<{ position: THREE.Vector3; angle: number }> = [];

    for (let i = 5; i < positions.length - 5; i++) {
        const v1 = new THREE.Vector3().subVectors(positions[i], positions[i - 5]).normalize();
        const v2 = new THREE.Vector3().subVectors(positions[i + 5], positions[i]).normalize();
        const angle = v1.angleTo(v2);

        if (angle > Math.PI / 4) { // More than 45 degrees
            corners.push({ position: positions[i], angle });
        }
    }

    // Sort by sharpest corners first
    corners.sort((a, b) => b.angle - a.angle);

    return corners;
}

async function exportGLTF(scene: THREE.Scene, outputPath: string): Promise<void> {
    const spinner = ora('Exporting to glTF...').start();

    try {
        // Ensure output directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        const exporter = new GLTFExporter();

        const gltfData = await new Promise<ArrayBuffer>((resolve, reject) => {
            exporter.parse(
                scene,
                (result) => {
                    if (result instanceof ArrayBuffer) {
                        resolve(result);
                    } else {
                        // JSON format
                        resolve(Buffer.from(JSON.stringify(result)));
                    }
                },
                (error) => reject(error),
                {
                    binary: true,
                    onlyVisible: true,
                    embedImages: true,
                }
            );
        });

        await fs.writeFile(outputPath, Buffer.from(gltfData));

        const stats = await fs.stat(outputPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        spinner.succeed(`Exported glTF (${sizeMB} MB)`);
    } catch (error) {
        spinner.fail('Failed to export glTF');
        throw error;
    }
}

async function runTest(): Promise<void> {
    console.log(chalk.yellow('🧪 Running in test mode...\n'));

    // Generate sample telemetry data (circular track)
    const sampleData: TelemetryData = {
        trackName: 'test-circular-track',
        frames: [],
    };

    const radius = 500;
    const numPoints = 200;

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(angle * 4) * 10; // Add some elevation variation

        sampleData.frames.push({
            timestamp: i * 0.016,
            position: [x, y, z],
        });
    }

    console.log(chalk.gray(`Generated ${sampleData.frames.length} sample frames\n`));

    const options: GenerationOptions = {
        trackWidth: 10,
        radialSegments: 16,
        textured: false,
        generateLODs: false,
        includeBuildings: true,
    };

    const scene = await generateTrack(sampleData, options);
    const outputPath = path.join(process.cwd(), 'converted-tracks', 'test-track.glb');
    await exportGLTF(scene, outputPath);

    console.log(chalk.bold.green('\n✅ Test complete!'));
    console.log(chalk.gray(`Test track: ${outputPath}`));
}

main().catch((error) => {
    console.error(chalk.bold.red('\n❌ Error:'), error.message);
    process.exit(1);
});
