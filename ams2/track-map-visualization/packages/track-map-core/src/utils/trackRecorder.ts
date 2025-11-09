/**
 * Track Recorder
 * 
 * Records car positions during a lap to build track layouts
 * Similar to how Fast-F1 builds tracks from telemetry data
 * 
 * Multi-car averaging: Records the first 10 cars to complete a lap,
 * then averages their paths to create a more accurate track layout.
 */

import type { TrackDefinition, TrackPoint, CarPosition } from '../types';

interface CarLapData {
    carIndex: number;
    points: TrackPoint[];
    lastLapPercentage: number;
    lapCompleted: boolean;
}

export interface RecordingSession {
    trackName: string;
    sim: 'ams2' | 'iracing' | 'acc' | 'ac' | 'rf2';
    points: TrackPoint[];
    startTime: number;
    lapComplete: boolean;
    // Multi-car tracking
    carData: Map<number, CarLapData>;
    targetCarCount: number;
    completedCarCount: number;
}

export class TrackRecorder {
    private recording: RecordingSession | null = null;
    private sampleInterval = 50; // Record every 50ms
    private carSampleTimes: Map<number, number> = new Map();

    /**
     * Start recording a new track
     * @param targetCarCount Number of cars to track (default: 10)
     */
    startRecording(trackName: string, sim: 'ams2' | 'iracing' | 'acc' | 'ac' | 'rf2' = 'ams2', targetCarCount: number = 10): void {
        this.recording = {
            trackName,
            sim,
            points: [],
            startTime: Date.now(),
            lapComplete: false,
            carData: new Map(),
            targetCarCount,
            completedCarCount: 0,
        };
        this.carSampleTimes.clear();
        console.log(`🔴 Started multi-car recording: ${trackName}`);
        console.log(`   Tracking first ${targetCarCount} cars to complete a lap`);
    }

    /**
     * Record a car position sample
     * Call this on every telemetry update with ALL cars
     */
    recordSample(carPosition: CarPosition): void {
        if (!this.recording || this.recording.lapComplete) return;

        // Need world position for recording
        if (!carPosition.worldPosition) {
            return;
        }

        const carId = carPosition.carId;
        const now = Date.now();

        // Check if we've already tracked enough cars
        if (this.recording.completedCarCount >= this.recording.targetCarCount) {
            if (!this.recording.carData.has(carId)) {
                return; // Don't start tracking new cars
            }
        }

        // Get or create car data
        let carData = this.recording.carData.get(carId);
        if (!carData) {
            carData = {
                carIndex: carId,
                points: [],
                lastLapPercentage: carPosition.lapPercentage,
                lapCompleted: false,
            };
            this.recording.carData.set(carId, carData);
            console.log(`   🚗 Tracking car #${carPosition.carNumber} (${carPosition.driverName})`);
        }

        // Skip if this car already completed a lap
        if (carData.lapCompleted) {
            return;
        }

        // Sample at regular intervals per car
        const lastSampleTime = this.carSampleTimes.get(carId) || 0;
        if (now - lastSampleTime < this.sampleInterval) {
            return;
        }

        // Detect lap completion (wrapped around from ~1.0 to ~0.0)
        if (carPosition.lapPercentage < 0.1 && carData.lastLapPercentage > 0.9) {
            carData.lapCompleted = true;
            this.recording.completedCarCount++;
            console.log(`   ✅ Car #${carPosition.carNumber} completed lap (${this.recording.completedCarCount}/${this.recording.targetCarCount})`);
            console.log(`      Recorded ${carData.points.length} points`);

            // Check if we have enough cars
            if (this.recording.completedCarCount >= this.recording.targetCarCount) {
                this.recording.lapComplete = true;
                console.log(`\n🏁 All ${this.recording.targetCarCount} cars completed! Averaging paths...`);
            }
            return;
        }

        // Record the position
        const sector = carPosition.currentSector;
        carData.points.push({
            lapDistance: 0,
            lapPercentage: carPosition.lapPercentage,
            x: carPosition.worldPosition.x,
            y: carPosition.worldPosition.z, // Use Z as Y (top-down view)
            sector: sector,
        });

        carData.lastLapPercentage = carPosition.lapPercentage;
        this.carSampleTimes.set(carId, now);
    }

