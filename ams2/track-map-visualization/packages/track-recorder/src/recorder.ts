/**
 * AMS2 Track Recorder
 * 
 * Records world coordinates during a single lap to generate track JSON files.
 * 
 * Usage:
 * 1. Start AMS2 and load a track
 * 2. Run: npm run record
 * 3. Drive ONE clean lap (don't cut corners)
 * 4. Track data saved to: ../../recorded-tracks/{track-name}.json
 * 
 * The recorder:
 * - Samples coordinates every 10-50 meters (adaptive based on speed)
 * - Captures X/Y world positions from AMS2 shared memory
 * - Generates normalized coordinates and SVG path
 * - Includes sector splits and track metadata
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ffi from 'ffi-napi';
import ref from 'ref-napi';
import type { RecordingSession, CoordinatePoint, TrackData, TrackBounds } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Windows API for shared memory
const kernel32 = ffi.Library('kernel32', {
    'OpenFileMappingA': ['pointer', ['uint32', 'bool', 'string']],
    'MapViewOfFile': ['pointer', ['pointer', 'uint32', 'uint32', 'uint32', 'size_t']],
    'UnmapViewOfFile': ['bool', ['pointer']],
    'CloseHandle': ['bool', ['pointer']],
});

const FILE_MAP_READ = 0x0004;
const SAMPLE_INTERVAL_MS = 50;       // Check memory every 50ms
const MIN_DISTANCE_BETWEEN_POINTS = 5; // meters (higher = fewer points)

let session: RecordingSession = {
    isRecording: false,
    trackName: '',
    trackLength: 0,
    startTime: 0,
    points: [],
    currentLap: 0,
    previousLapDistance: 0,
};

/**
 * Read AMS2 shared memory
 */
function readSharedMemory() {
    try {
        const processObject = memoryjs.openProcess(PROCESS_NAME);
        const handle = processObject.handle;

        // Open shared memory
        const buffer = memoryjs.readMemory(handle, SHARED_MEMORY_NAME as any, 'buffer' as any);

        if (!buffer) {
            return null;
        }

        // Read track info
        const trackLength = buffer.readFloatLE(OFFSETS.mTrackLength);
        const trackLocation = buffer.toString('utf8', OFFSETS.mTrackLocation, OFFSETS.mTrackLocation + 64).replace(/\0/g, '').trim();
        const trackVariation = buffer.toString('utf8', OFFSETS.mTrackVariation, OFFSETS.mTrackVariation + 64).replace(/\0/g, '').trim();

        // Read position data
        const currentLap = buffer.readInt32LE(OFFSETS.mCurrentLap);
        const currentLapDistance = buffer.readFloatLE(OFFSETS.mCurrentLapDistance);
        const worldX = buffer.readFloatLE(OFFSETS.mWorldPosition);
        const worldY = buffer.readFloatLE(OFFSETS.mWorldPosition + 4);
        const worldZ = buffer.readFloatLE(OFFSETS.mWorldPosition + 8);
        const speed = buffer.readFloatLE(OFFSETS.mSpeed);
        const lapInvalidated = buffer.readUInt8(OFFSETS.mLapInvalidated) !== 0;

        memoryjs.closeProcess(handle);

        return {
            trackLength,
            trackLocation,
            trackVariation,
            currentLap,
            currentLapDistance,
            worldX,
            worldY,
            worldZ,
            speed,
            lapInvalidated,
        };
    } catch (error) {
        // Process not found or memory read error
        return null;
    }
}

/**
 * Start recording a lap
 */
function startRecording(data: any) {
    const trackName = data.trackVariation
        ? `${data.trackLocation}_${data.trackVariation}`
        : data.trackLocation;

    console.log('\n🔴 RECORDING STARTED');
    console.log(`📍 Track: ${trackName}`);
    console.log(`📏 Length: ${data.trackLength.toFixed(0)} meters`);
    console.log(`🏁 Drive ONE clean lap (don't cut corners!)\n`);

    session = {
        isRecording: true,
        trackName,
        trackLength: data.trackLength,
        startTime: Date.now(),
        points: [],
        currentLap: data.currentLap,
        previousLapDistance: data.currentLapDistance,
    };
}

/**
 * Record a coordinate point
 */
function recordPoint(data: any) {
    const lapPercentage = data.currentLapDistance / session.trackLength;

    const point: CoordinatePoint = {
        x: data.worldX,
        y: data.worldY,
        z: data.worldZ,
        lapDistance: data.currentLapDistance,
        lapPercentage,
        speed: data.speed,
        timestamp: Date.now() - session.startTime,
    };

    session.points.push(point);

    // Progress indicator
    const progress = (lapPercentage * 100).toFixed(1);
    process.stdout.write(`\r📊 Recording... ${progress}% (${session.points.length} points)`);
}

/**
 * Check if we should record a new point (adaptive sampling)
 */
function shouldRecordPoint(data: any): boolean {
    if (session.points.length === 0) {
        return true; // Always record first point
    }

    const lastPoint = session.points[session.points.length - 1];
    const distanceTraveled = data.currentLapDistance - lastPoint.lapDistance;

    // Adaptive sampling based on speed
    const minDistance = data.speed > 50 ? MIN_DISTANCE_BETWEEN_POINTS * 2 : MIN_DISTANCE_BETWEEN_POINTS;

    return distanceTraveled >= minDistance;
}

