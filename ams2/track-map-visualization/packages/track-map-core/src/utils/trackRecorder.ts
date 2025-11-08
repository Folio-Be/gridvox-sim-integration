/**
 * Track Recorder
 * 
 * Records car positions during a lap to build track layouts
 * Similar to how Fast-F1 builds tracks from telemetry data
 */

import type { TrackDefinition, TrackPoint, CarPosition } from '../types';

export interface RecordingSession {
    trackName: string;
    sim: 'ams2' | 'iracing' | 'acc' | 'ac' | 'rf2';
    points: TrackPoint[];
    startTime: number;
    lapComplete: boolean;
}

export class TrackRecorder {
    private recording: RecordingSession | null = null;
    private lastLapDistance = 0;
    private sampleInterval = 50; // Record every 50ms
    private lastSampleTime = 0;

    /**
     * Start recording a new track
     */
    startRecording(trackName: string, sim: 'ams2' | 'iracing' | 'acc' | 'ac' | 'rf2' = 'ams2'): void {
        this.recording = {
            trackName,
            sim,
            points: [],
            startTime: Date.now(),
            lapComplete: false,
        };
        this.lastLapDistance = 0;
        this.lastSampleTime = 0;
        console.log(`🔴 Started recording: ${trackName}`);
    }

    /**
     * Record a car position sample
     * Call this on every telemetry update
     */
    recordSample(carPosition: CarPosition): void {
        if (!this.recording || this.recording.lapComplete) return;

        const now = Date.now();

        // Sample at regular intervals
        if (now - this.lastSampleTime < this.sampleInterval) {
            return;
        }

        // Need world position for recording
        if (!carPosition.worldPosition) {
            console.warn('CarPosition missing worldPosition - cannot record track');
            return;
        }

        // Detect lap completion (wrapped around from ~1.0 to ~0.0)
        if (carPosition.lapPercentage < 0.1 && this.lastLapDistance > 0.9) {
            this.recording.lapComplete = true;
            console.log(`✅ Lap complete! Recorded ${this.recording.points.length} points`);
            return;
        }

        // Record the position
        const sector = carPosition.currentSector;
        this.recording.points.push({
            lapDistance: 0, // Will be calculated later
            lapPercentage: carPosition.lapPercentage,
            x: carPosition.worldPosition.x,
            y: carPosition.worldPosition.z, // Use Z as Y (top-down view)
            sector: sector,
        });

        this.lastLapDistance = carPosition.lapPercentage;
        this.lastSampleTime = now;
    }

    /**
     * Stop recording and return the track definition
     */
    stopRecording(): TrackDefinition | null {
        if (!this.recording) {
            console.warn('No recording in progress');
            return null;
        }

        const recording = this.recording;
        this.recording = null;

        if (recording.points.length < 10) {
            console.warn('Not enough points recorded');
            return null;
        }

        // Normalize and center the track
        const normalized = this.normalizeTrack(recording.points);

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
            corners: [], // Can be detected later from speed/angle changes
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
    getStatus(): { recording: boolean; pointCount: number; elapsed: number } {
        if (!this.recording) {
            return { recording: false, pointCount: 0, elapsed: 0 };
        }

        return {
            recording: !this.recording.lapComplete,
            pointCount: this.recording.points.length,
            elapsed: Date.now() - this.recording.startTime,
        };
    }
}
