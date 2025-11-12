/**
 * Type definitions for AMS2 content listing
 */
export interface Vehicle {
    /** Internal vehicle ID (e.g., "porsche_963_gtp") */
    id: string;
    /** Display name (e.g., "Porsche 963") */
    displayName: string;
    /** Manufacturer/brand (e.g., "Porsche") */
    manufacturer: string;
    /** Model name (e.g., "963") */
    model: string;
    /** Vehicle class (e.g., "LMDh", "GT3N") */
    vehicleClass: string;
    /** Vehicle group (e.g., "Hypercars", "GT3") */
    vehicleGroup: string;
    /** Vehicle year */
    year: number | null;
    /** DLC ID or "base" for base game content */
    dlcId: string;
    /** Country of origin */
    country: string;
    /** Price in game currency */
    price: number;
    /** Vehicle description */
    description: string;
    /** Path to thumbnail image (if available) */
    thumbnail?: string;
    /** Path to manufacturer logo/poster (if available) */
    manufacturerLogo?: string;
    /** Whether this is mod content */
    isModContent: boolean;
    /** Original .crd file path */
    filePath: string;
}
export interface Track {
    /** Internal track ID (e.g., "Interlagos_GP") */
    id: string;
    /** Display name (e.g., "Interlagos GP") */
    displayName: string;
    /** Location/city (e.g., "Brazil") */
    location: string;
    /** Country code (e.g., "BR") */
    country: string;
    /** Track length in meters */
    length: number;
    /** Track group (e.g., "Interlagos") */
    trackGroup: string;
    /** Track variation/layout (e.g., "Interlagos_GP") */
    variation: string;
    /** Track year/version */
    year: number | null;
    /** DLC ID or "base" for base game content */
    dlcId: string;
    /** Track type (e.g., "Circuit", "Rally") */
    trackType: string;
    /** Maximum AI participants */
    maxAI: number;
    /** Number of turns */
    turns: number;
    /** Latitude coordinate */
    latitude?: number;
    /** Longitude coordinate */
    longitude?: number;
    /** Path to thumbnail/logo (if available) */
    thumbnail?: string;
    /** Path to track photo (if available) */
    photo?: string;
    /** Whether this is mod content */
    isModContent: boolean;
    /** Original .trd file path */
    filePath: string;
}
export interface VehicleClass {
    /** Class ID (e.g., "GT3", "LMDh") */
    id: string;
    /** Display name */
    displayName: string;
    /** Number of vehicles in this class */
    vehicleCount: number;
    /** Path to class logo (if available) */
    logo?: string;
}
export interface DLC {
    /** DLC ID (e.g., "porschepack", "lemanspack") */
    id: string;
    /** DLC display name */
    displayName: string;
    /** Number of vehicles included */
    vehicleCount: number;
    /** Number of tracks included */
    trackCount: number;
    /** Whether this DLC is installed */
    isInstalled: boolean;
}
export interface ContentDatabase {
    /** All vehicles found */
    vehicles: Vehicle[];
    /** All tracks found */
    tracks: Track[];
    /** List of unique vehicle classes */
    vehicleClasses: VehicleClass[];
    /** List of detected DLCs */
    dlcs: DLC[];
    /** Timestamp of last scan */
    lastScanned: Date;
    /** AMS2 installation path */
    installPath: string;
    /** Number of mod vehicles */
    modVehicleCount: number;
    /** Number of mod tracks */
    modTrackCount: number;
}
export interface ScanOptions {
    /** AMS2 installation path */
    installPath: string;
    /** Whether to convert thumbnails to PNG */
    convertThumbnails?: boolean;
    /** Output directory for converted thumbnails */
    thumbnailOutputDir?: string;
    /** Whether to include mod content */
    includeMods?: boolean;
    /** Whether to scan for thumbnails */
    scanThumbnails?: boolean;
}
export interface ScanResult {
    /** Content database */
    database: ContentDatabase;
    /** Scan statistics */
    stats: {
        vehiclesScanned: number;
        tracksScanned: number;
        vehiclesParsed: number;
        tracksParsed: number;
        errors: string[];
        duration: number;
    };
}
export interface ConversionManifestFile {
    /** Path to generated PNG file */
    pngPath: string;
    /** Original DDS file size in bytes */
    fileSize: number;
    /** Last modification time of DDS file (Unix timestamp) */
    mtime: number;
    /** When this file was converted */
    converted: Date;
}
export interface ConversionManifest {
    /** Manifest version for future compatibility */
    version: string;
    /** When the conversion was last run */
    lastConverted: Date;
    /** AMS2 installation path */
    installPath: string;
    /** Output directory for PNG files */
    outputDir: string;
    /** Map of DDS file path to conversion info */
    files: Record<string, ConversionManifestFile>;
}
export interface ConversionResult {
    /** Number of files converted */
    converted: number;
    /** Number of files skipped (already up to date) */
    skipped: number;
    /** Number of errors encountered */
    errors: number;
    /** List of error messages */
    errorMessages: string[];
    /** Conversion duration in milliseconds */
    duration: number;
    /** List of converted file paths */
    convertedFiles: string[];
}
//# sourceMappingURL=types.d.ts.map