/**
 * Calculate track bounds from recorded points
 */
function calculateBounds(points: CoordinatePoint[]): TrackBounds {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        minX,
        maxX,
        minY,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Normalize coordinates to 0-1000 range
 */
function normalizeCoordinates(points: CoordinatePoint[], bounds: TrackBounds) {
    return points.map(point => ({
        x: Math.round(((point.x - bounds.minX) / bounds.width) * 1000),
        y: Math.round(((point.y - bounds.minY) / bounds.height) * 1000),
        lapPercent: point.lapPercentage,
    }));
}

/**
 * Generate SVG path from coordinates
 */
function generateSVGPath(normalizedPoints: Array<{ x: number; y: number }>): string {
    if (normalizedPoints.length === 0) {
        return '';
    }

    const first = normalizedPoints[0];
    let path = `M ${first.x} ${first.y}`;

    for (let i = 1; i < normalizedPoints.length; i++) {
        const point = normalizedPoints[i];
        path += ` L ${point.x} ${point.y}`;
    }

    // Close the path
    path += ' Z';

    return path;
}

/**
 * Save track data to JSON file
 */
function saveTrackData() {
    console.log('\n\n💾 Processing track data...');

    // Remove duplicate points at start/finish
    const cleanPoints = session.points.slice(0, -10); // Remove last few points that overlap with start

    console.log(`✅ Captured ${cleanPoints.length} coordinate points`);

    // Calculate bounds
    const bounds = calculateBounds(cleanPoints);
    console.log(`📐 Track bounds: ${bounds.width.toFixed(0)}m x ${bounds.height.toFixed(0)}m`);

    // Normalize coordinates
    const normalizedPoints = normalizeCoordinates(cleanPoints, bounds);

    // Generate SVG path
    const svgPath = generateSVGPath(normalizedPoints);

    // Create track data
    const trackData: TrackData = {
        name: session.trackName,
        codeName: session.trackName.toLowerCase().replace(/\s+/g, '_'),
        length: session.trackLength,
        recordedAt: new Date().toISOString(),
        version: '1.0.0',
        coordinates: normalizedPoints,
        svgPath,
        bounds,
        sectors: [0.33, 0.67], // Default 3 sectors (can be updated manually)
    };

    // Save to file
    const outputDir = join(__dirname, '../../../recorded-tracks');
    mkdirSync(outputDir, { recursive: true });

    const filename = `${trackData.codeName}.json`;
    const filepath = join(outputDir, filename);

    writeFileSync(filepath, JSON.stringify(trackData, null, 2));

    console.log(`\n🎉 Track data saved to: ${filepath}`);
    console.log(`\n📊 Track Statistics:`);
    console.log(`   Name: ${trackData.name}`);
    console.log(`   Length: ${trackData.length.toFixed(0)} meters`);
    console.log(`   Points: ${normalizedPoints.length}`);
    console.log(`   Resolution: ~${(trackData.length / normalizedPoints.length).toFixed(1)} meters/point`);
    console.log(`\n✨ Ready to use in track-map-demo!`);
}

/**
 * Main recording loop
 */
function recordingLoop() {
    const data = readSharedMemory();

    if (!data) {
        if (session.isRecording) {
            console.log('\n❌ Lost connection to AMS2');
            process.exit(1);
        }
        return;
    }

    // Wait for player to enter track
    if (!session.isRecording && data.currentLap === 0) {
        process.stdout.write('\r⏳ Waiting for you to start driving...');
        return;
    }

    // Start recording when lap 1 begins
    if (!session.isRecording && data.currentLap >= 1) {
        startRecording(data);
    }

    // Record points during the lap
    if (session.isRecording && data.currentLap === session.currentLap) {
        if (shouldRecordPoint(data)) {
            recordPoint(data);
        }
        session.previousLapDistance = data.currentLapDistance;
    }

    // Stop recording when lap completes
    if (session.isRecording && data.currentLap > session.currentLap) {
        console.log('\n\n🏁 Lap completed!');

        if (data.lapInvalidated) {
            console.log('⚠️  WARNING: Lap was invalidated (corner cut detected)');
            console.log('   The track data may be inaccurate. Consider re-recording.');
        }

        saveTrackData();
        process.exit(0);
    }
}

/**
 * Start the recorder
 */
function main() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     AMS2 Track Recorder v1.0.0            ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('📝 Instructions:');
    console.log('   1. Load a track in AMS2');
    console.log('   2. Start driving (practice/test session)');
    console.log('   3. Complete ONE clean lap');
    console.log('   4. Track data will be saved automatically\n');

    // Check if AMS2 is running
    console.log('🔍 Looking for AMS2 process...');
    const data = readSharedMemory();

    if (!data) {
        console.log('❌ AMS2 not found. Please start the game first.');
        process.exit(1);
    }

    console.log('✅ Connected to AMS2\n');

    // Start recording loop
    setInterval(recordingLoop, SAMPLE_INTERVAL_MS);
}

main();
