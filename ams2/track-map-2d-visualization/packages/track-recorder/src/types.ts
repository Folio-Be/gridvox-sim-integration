/**
 * Recorded coordinate point with world position
 */
export interface CoordinatePoint {
    x: number;
    y: number;
    z: number;
    lapDistance: number;      // meters from start
    lapPercentage: number;    // 0.0 to 1.0
    speed: number;            // m/s
    timestamp: number;        // milliseconds
}

/**
 * Track bounds for normalization
 */
export interface TrackBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
}

/**
 * Corner definition with lap distance range
 */
export interface Corner {
    number: number;
    name: string;
    startPercent: number;
    endPercent: number;
}

/**
 * Final track JSON format
 */
export interface TrackData {
    name: string;
    codeName: string;
    length: number;              // meters
    recordedAt: string;          // ISO timestamp
    version: string;

    // Coordinates as percentage-based points
    coordinates: Array<{
        x: number;                 // Normalized 0-1000
        y: number;                 // Normalized 0-1000
        lapPercent: number;        // 0.0-1.0
    }>;

    // SVG path for Pixi.js rendering
    svgPath: string;

    // Track bounds for scaling
    bounds: TrackBounds;

    // Sector split percentages (from AMS2)
    sectors: number[];

    // Optional corner data (can be added manually)
    corners?: Corner[];
}

/**
 * Recording session state
 */
export interface RecordingSession {
    isRecording: boolean;
    trackName: string;
    trackLength: number;
    startTime: number;
    points: CoordinatePoint[];
    currentLap: number;
    previousLapDistance: number;
}
