/**
 * GridVox Track Map - Demo Application
 * 
 * Demonstrates:
 * 1. Pixi.js renderer with WebGL
 * 2. AMS2 adapter (sim mode for now)
 * 3. Real-time car position updates
 * 4. Track recording from telemetry
 */

import { PixiTrackRenderer } from '@gridvox/track-map-core/rendering';
import { TrackRecorder } from '@gridvox/track-map-core';
import type { TrackDefinition, CarPosition } from '@gridvox/track-map-core';
import { AMS2Adapter } from '@gridvox/track-map-ams2';
import { loadTrack, TRACK_CATALOG, getTracksByCategory, type TrackMetadata } from './trackLoader';

// Get DOM elements
const canvas = document.getElementById('track-canvas') as HTMLCanvasElement;
const statusMessage = document.getElementById('status-message') as HTMLDivElement;
const btnDemoMode = document.getElementById('btn-demo-mode') as HTMLButtonElement;
const btnRecordTrack = document.getElementById('btn-record-track') as HTMLButtonElement;
const trackSelect = document.getElementById('track-select') as HTMLSelectElement;

// Initialize renderer and recorder
let renderer: PixiTrackRenderer | null = null;
let currentTrack: TrackDefinition | null = null;
const trackRecorder = new TrackRecorder();

/**
 * Mock track data for demo
 * TODO: Load from JSON file or record from telemetry
 */
const mockTrack: TrackDefinition = {
    id: 'demo_oval',
    name: 'Demo Oval Track',
    sim: 'ams2',
    length: 2000,
    points: generateOvalTrack(960, 540, 400, 300, 100),
    sectors: {
        sector1End: 0.33,
        sector2End: 0.67,
    },
    corners: [
        {
            id: 'T1',
            name: 'Turn 1',
            startPercentage: 0.23,
            endPercentage: 0.27,
            labelPosition: { x: 1100, y: 300 },
            number: 1,
            sector: 1,
        },
        {
            id: 'T2',
            name: 'Turn 2',
            startPercentage: 0.73,
            endPercentage: 0.77,
            labelPosition: { x: 820, y: 780 },
            number: 2,
            sector: 3,
        },
    ],
    startFinish: {
        lapPercentage: 0,
        canvasPosition: { x: 960, y: 240 },
    },
    metadata: {
        generatedBy: 'manual',
        generatedDate: new Date().toISOString(),
        version: '1.0',
    },
};

/**
 * Populate track selector dropdown
 */
function populateTrackSelector() {
    trackSelect.innerHTML = '';

    // Add demo oval
    const demoOption = document.createElement('option');
    demoOption.value = 'oval';
    demoOption.textContent = '🔵 Demo Oval Track';
    trackSelect.appendChild(demoOption);

    // Add iRacing tracks by category
    const categories = getTracksByCategory();

    categories.forEach((tracks, category) => {
        if (tracks.length === 0) return;

        const optgroup = document.createElement('optgroup');
        optgroup.label = `🏁 ${category}`;

        tracks.forEach((track: TrackMetadata) => {
            const option = document.createElement('option');
            option.value = track.id;
            option.textContent = track.name;
            optgroup.appendChild(option);
        });

        trackSelect.appendChild(optgroup);
    });
}

/**
 * Load and display selected track
 */
async function handleTrackChange(trackId: string) {
    try {
        statusMessage.textContent = `Loading ${trackId}...`;
        console.log('Loading track:', trackId);

        let track: TrackDefinition;

        if (trackId === 'oval') {
            track = mockTrack;
            console.log('Using mock oval track');
        } else {
            console.log('Loading track from file...');
            track = await loadTrack(trackId);
            console.log('Track loaded:', track);
        }

        currentTrack = track;

        if (renderer) {
            console.log('Drawing track with', track.points.length, 'points');
            renderer.drawTrack(track);
        } else {
            console.error('Renderer not initialized!');
        }

        // Update UI
        document.getElementById('track-name')!.textContent = track.name;
        document.getElementById('track-source')!.textContent = track.metadata?.source || 'Generated';
        document.getElementById('track-length')!.textContent = `${track.length}m`;
        document.getElementById('track-points')!.textContent = track.points.length.toString();

        statusMessage.textContent = `✅ Loaded ${track.name}`;

        console.log(`✅ Loaded track: ${track.name} (${track.points.length} points)`);
    } catch (error) {
        console.error('❌ Failed to load track:', error);
        statusMessage.textContent = `Error loading track: ${error}`;
    }
}

