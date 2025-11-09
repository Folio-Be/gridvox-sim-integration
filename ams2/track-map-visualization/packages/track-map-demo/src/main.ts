/**
 * GridVox Track Map - Demo Application
 * 
 * Demonstrates:
 * 1. Pixi.js renderer with WebGL
 * 2. AMS2 live telemetry via POC-02
 * 3. Real-time car position updates
 * 4. Track recording from actual driving
 */

import { PixiTrackRenderer } from '@gridvox/track-map-core/rendering';
import { TrackRecorder } from '@gridvox/track-map-core';
import type { TrackDefinition, CarPosition } from '@gridvox/track-map-core';
import { AMS2LiveConnector } from '@gridvox/track-map-ams2';
import { loadTrack, TRACK_CATALOG, getTracksByCategory, type TrackMetadata } from './trackLoader';

// Get DOM elements
const canvas = document.getElementById('track-canvas') as HTMLCanvasElement;
const statusMessage = document.getElementById('status-message') as HTMLDivElement;
const btnConnectAMS2 = document.getElementById('btn-connect-ams2') as HTMLButtonElement;
const btnDemoMode = document.getElementById('btn-demo-mode') as HTMLButtonElement;
const btnRecordTrack = document.getElementById('btn-record-track') as HTMLButtonElement;
const trackSelect = document.getElementById('track-select') as HTMLSelectElement;

// Initialize renderer, recorder, and live connector
let renderer: PixiTrackRenderer | null = null;
let currentTrack: TrackDefinition | null = null;
const trackRecorder = new TrackRecorder();
const liveConnector = new AMS2LiveConnector();

// Track mode state
let isLiveMode = false;
let isDemoMode = false;

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
        document.getElementById('track-source')!.textContent = track.metadata?.generatedBy || 'Generated';
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

    // Record ALL car positions if recording (multi-car averaging)
    if (trackRecorder.isRecording() && cars.length > 0) {
        for (const car of cars) {
            trackRecorder.recordSample(car);
        }

        // Check if recording completed
        const status = trackRecorder.getStatus();
        if (!status.recording && status.pointCount > 0) {
            // Auto-stop recording when enough cars complete laps
            setTimeout(() => {
                if (btnRecordTrack.classList.contains('recording')) {
                    btnRecordTrack.click();
                }
            }, 100);
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
 * Helper to update status message
 */
function updateStatus(message: string) {
    statusMessage.textContent = message;
}

/**
 * Connect to AMS2 via POC-02 native addon
 */
async function connectToAMS2() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        btnDemoMode.textContent = '🎮 Start Demo Mode';
    }

    updateStatus('🔌 Connecting to AMS2...');
    btnConnectAMS2.disabled = true;

    try {
        const connected = await liveConnector.connect();

        if (connected) {
            updateStatus('✅ Connected to AMS2 - Live telemetry active');
            isLiveMode = true;
            isDemoMode = false;

            // Update UI
            btnConnectAMS2.textContent = '🔌 Disconnect from AMS2';
            btnConnectAMS2.disabled = false;
            document.getElementById('connection-status')!.textContent = 'Live - AMS2';
            document.getElementById('status-dot')!.className = 'status-indicator connected';

            // Set up telemetry callback
            liveConnector.onTelemetryUpdate((cars: CarPosition[]) => {
                // If recording, show blank canvas with traced path
                if (trackRecorder.isRecording()) {
                    // Clear and draw recording visualization
                    if (renderer) {
                        renderer.clear();

                        // Get all recorded points from all cars
                        const recordingData = (trackRecorder as any).recording;
                        if (recordingData && recordingData.carData) {
                            // Draw all car paths being traced
                            recordingData.carData.forEach((carData: any, carId: number) => {
                                if (carData.points && carData.points.length > 1) {
                                    renderer.drawRecordingPath(carData.points, carData.lapCompleted);
                                }
                            });
                        }

                        // Draw current car positions as dots
                        cars.forEach(car => {
                            if (car.worldPosition) {
                                renderer.drawRecordingPoint(car.worldPosition, car.isPlayer);
                            }
                        });
                    }

                    // Record ALL car positions
                    for (const car of cars) {
                        trackRecorder.recordSample(car);
                    }

                    // Update recording status in UI
                    const status = trackRecorder.getStatus();
                    statusMessage.textContent = `🔴 Recording... ${status.completedCars}/${status.targetCars} cars completed`;

                    // Check if recording completed
                    if (!status.recording && status.completedCars > 0) {
                        setTimeout(() => {
                            if (btnRecordTrack.classList.contains('recording')) {
                                btnRecordTrack.click();
                            }
                        }, 100);
                    }
                } else {
                    // Normal mode - use track for positioning
                    const track = currentTrack || mockTrack;

                    if (renderer) {
                        renderer.updateCars(cars, track);
                    }

                    // Debug: Log first car position occasionally
                    if (Math.random() < 0.016) {
                        console.log(`📍 Sample car: ${cars[0]?.driverName} @ ${(cars[0]?.lapPercentage * 100).toFixed(1)}% lap`);
                    }
                }

                // Update car count
                document.getElementById('car-count')!.textContent = cars.length.toString();
            });

            // Set up connection change callback
            liveConnector.onConnectionChanged((connected: boolean) => {
                if (!connected) {
                    updateStatus('⚠️ Lost connection to AMS2');
                    isLiveMode = false;
                    btnConnectAMS2.textContent = '🔌 Connect to AMS2';
                    document.getElementById('connection-status')!.textContent = 'Disconnected';
                    document.getElementById('status-dot')!.className = 'status-indicator disconnected';
                }
            });

            // Start polling at 60 FPS
            liveConnector.startPolling(16);
        } else {
            updateStatus('❌ Connection failed - Start bridge server: node server.js');
            btnConnectAMS2.textContent = '🔌 Connect to AMS2';
            btnConnectAMS2.disabled = false;
        }
    } catch (error) {
        console.error('Connection error:', error);
        updateStatus(`❌ Bridge server not running! Run: node server.js`);
        btnConnectAMS2.textContent = '🔌 Connect to AMS2';
        btnConnectAMS2.disabled = false;
    }
}

/**
 * Disconnect from AMS2
 */
function disconnectFromAMS2() {
    liveConnector.disconnect();
    isLiveMode = false;
    btnConnectAMS2.textContent = '🔌 Connect to AMS2';
    document.getElementById('connection-status')!.textContent = 'Disconnected';
    document.getElementById('status-dot')!.className = 'status-indicator disconnected';
    updateStatus('Disconnected from AMS2');
}

/**
 * Connect button handler
 */
btnConnectAMS2.addEventListener('click', () => {
    if (isLiveMode) {
        disconnectFromAMS2();
    } else {
        connectToAMS2();
    }
});

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
        const trackName = prompt('Enter track name (e.g., "Brands-Hatch-Indy"):');
        if (!trackName) return;

        trackRecorder.startRecording(trackName, 'ams2', 10); // Track 10 cars
        btnRecordTrack.textContent = '⏹️ Stop Recording';
        btnRecordTrack.classList.add('recording');
        statusMessage.textContent = `🔴 Recording ${trackName}... Tracking first 10 cars to complete a lap`;

        console.log(`🎬 Started recording: ${trackName}`);
        console.log(`   Waiting for cars to complete laps...`);
    }
});

// Initialize on load
init();
