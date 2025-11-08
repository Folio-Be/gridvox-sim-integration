/**
 * AMS2 Telemetry Type Definitions
 * 
 * Based on Race-Element's AMS2 shared memory interface
 * Source: https://github.com/RiddleTime/Race-Element
 */

/**
 * Vector3 for world positions
 */
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

/**
 * AMS2 Participant Information
 * From mParticipantInfo array
 */
export interface AMS2Participant {
    /** Is this slot active? */
    mIsActive: number;

    /** Driver name */
    mName: string;

    /** World position (X/Y/Z coordinates) */
    mWorldPosition: Vector3;

    /** Current lap distance (meters from start/finish) */
    mCurrentLapDistance: number;

    /** Race position (1-based) */
    mRacePosition: number;

    /** Current lap number */
    mCurrentLap: number;

    /** Current sector (0-2, we'll convert to 1-3) */
    mCurrentSector: number;

    /** Pit mode: 0 = None, 1 = Entering, 2 = In Pit, 3 = Exiting */
    mPitMode: number;

    /** Race number */
    mRaceNumber?: number;
}

/**
 * AMS2 Shared Memory Structure
 * Main telemetry data from the game
 */
export interface AMS2SharedMemory {
    /** Number of active participants (1-64) */
    mNumParticipants: number;

    /** Array of participant data */
    mParticipantInfo: AMS2Participant[];

    /** Track length in meters */
    mTrackLength: number;

    /** Car class name */
    mCarClassName: string;

    /** Array of speeds for each car (m/s) */
    mSpeeds: number[];

    /** Which participant is being viewed (player index) */
    mViewedParticipantIndex: number;

    /** Track name */
    mTranslatedTrackVariation: {
        Data: string;
    };

    /** Game state (for determining if in menu, etc.) */
    mGameState: number;

    /** Session state */
    mSessionState: number;

    /** Race state */
    mRaceState: number;
}