/**
 * Generate an oval track for demo purposes
 */
function generateOvalTrack(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    numPoints: number
): TrackDefinition['points'] {
    const points: TrackDefinition['points'] = [];

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const lapPercentage = i / numPoints;

        // Determine sector
        let sector: 1 | 2 | 3 = 1;
        if (lapPercentage >= 0.67) sector = 3;
        else if (lapPercentage >= 0.33) sector = 2;

        points.push({
            lapDistance: (i / numPoints) * 2000,
            lapPercentage,
            x: centerX + Math.cos(angle) * width,
            y: centerY + Math.sin(angle) * height,
            sector,
        });
    }

    return points;
}

/**
 * Generate mock car positions for demo
 */
function generateMockCars(numCars: number, time: number): CarPosition[] {
    const cars: CarPosition[] = [];

    for (let i = 0; i < numCars; i++) {
        const baseSpeed = 0.0002; // Base lap completion per frame
        const variation = (i / numCars) * 0.2; // Spread cars around track
        const lapPercentage = ((time * baseSpeed + variation) % 1);

        // Calculate world position on oval track (for recording)
        const angle = lapPercentage * Math.PI * 2;
        const radiusX = 400;
        const radiusY = 300;
        const centerX = 960;
        const centerY = 540;

        cars.push({
            carId: i,
            driverName: `Driver ${i + 1}`,
            carNumber: `${i + 1}`,
            racePosition: i + 1,
            classPosition: i + 1,
            lapPercentage,
            currentLap: Math.floor(time * baseSpeed / 1) + 1,
            currentSector: lapPercentage < 0.33 ? 1 : lapPercentage < 0.67 ? 2 : 3,
            carClass: 'GT3',
            classColor: i === 0 ? '#FFD700' : '#FF6B6B',
            isPlayer: i === 0,
            isInPit: false,
            speed: 250 + Math.random() * 50,
            worldPosition: {
                x: centerX + Math.cos(angle) * radiusX,
                y: 0,  // Y is height (not used in 2D view)
                z: centerY + Math.sin(angle) * radiusY,
            },
        });
    }

    return cars;
}

/**
 * Initialize the application
 */
async function init() {
    try {
        statusMessage.textContent = 'Initializing Pixi.js renderer...';

        // Create renderer
        renderer = new PixiTrackRenderer(canvas, 1920, 1080);

        // Wait a bit for async initialization
        await new Promise(resolve => setTimeout(resolve, 500));

        // Populate track selector
        populateTrackSelector();

        // Load default track (oval)
        currentTrack = mockTrack;

        // Draw track
        renderer.drawTrack(mockTrack);

        statusMessage.textContent = 'Ready! Select a track and click "Start Demo Mode"';

        // Update UI
        document.getElementById('track-name')!.textContent = mockTrack.name;
        document.getElementById('track-source')!.textContent = 'Generated';
        document.getElementById('track-length')!.textContent = `${mockTrack.length}m`;
        document.getElementById('track-points')!.textContent = mockTrack.points.length.toString();

        console.log('✅ Renderer initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize renderer:', error);
        statusMessage.textContent = `Error: ${error}`;
    }
}

/**
 * Demo mode animation loop
 */
let animationFrameId: number | null = null;
let startTime = 0;
let frameCount = 0;
let lastFpsUpdate = 0;

