import { Track } from '../types';
/**
 * Parser for AMS2 track .trd files
 */
export declare class TrackParser {
    private xmlParser;
    constructor();
    /**
     * Parse a track .trd file
     */
    parseTrackFile(filePath: string): Promise<Track | null>;
    /**
     * Extract DLC information from parsed tracks
     */
    extractDLCs(tracks: Track[]): Map<string, {
        trackCount: number;
    }>;
    /**
     * Group tracks by track group
     */
    groupByTrackGroup(tracks: Track[]): Map<string, Track[]>;
}
//# sourceMappingURL=track-parser.d.ts.map