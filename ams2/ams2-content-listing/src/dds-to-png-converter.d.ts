import { ConversionManifest, ConversionResult, ConversionManifestFile } from './types';
import './vendor/utex/UTEX.js';
import './vendor/utex/UTEX.DDS.js';
/**
 * DDS to PNG converter with delta update support
 */
export declare class DDSToPNGConverter {
    private installPath;
    private outputDir;
    private manifestPath;
    constructor(installPath: string, outputDir?: string);
    /**
     * Convert a single DDS file to PNG
     */
    convertSingleDDS(ddsPath: string, outputPath: string): Promise<void>;
    /**
     * Load existing conversion manifest
     */
    loadManifest(): Promise<ConversionManifest | null>;
    /**
     * Save conversion manifest
     */
    saveManifest(manifest: ConversionManifest): Promise<void>;
    /**
     * Create a new empty manifest
     */
    createEmptyManifest(): ConversionManifest;
    /**
     * Get file stats (size and modification time)
     */
    getFileStats(filePath: string): Promise<{
        size: number;
        mtime: number;
    }>;
    /**
     * Check if a DDS file needs to be converted
     */
    needsConversion(ddsPath: string, manifestEntry: ConversionManifestFile | undefined): Promise<boolean>;
    /**
     * Convert all DDS thumbnails to PNG
     */
    convertEverything(): Promise<ConversionResult>;
    /**
     * Convert only new or changed DDS files (delta update)
     */
    convertDelta(): Promise<ConversionResult>;
    /**
     * Get PNG path for a DDS file (if it exists in manifest)
     */
    getPNGPath(ddsPath: string): Promise<string | null>;
}
//# sourceMappingURL=dds-to-png-converter.d.ts.map