function demoLoop(timestamp: number) {
    if (startTime === 0) startTime = timestamp;
    const elapsed = timestamp - startTime;

    // Use current track or fallback to mock
    const track = currentTrack || mockTrack;

    // Generate mock cars
    const cars = generateMockCars(12, elapsed);

    // Record player car position if recording
    if (trackRecorder.isRecording() && cars.length > 0) {
        const playerCar = cars.find(car => car.isPlayer);
        if (playerCar) {
            trackRecorder.recordSample(playerCar);

            // Check if lap completed
            const status = trackRecorder.getStatus();
            if (!status.recording && status.pointCount > 0) {
                // Auto-stop recording when lap completes
                setTimeout(() => {
                    if (btnRecordTrack.classList.contains('recording')) {
                        btnRecordTrack.click();
                    }
                }, 100);
            }
        }
    }

    // Update renderer
    if (renderer) {
        renderer.updateCars(cars, track);
    }

    // Update UI
    document.getElementById('car-count')!.textContent = cars.length.toString();

    // Calculate FPS
    frameCount++;
    if (timestamp - lastFpsUpdate > 1000) {
        const fps = Math.round((frameCount / (timestamp - lastFpsUpdate)) * 1000);
        document.getElementById('fps')!.textContent = `${fps}`;
        document.getElementById('render-time')!.textContent = `${(1000 / fps).toFixed(1)}ms`;
        frameCount = 0;
        lastFpsUpdate = timestamp;
    }

    animationFrameId = requestAnimationFrame(demoLoop);
}

/**
 * Start demo mode
 */
btnDemoMode.addEventListener('click', () => {
    if (animationFrameId !== null) {
        // Stop demo
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        btnDemoMode.textContent = '🎮 Start Demo Mode';
        statusMessage.textContent = 'Demo stopped';
    } else {
        // Start demo
        startTime = 0;
        frameCount = 0;
        lastFpsUpdate = 0;
        animationFrameId = requestAnimationFrame(demoLoop);
        btnDemoMode.textContent = '⏸️ Stop Demo Mode';
        statusMessage.textContent = 'Demo running - 12 cars @ 60 FPS';

        // Update connection status
        document.getElementById('connection-status')!.textContent = 'Demo Mode';
        document.getElementById('status-dot')!.className = 'status-indicator connected';
    }
});

/**
 * Track selection handler
 */
trackSelect.addEventListener('change', async (e) => {
    const trackId = (e.target as HTMLSelectElement).value;

    // Stop demo if running
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        btnDemoMode.textContent = '🎮 Start Demo Mode';
        document.getElementById('connection-status')!.textContent = 'Disconnected';
        document.getElementById('status-dot')!.className = 'status-indicator disconnected';
    }

    await handleTrackChange(trackId);
});

/**
 * Record Track button handler
 */
btnRecordTrack.addEventListener('click', async () => {
    if (trackRecorder.isRecording()) {
        // Stop recording
        const recordedTrack = trackRecorder.stopRecording();

        if (recordedTrack) {
            console.log('✅ Track recorded:', recordedTrack);
            statusMessage.textContent = `✅ Recorded ${recordedTrack.name} with ${recordedTrack.points.length} points!`;

            // Save to file
            const json = JSON.stringify(recordedTrack, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${recordedTrack.id}.json`;
            a.click();
            URL.revokeObjectURL(url);

            // Load the recorded track
            currentTrack = recordedTrack;
            if (renderer) {
                renderer.drawTrack(recordedTrack);
            }

            // Update UI
            document.getElementById('track-name')!.textContent = recordedTrack.name;
            document.getElementById('track-source')!.textContent = 'Recorded from Telemetry';
            document.getElementById('track-length')!.textContent = `${Math.round(recordedTrack.length)}m`;
            document.getElementById('track-points')!.textContent = recordedTrack.points.length.toString();
        }

        btnRecordTrack.textContent = '🔴 Record Track (Drive 1 Lap)';
        btnRecordTrack.classList.remove('recording');

    } else {
        // Start recording
        const trackName = prompt('Enter track name:');
        if (!trackName) return;

        trackRecorder.startRecording(trackName, 'ams2');
        btnRecordTrack.textContent = '⏹️ Stop Recording';
        btnRecordTrack.classList.add('recording');
        statusMessage.textContent = `🔴 Recording ${trackName}... Drive one clean lap!`;
    }
});

// Initialize on load
init();
