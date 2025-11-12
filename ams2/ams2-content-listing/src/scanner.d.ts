import { ScanOptions, ScanResult, ContentDatabase } from './types';
/**
 * Main scanner class for AMS2 content
 */
export declare class AMS2ContentScanner {
    private vehicleParser;
    private trackParser;
    private installPath;
    constructor(installPath: string);
    /**
     * Scan all content in the AMS2 installation
     */
    scan(options?: Partial<ScanOptions>): Promise<ScanResult>;
    /**
     * Scan all vehicles
     */
    private scanVehicles;
    /**
     * Scan all tracks
     */
    private scanTracks;
    /**
     * Build the complete content database
     */
    private buildContentDatabase;
    /**
     * Format DLC ID into display name
     */
    private formatDLCName;
    /**
     * Get summary statistics
     */
    getSummary(database: ContentDatabase): string;
}
//# sourceMappingURL=scanner.d.ts.map