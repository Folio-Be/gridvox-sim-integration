/**
 * Handles thumbnail discovery and conversion for AMS2 content
 */
export declare class ThumbnailConverter {
    private installPath;
    constructor(installPath: string);
    /**
     * Find track logo thumbnails
     */
    findTrackLogos(): Promise<Map<string, string>>;
    /**
     * Find track photo thumbnails
     */
    findTrackPhotos(): Promise<Map<string, string>>;
    /**
     * Find vehicle class logos
     */
    findVehicleClassLogos(): Promise<Map<string, string>>;
    /**
     * Map thumbnails to tracks
     */
    mapTrackThumbnails(trackId: string, logos: Map<string, string>, photos: Map<string, string>): {
        thumbnail?: string;
        photo?: string;
    };
    /**
     * Find vehicle thumbnails (for mods)
     * Base game doesn't include these, but mods may add them
     */
    findVehicleThumbnails(): Promise<Map<string, string>>;
    /**
     * Find manufacturer posters/logos
     */
    findManufacturerPosters(): Promise<Map<string, string>>;
    /**
     * Map vehicle class logo to vehicle
     */
    mapVehicleClassLogo(vehicleClass: string, logos: Map<string, string>): string | undefined;
    /**
     * Map manufacturer poster to vehicle
     */
    mapManufacturerLogo(manufacturer: string, posters: Map<string, string>): string | undefined;
    /**
     * Convert DDS to PNG (placeholder - requires additional dependencies)
     *
     * To implement actual conversion, add dependencies:
     * - npm install sharp @types/sharp
     * - Or use ImageMagick via child_process
     */
    convertDDSToPNG(ddsPath: string, outputPath: string): Promise<boolean>;
}
//# sourceMappingURL=thumbnail-converter.d.ts.map