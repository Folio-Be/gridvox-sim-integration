/**
 * AMS2 Adapter
 * 
 * Converts AMS2 shared memory telemetry to universal CarPosition format
 * Based on proven patterns from Race-Element's Ams2Mapper.cs
 */

import type { CarPosition } from '@gridvox/track-map-core';
import type { AMS2SharedMemory, AMS2Participant } from './types/AMS2Telemetry.js';

export class AMS2Adapter {
    /**
     * Convert AMS2 telemetry to universal CarPosition array
     * 
     * This is the main integration point - takes AMS2 shared memory
     * and produces sim-agnostic data for the core library
     */
    toCarPositions(shared: AMS2SharedMemory): CarPosition[] {
        const positions: CarPosition[] = [];

        for (let i = 0; i < shared.mNumParticipants; i++) {
            const participant = shared.mParticipantInfo[i];

            // Skip inactive participants
            if (participant.mIsActive === 0) {
                continue;
            }

            positions.push({
                carId: i,
                driverName: participant.mName || `Driver ${i + 1}`,
                carNumber: participant.mRaceNumber?.toString() || `${i + 1}`,
                racePosition: participant.mRacePosition,
                classPosition: participant.mRacePosition, // AMS2 doesn't separate class position

                // PRIMARY: Calculate lap percentage from distance
                // This is the key transformation - distance (meters) to percentage (0-1)
                lapPercentage: this.calculateLapPercentage(
                    participant.mCurrentLapDistance,
                    shared.mTrackLength
                ),

                currentLap: participant.mCurrentLap,
                currentSector: this.normalizeSector(participant.mCurrentSector),

                carClass: shared.mCarClassName || 'Unknown',
                classColor: this.getClassColor(shared.mCarClassName),

                isPlayer: i === shared.mViewedParticipantIndex,
                isInPit: participant.mPitMode !== 0, // 0 = None, 1+ = In pit

                speed: shared.mSpeeds[i] * 3.6, // Convert m/s to km/h

                // OPTIONAL: Include world position for debugging/track recording
                worldPosition: {
                    x: participant.mWorldPosition.x,
                    y: participant.mWorldPosition.y,
                    z: participant.mWorldPosition.z,
                },
            });
        }

        return positions;
    }

    /**
     * Calculate lap percentage (0.0 - 1.0) from distance
     * This is accurate to ~6 decimal places, giving sub-pixel precision
     * 
     * Example: 5234.5m / 5891m = 0.888451
     */
    private calculateLapPercentage(lapDistance: number, trackLength: number): number {
        if (trackLength === 0) return 0;

        // Clamp to [0, 1] range to handle edge cases
        const percentage = lapDistance / trackLength;
        return Math.max(0, Math.min(1, percentage));
    }

    /**
     * Convert AMS2 sector (0-2) to standard sector (1-3)
     */
    private normalizeSector(ams2Sector: number): 1 | 2 | 3 {
        // AMS2 uses 0-indexed sectors, we use 1-indexed
        const normalized = ams2Sector + 1;

        // Clamp to valid range
        if (normalized < 1) return 1;
        if (normalized > 3) return 3;

        return normalized as 1 | 2 | 3;
    }

    /**
     * Map AMS2 car class to hex color
     * Can be customized per user preference
     */
    private getClassColor(className: string): string {
        const colorMap: Record<string, string> = {
            'GT3': '#FF6B6B',
            'GT4': '#4ECDC4',
            'LMP2': '#45B7D1',
            'LMP3': '#96CEB4',
            'Formula V10': '#FFA07A',
            'Formula V12': '#F77F00',
            'Stock Car': '#06FFA5',
            'Touring': '#118AB2',
        };

        return colorMap[className] || '#FFFFFF'; // Default to white
    }

    /**
     * Calculate sector boundaries from track length
     * Can be overridden with actual sector split data if available
     */
    getSectorBoundaries(trackLength: number): { sector1End: number; sector2End: number } {
        // Default to 33%/66% split
        // TODO: Load actual sector splits from track data if available
        return {
            sector1End: 0.33,
            sector2End: 0.67,
        };
    }
}
