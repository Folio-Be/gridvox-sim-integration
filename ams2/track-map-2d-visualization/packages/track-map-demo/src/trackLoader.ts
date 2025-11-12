/**
 * SimVox Track Loader - Load tracks from JSON files
 * 
 * This utility loads track data from:
 * - Generated tracks (demo oval)
 * - iRacing tracks (extracted from Virtual Pitwall)
 * - AMS2 recorded tracks (future, when recorder is built)
 */

import type { TrackDefinition } from '../../track-map-core/src/types';

export interface TrackMetadata {
    id: string;
    name: string;
    source: 'generated' | 'iracing' | 'ams2';
    category?: string;
}

/**
 * Available track catalog
 */
/**
 * Track catalog - list of available tracks
 * iRacing tracks removed - they were incomplete SVG segments
 * Use the track recorder to create your own tracks!
 */
export const TRACK_CATALOG: TrackMetadata[] = [
    // Recorded tracks will be added here as you create them
    // Example:
    // { id: 'ams2_spa', name: 'Spa-Francorchamps (Recorded)', source: 'ams2', category: 'F1' },
];

/**
 * Load track data from JSON file
 */
export async function loadTrackFromFile(trackId: string, source: 'iracing' | 'ams2'): Promise<any> {
    const basePath = source === 'ams2'
        ? '/recorded-tracks/ams2'
        : '/recorded-tracks/iracing';

    const response = await fetch(`${basePath}/${trackId}.json`);

    if (!response.ok) {
        throw new Error(`Failed to load track ${trackId}: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Convert iRacing/AMS2 JSON format to SimVox TrackDefinition
 */
export function convertToTrackDefinition(trackData: any): TrackDefinition {
    // Calculate approximate track length from coordinates
    const length = calculateTrackLength(trackData.coordinates);

    // Find bounds of the track coordinates
    const bounds = trackData.bounds || calculateBounds(trackData.coordinates);

    console.log('Track bounds:', bounds);
    console.log('Original coordinates sample:', trackData.coordinates.slice(0, 3));

    // Scale and center coordinates to fit canvas (1920x1080)
    const canvasWidth = 1920;
    const canvasHeight = 1080;
    const padding = 100; // Padding from edges

    const trackWidth = bounds.maxX - bounds.minX;
    const trackHeight = bounds.maxY - bounds.minY;

    console.log('Track dimensions:', { width: trackWidth, height: trackHeight });

    // Calculate scale to fit track in canvas with padding
    const scaleX = (canvasWidth - 2 * padding) / trackWidth;
    const scaleY = (canvasHeight - 2 * padding) / trackHeight;
    const scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio

    console.log('Scale factors:', { scaleX, scaleY, scale });

    // Calculate offsets to center the track
    const scaledWidth = trackWidth * scale;
    const scaledHeight = trackHeight * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2 - bounds.minX * scale;
    const offsetY = (canvasHeight - scaledHeight) / 2 - bounds.minY * scale;

    console.log('Offsets:', { offsetX, offsetY });

    // Convert coordinates to TrackPoints with lap percentage and scaling
    const points = trackData.coordinates.map((coord: any, index: number) => {
        const lapPercentage = index / trackData.coordinates.length;
        let sector: 1 | 2 | 3 = 1;
        if (lapPercentage >= 0.67) sector = 3;
        else if (lapPercentage >= 0.33) sector = 2;

        return {
            lapDistance: lapPercentage * length,
            lapPercentage,
            x: coord.x * scale + offsetX,
            y: coord.y * scale + offsetY,
            sector,
        };
    });

    console.log('Scaled coordinates sample:', points.slice(0, 3));

    return {
        id: trackData.name.toLowerCase().replace(/\s+/g, '_'),
        name: trackData.name,
        sim: 'ams2',
        length,
        points,
        sectors: {
            sector1End: trackData.sectors?.[0] || 0.33,
            sector2End: trackData.sectors?.[1] || 0.67,
        },
        corners: trackData.corners || [],
        startFinish: {
            lapPercentage: 0,
            canvasPosition: points[0] ? { x: points[0].x, y: points[0].y } : { x: 0, y: 0 },
        },
        metadata: {
            generatedBy: 'auto',
            generatedDate: new Date().toISOString(),
            version: '1.0',
        },
    };
}

/**
 * Calculate bounds from coordinates
 */
function calculateBounds(coordinates: Array<{ x: number, y: number }>): any {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    coordinates.forEach(coord => {
        minX = Math.min(minX, coord.x);
        maxX = Math.max(maxX, coord.x);
        minY = Math.min(minY, coord.y);
        maxY = Math.max(maxY, coord.y);
    });

    return { minX, maxX, minY, maxY };
}

/**
 * Calculate track length from coordinates
 */
function calculateTrackLength(coordinates: Array<{ x: number, y: number }>): number {
    let totalLength = 0;

    for (let i = 1; i < coordinates.length; i++) {
        const dx = coordinates[i].x - coordinates[i - 1].x;
        const dy = coordinates[i].y - coordinates[i - 1].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Close the loop
    const dx = coordinates[0].x - coordinates[coordinates.length - 1].x;
    const dy = coordinates[0].y - coordinates[coordinates.length - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);

    // Scale to approximate real-world meters (rough estimate)
    return Math.round(totalLength * 5); // Adjust multiplier based on coordinate scale
}

/**
 * Generate demo oval track (fallback)
 */
export function generateOvalTrack(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    points: number = 100
): Array<{ x: number; y: number }> {
    const trackPoints = [];

    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        trackPoints.push({
            x: centerX + Math.cos(angle) * radiusX,
            y: centerY + Math.sin(angle) * radiusY,
        });
    }

    return trackPoints;
}

/**
 * Main track loader - handles all sources
 */
export async function loadTrack(trackId: string): Promise<TrackDefinition> {
    const metadata = TRACK_CATALOG.find(t => t.id === trackId);

    if (!metadata) {
        throw new Error(`Track not found: ${trackId}`);
    }

    // Generated tracks
    if (metadata.source === 'generated') {
        if (trackId === 'oval') {
            const points = generateOvalTrack(960, 540, 400, 300).map((pt, idx) => {
                const lapPercentage = idx / 100;
                let sector: 1 | 2 | 3 = 1;
                if (lapPercentage >= 0.67) sector = 3;
                else if (lapPercentage >= 0.33) sector = 2;

                return {
                    lapDistance: lapPercentage * 2000,
                    lapPercentage,
                    x: pt.x,
                    y: pt.y,
                    sector,
                };
            });

            return {
                id: 'demo_oval',
                name: 'Demo Oval Track',
                sim: 'ams2',
                length: 2000,
                points,
                sectors: { sector1End: 0.33, sector2End: 0.67 },
                corners: [],
                startFinish: {
                    lapPercentage: 0,
                    canvasPosition: { x: points[0].x, y: points[0].y },
                },
                metadata: {
                    generatedBy: 'manual',
                    generatedDate: new Date().toISOString(),
                    version: '1.0',
                },
            };
        }
    }

    // iRacing or AMS2 tracks - load from JSON
    if (metadata.source === 'iracing' || metadata.source === 'ams2') {
        const trackData = await loadTrackFromFile(trackId, metadata.source);
        return convertToTrackDefinition(trackData);
    }

    throw new Error(`Unknown track source: ${metadata.source}`);
}

/**
 * Get tracks by category
 */
export function getTracksByCategory(): Map<string, TrackMetadata[]> {
    const categories = new Map<string, TrackMetadata[]>();

    categories.set('Generated', TRACK_CATALOG.filter(t => t.source === 'generated'));

    const iracingTracks = TRACK_CATALOG.filter(t => t.source === 'iracing');
    const categoryGroups = new Map<string, TrackMetadata[]>();

    iracingTracks.forEach(track => {
        const cat = track.category || 'Other';
        if (!categoryGroups.has(cat)) {
            categoryGroups.set(cat, []);
        }
        categoryGroups.get(cat)!.push(track);
    });

    categoryGroups.forEach((tracks, category) => {
        categories.set(`iRacing - ${category}`, tracks);
    });

    const ams2Tracks = TRACK_CATALOG.filter(t => t.source === 'ams2');
    if (ams2Tracks.length > 0) {
        categories.set('AMS2 Recorded', ams2Tracks);
    }

    return categories;
}
