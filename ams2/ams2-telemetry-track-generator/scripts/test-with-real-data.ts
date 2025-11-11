/**
 * Test script to validate track generation with real Brands Hatch Indy data
 *
 * This script:
 * 1. Loads 3 telemetry runs from AppData
 * 2. Runs alignment (Phase 1)
 * 3. Generates track surface & racing line (Phase 2)
 * 4. Exports .glb + .json files
 * 5. Reports alignment quality and file paths
 *
 * Usage: npm run test:real-data
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { generateTrack, loadRunsFromFiles } from '../src/lib/generateTrack';
import { RunDictionary } from '../src/lib/alignment';

// Path to AppData telemetry folder
const APPDATA_PATH = process.env.APPDATA || path.join(process.env.HOME || '', 'AppData', 'Roaming');
const TELEMETRY_PATH = path.join(APPDATA_PATH, 'com.gridvox.circuit-tracing', 'telemetry-data');

// Output path for generated files
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'brandshatch-indy');

async function main() {
    console.log('\n🏁 Brands Hatch Indy - Track Generation Test\n');
    console.log('=' .repeat(60));

    // Step 1: Check if telemetry files exist
    console.log('\n[1/5] Checking telemetry data...');
    const outsidePath = path.join(TELEMETRY_PATH, 'brandshatch-brandshatch-indy-outside.json');
    const insidePath = path.join(TELEMETRY_PATH, 'brandshatch-brandshatch-indy-inside.json');
    const racingPath = path.join(TELEMETRY_PATH, 'brandshatch-brandshatch-indy-racing.json');

    try {
        await fs.access(outsidePath);
        await fs.access(insidePath);
        await fs.access(racingPath);
        console.log('✅ All 3 telemetry files found');
    } catch (error) {
        console.error('❌ Missing telemetry files in:', TELEMETRY_PATH);
        console.error('   Make sure you have recorded 3 laps in the app first.');
        process.exit(1);
    }

    // Step 2: Load telemetry data
    console.log('\n[2/5] Loading telemetry runs...');
    let runs: RunDictionary;
    try {
        runs = await loadRunsFromFiles(outsidePath, insidePath, racingPath);
        console.log(`✅ Loaded 3 runs:`);
        console.log(`   - Outside: ${runs.outside.length} points`);
        console.log(`   - Inside: ${runs.inside.length} points`);
        console.log(`   - Racing: ${runs.racing.length} points`);
    } catch (error) {
        console.error('❌ Failed to load telemetry:', error);
        process.exit(1);
    }

    // Step 3: Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Step 4: Generate track
    console.log('\n[3/5] Generating track (this may take 10-30 seconds)...');
    console.log('=' .repeat(60));

    try {
        const result = await generateTrack(runs, {
            track: {
                name: 'Brands Hatch',
                location: 'Brands Hatch',
                variation: 'Indy',
                length: 1931, // meters (from telemetry)
                key: 'brandshatch_indy'
            },
            alignment: {
                resampleCount: 1000,
                logger: (level, message, context) => {
                    const prefix = level === 'warn' ? '⚠️' : level === 'debug' ? '🔍' : 'ℹ️';
                    console.log(`${prefix} ${message}`);
                    if (context) {
                        console.log('   ', JSON.stringify(context, null, 2));
                    }
                }
            },
            export: {
                outputPath: OUTPUT_PATH,
                optimize: true,
                exportMetadata: true,
                useDracoCompression: false
            },
            useRacingLineTube: true // Better visibility in viewer
        });

        console.log('=' .repeat(60));
        console.log('\n[4/5] Track generation complete!\n');
        console.log('📦 Generated files:');
        console.log(`   - GLB: ${result.glbPath}`);
        console.log(`   - Metadata: ${result.metadataPath}`);

        // Step 5: Read and display metadata summary
        console.log('\n[5/5] Validation results:\n');
        const metadataContent = await fs.readFile(result.metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);

        console.log('🎯 Alignment Quality:');
        console.log(`   - Method: ${metadata.alignment.method}`);
        console.log(`   - Confidence: ${(metadata.alignment.confidence * 100).toFixed(1)}%`);
        console.log(`   - Alignment Score: ${(metadata.alignment.alignmentScore * 100).toFixed(1)}%`);
        console.log(`   - Max Start Delta: ${metadata.alignment.maxStartPositionDelta.toFixed(2)}m`);
        console.log(`   - Resampled Points: ${metadata.alignment.resampleCount}`);

        console.log('\n🏁 Track Info:');
        console.log(`   - Name: ${metadata.track.name}`);
        console.log(`   - Length: ${metadata.track.length}m`);
        console.log(`   - Variation: ${metadata.track.variation}`);

        console.log('\n📊 Recording Info:');
        console.log(`   - Date: ${new Date(metadata.recording.date).toLocaleString()}`);
        console.log(`   - Outside run: ${metadata.recording.runs.outside.pointCount} points, ${metadata.recording.runs.outside.avgSpeed?.toFixed(1)} m/s avg`);
        console.log(`   - Inside run: ${metadata.recording.runs.inside.pointCount} points, ${metadata.recording.runs.inside.avgSpeed?.toFixed(1)} m/s avg`);
        console.log(`   - Racing run: ${metadata.recording.runs.racing.pointCount} points, ${metadata.recording.runs.racing.avgSpeed?.toFixed(1)} m/s avg`);

        // Quality assessment
        console.log('\n✅ Quality Assessment:');
        const alignmentScore = metadata.alignment.alignmentScore;
        const maxDelta = metadata.alignment.maxStartPositionDelta;
        const confidence = metadata.alignment.confidence;

        if (alignmentScore >= 0.9 && maxDelta < 5 && confidence >= 0.8) {
            console.log('   🟢 EXCELLENT - Track geometry is highly accurate');
        } else if (alignmentScore >= 0.7 && maxDelta < 10 && confidence >= 0.6) {
            console.log('   🟡 GOOD - Track geometry is acceptable, may have minor alignment issues');
        } else {
            console.log('   🔴 POOR - Track may have significant alignment issues');
            console.log('   ⚠️  Consider re-recording laps with more consistent lines');
        }

        console.log('\n🔍 Next steps:');
        console.log(`   1. Open ${result.glbPath} in: https://gltf-viewer.donmccurdy.com/`);
        console.log('   2. Verify track shape looks correct');
        console.log('   3. Check that racing line (green tube) is visible');
        console.log('   4. If quality is poor, try recording new laps with more consistent driving\n');

    } catch (error) {
        console.error('\n❌ Track generation failed:', error);
        if (error instanceof Error) {
            console.error('\nError details:', error.message);
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

main().catch(console.error);
