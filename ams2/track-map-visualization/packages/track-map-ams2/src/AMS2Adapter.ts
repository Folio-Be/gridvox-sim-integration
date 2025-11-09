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

        // POC-02 returns data with camelCase properties
        const numParticipants = (shared as any).numParticipants || shared.mNumParticipants || 0;
        const participants = (shared as any).participants || shared.mParticipantInfo || [];
        const trackLength = (shared as any).trackLength || shared.mTrackLength || 1;
        const viewedIndex = (shared as any).viewedParticipantIndex ?? shared.mViewedParticipantIndex ?? -1;
        const carClassName = (shared as any).carClassName || shared.mCarClassName || 'Unknown';

        for (let i = 0; i < numParticipants && i < participants.length; i++) {
            const participant = participants[i];

            // Skip inactive participants
            const isActive = participant.isActive ?? (participant.mIsActive !== 0);
            if (!isActive) {
                continue;
            }

            // Get participant properties (handle both camelCase and mPrefix)
            const name = participant.name || participant.mName || `Driver ${i + 1}`;
            const raceNumber = participant.raceNumber?.toString() || participant.mRaceNumber?.toString() || `${i + 1}`;
            const racePosition = participant.racePosition || participant.mRacePosition || i + 1;
            const currentLapDistance = participant.currentLapDistance ?? participant.mCurrentLapDistance ?? 0;
            const currentLap = participant.currentLap || participant.mCurrentLap || 0;
            const currentSector = participant.currentSector ?? participant.mCurrentSector ?? 0;
            const pitMode = participant.pitMode ?? participant.mPitMode ?? 0;

            // World position
            const worldPos = participant.worldPosition || participant.mWorldPosition || { x: 0, y: 0, z: 0 };

            positions.push({
                carId: i,
                driverName: name,
                carNumber: raceNumber,
                racePosition: racePosition,
                classPosition: racePosition, // AMS2 doesn't separate class position

                // PRIMARY: Calculate lap percentage from distance
                lapPercentage: this.calculateLapPercentage(currentLapDistance, trackLength),

                currentLap: currentLap,
                currentSector: this.normalizeSector(currentSector),

                carClass: carClassName,
                classColor: this.getClassColor(carClassName),

                isPlayer: i === viewedIndex,
                isInPit: pitMode !== 0,

                speed: ((shared as any).speeds?.[i] || (shared as any).mSpeeds?.[i] || 0) * 3.6, // Convert m/s to km/h

                // OPTIONAL: Include world position for debugging/track recording
                worldPosition: {
                    x: worldPos.x,
                    y: worldPos.y,
                    z: worldPos.z,
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