    /**
     * Stop recording and return the track definition
     * Averages all car paths to create the final track
     */
    stopRecording(): TrackDefinition | null {
        if (!this.recording) {
            console.warn('No recording in progress');
            return null;
        }

        const recording = this.recording;
        this.recording = null;

        // Get all completed car paths
        const completedCars = Array.from(recording.carData.values())
            .filter(car => car.lapCompleted && car.points.length >= 10);

        if (completedCars.length === 0) {
            console.warn('No cars completed a lap with enough points');
            return null;
        }

        console.log(`\n📊 Averaging ${completedCars.length} car paths...`);

        // Average the paths
        const averagedPoints = this.averageCarPaths(completedCars);

        if (averagedPoints.length < 10) {
            console.warn('Not enough averaged points');
            return null;
        }

        console.log(`   ✅ Created ${averagedPoints.length} averaged track points`);

        // Normalize and center the track
        const normalized = this.normalizeTrack(averagedPoints);

        return {
            id: `recorded_${recording.trackName.toLowerCase().replace(/\s+/g, '_')}`,
            name: recording.trackName,
            sim: recording.sim,
            length: this.estimateTrackLength(normalized),
            points: normalized,
            sectors: {
                sector1End: 0.33,
                sector2End: 0.67,
            },
            corners: [],
            startFinish: {
                lapPercentage: 0,
                canvasPosition: normalized[0] ? { x: normalized[0].x, y: normalized[0].y } : { x: 960, y: 540 },
            },
            metadata: {
                generatedBy: 'auto',
                generatedDate: new Date().toISOString(),
                version: '1.0',
            },
        };
    }

    /**
     * Average multiple car paths into a single track
     * Groups points by lap percentage and averages their positions
     */
    private averageCarPaths(carPaths: CarLapData[]): TrackPoint[] {
        // Find the car with the most points to use as reference
        const referenceCar = carPaths.reduce((prev, curr) =>
            curr.points.length > prev.points.length ? curr : prev
        );

        const numSamples = Math.min(200, referenceCar.points.length); // Use up to 200 points
        const averagedPoints: TrackPoint[] = [];

        // Sample evenly across the lap percentage
        for (let i = 0; i < numSamples; i++) {
            const targetLapPercentage = i / numSamples;

            let sumX = 0;
            let sumY = 0;
            let count = 0;
            let sector: 1 | 2 | 3 = 1;

            // Find the closest point from each car
            for (const car of carPaths) {
                const closestPoint = this.findClosestPoint(car.points, targetLapPercentage);
                if (closestPoint) {
                    sumX += closestPoint.x;
                    sumY += closestPoint.y;
                    sector = closestPoint.sector || sector;
                    count++;
                }
            }

            if (count > 0) {
                averagedPoints.push({
                    lapDistance: 0,
                    lapPercentage: targetLapPercentage,
                    x: sumX / count,
                    y: sumY / count,
                    sector,
                });
            }
        }

        return averagedPoints;
    }

    /**
     * Find the point closest to a target lap percentage
     */
    private findClosestPoint(points: TrackPoint[], targetPercentage: number): TrackPoint | null {
        if (points.length === 0) return null;

        let closestPoint = points[0];
        let minDiff = Math.abs(points[0].lapPercentage - targetPercentage);

        for (const point of points) {
            const diff = Math.abs(point.lapPercentage - targetPercentage);
            if (diff < minDiff) {
                minDiff = diff;
                closestPoint = point;
            }
        }

        return closestPoint;
    }

    /**
     * Normalize track to fit canvas (0-1920 x 0-1080)
     */
    private normalizeTrack(points: TrackPoint[]): TrackPoint[] {
        // Find bounds
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        const width = maxX - minX;
        const height = maxY - minY;

        // Scale to fit 1920x1080 with padding
        const padding = 100;
        const targetWidth = 1920 - (padding * 2);
        const targetHeight = 1080 - (padding * 2);

        const scale = Math.min(targetWidth / width, targetHeight / height);

        // Center on canvas
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const offsetX = (1920 - scaledWidth) / 2;
        const offsetY = (1080 - scaledHeight) / 2;

        return points.map(p => {
            // Calculate which sector based on position in lap
            let sector: 1 | 2 | 3;
            if (p.lapPercentage < 0.33) sector = 1;
            else if (p.lapPercentage < 0.67) sector = 2;
            else sector = 3;

            return {
                lapDistance: p.lapDistance,
                lapPercentage: p.lapPercentage,
                x: (p.x - minX) * scale + offsetX,
                y: (p.y - minY) * scale + offsetY,
                sector: p.sector || sector, // Use recorded sector or calculate
            };
        });
    }

    /**
     * Estimate track length from points
     */
    private estimateTrackLength(points: TrackPoint[]): number {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    /**
     * Check if currently recording
     */
    isRecording(): boolean {
        return this.recording !== null && !this.recording.lapComplete;
    }

    /**
     * Get recording status for UI
     */
    getStatus(): { recording: boolean; pointCount: number; elapsed: number; completedCars: number; targetCars: number } {
        if (!this.recording) {
            return { recording: false, pointCount: 0, elapsed: 0, completedCars: 0, targetCars: 0 };
        }

        return {
            recording: !this.recording.lapComplete,
            pointCount: this.recording.points.length,
            elapsed: Date.now() - this.recording.startTime,
            completedCars: this.recording.completedCarCount,
            targetCars: this.recording.targetCarCount,
        };
    }
}
