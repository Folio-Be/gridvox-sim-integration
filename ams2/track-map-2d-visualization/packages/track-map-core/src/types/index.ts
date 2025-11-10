/**
 * Track Map Core - Type Definitions
 * 
 * Universal data formats for track map visualization
 * All sim adapters must convert to these interfaces
 */

/**
 * Universal car position format
 * Sim adapters convert their telemetry to this standard format
 */
export interface CarPosition {
    /** Unique car identifier (per session) */
    carId: number;

    /** Driver name */
    driverName: string;

    /** Car number displayed on track */
    carNumber: string;

    /** Overall race position (1-64) */
    racePosition: number;

    /** Class-specific position (for multiclass racing) */
    classPosition: number;

    /** 
     * PRIMARY: Lap completion percentage (0.0 - 1.0)
     * This is the main positioning method - accurate to sub-pixel precision
     */
    lapPercentage: number;

    /** Current lap number */
    currentLap: number;

    /** Current sector (1, 2, or 3) */
    currentSector: 1 | 2 | 3;

    /** Car class/category (e.g., "GT3", "LMP2") */
    carClass: string;

    /** Hex color for this car class (e.g., "#FF6B6B") */
    classColor: string;

    /** Is this the player's car? */
    isPlayer: boolean;

    /** Is car currently in pit lane? */
    isInPit: boolean;

    /** Current speed in km/h */
    speed: number;

    /** 
     * OPTIONAL: World coordinates for debugging/validation
     * Not used for rendering, but useful for track recording
     */
    worldPosition?: {
        x: number;
        y: number;
        z: number;
    };
}

/**
 * Individual track point with position data
 */
export interface TrackPoint {
    /** Lap distance at this point (meters from start/finish) */
    lapDistance: number;

    /** Normalized lap percentage (0.0 - 1.0) */
    lapPercentage: number;

    /** Canvas X coordinate */
    x: number;

    /** Canvas Y coordinate */
    y: number;

    /** Which sector this point belongs to */
    sector: 1 | 2 | 3;

    /** Optional: Corner name if this point is within a turn */
    cornerName?: string;
}

/**
 * Corner/turn definition with LLM-friendly metadata
 */
export interface Corner {
    /** Corner identifier (e.g., "T1", "copse", "eau_rouge") */
    id: string;

    /** Display name (e.g., "Turn 1", "Copse Corner", "Eau Rouge") */
    name: string;

    /** Lap percentage where corner entry begins */
    startPercentage: number;

    /** Lap percentage where corner exit completes */
    endPercentage: number;

    /** Canvas position for corner label */
    labelPosition: {
        x: number;
        y: number;
    };

    /** Corner number (1-based sequential) */
    number: number;

    /** Which sector this corner is in */
    sector: 1 | 2 | 3;

    /** 
     * Optional: Human-readable description for LLM context
     * e.g., "Fast right-hander, good overtaking opportunity"
     */
    description?: string;

    /**
     * Optional: Typical speed through corner (km/h)
     * Useful for LLM to describe corner difficulty
     */
    typicalSpeed?: number;
}

/**
 * Complete track definition (generated or manual)
 */
export interface TrackDefinition {
    /** Unique track identifier (e.g., "silverstone_gp", "spa_francorchamps") */
    id: string;

    /** Human-readable track name */
    name: string;

    /** Which sim this track is for */
    sim: "ams2" | "iracing" | "acc" | "ac" | "rf2";

    /** Track length in meters */
    length: number;

    /** 
     * Track path points (typically hundreds to thousands)
     * More points = smoother rendering
     */
    points: TrackPoint[];

    /** Sector boundary percentages */
    sectors: {
        /** Where sector 1 ends / sector 2 begins (e.g., 0.33) */
        sector1End: number;
        /** Where sector 2 ends / sector 3 begins (e.g., 0.67) */
        sector2End: number;
    };

    /** Corner definitions for LLM integration */
    corners: Corner[];

    /** Start/finish line position */
    startFinish: {
        lapPercentage: 0;
        canvasPosition: {
            x: number;
            y: number;
        };
    };

    /** Track metadata */
    metadata: {
        /** How was this track generated? */
        generatedBy: "auto" | "manual";
        /** When was it created? */
        generatedDate: string;
        /** Schema version for compatibility */
        version: string;
    };
}

/**
 * Track context for LLM integration
 * Provides rich data for crew radio AI responses
 */
export interface TrackContext {
    /** Current track information */
    track: {
        name: string;
        layout: string;
        length: number;
    };

    /** Player's current location and context */
    player: {
        /** Current lap percentage (0.0 - 1.0) */
        lapPercentage: number;
        /** Current sector */
        sector: 1 | 2 | 3;
        /** Corner player is currently in (null if on straight) */
        corner: Corner | null;
        /** Distance to next corner (meters) */
        distanceToNextCorner: number;
        /** Distance remaining to finish line (meters) */
        distanceToFinish: number;
    };

    /** Cars near the player */
    nearby: {
        /** Cars ahead within ~5% lap distance */
        ahead: CarPosition[];
        /** Cars behind within ~5% lap distance */
        behind: CarPosition[];
    };

    /** Upcoming overtaking opportunities */
    overtakeZones: Array<{
        cornerName: string;
        distance: number;
        difficulty: "easy" | "medium" | "hard";
    }>;
}
