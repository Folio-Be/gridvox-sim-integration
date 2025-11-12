"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailConverter = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
/**
 * Handles thumbnail discovery and conversion for AMS2 content
 */
class ThumbnailConverter {
    constructor(installPath) {
        this.installPath = installPath;
    }
    /**
     * Find track logo thumbnails
     */
    async findTrackLogos() {
        const logoMap = new Map();
        const logosPath = (0, path_1.join)(this.installPath, 'GUI', 'tracklogos');
        if (!(0, fs_1.existsSync)(logosPath)) {
            console.warn(`Track logos directory not found: ${logosPath}`);
            return logoMap;
        }
        try {
            const files = await (0, promises_1.readdir)(logosPath);
            for (const file of files) {
                if ((0, path_1.extname)(file).toLowerCase() === '.dds') {
                    const trackId = (0, path_1.basename)(file, '.dds');
                    logoMap.set(trackId, (0, path_1.join)(logosPath, file));
                }
            }
            console.log(`Found ${logoMap.size} track logos`);
        }
        catch (error) {
            console.error(`Error reading track logos: ${error}`);
        }
        return logoMap;
    }
    /**
     * Find track photo thumbnails
     */
    async findTrackPhotos() {
        const photoMap = new Map();
        const photosPath = (0, path_1.join)(this.installPath, 'GUI', 'trackphotos');
        if (!(0, fs_1.existsSync)(photosPath)) {
            console.warn(`Track photos directory not found: ${photosPath}`);
            return photoMap;
        }
        try {
            const files = await (0, promises_1.readdir)(photosPath);
            for (const file of files) {
                if ((0, path_1.extname)(file).toLowerCase() === '.dds') {
                    const trackId = (0, path_1.basename)(file, '.dds');
                    photoMap.set(trackId, (0, path_1.join)(photosPath, file));
                }
            }
            console.log(`Found ${photoMap.size} track photos`);
        }
        catch (error) {
            console.error(`Error reading track photos: ${error}`);
        }
        return photoMap;
    }
    /**
     * Find vehicle class logos
     */
    async findVehicleClassLogos() {
        const logoMap = new Map();
        const logosPath = (0, path_1.join)(this.installPath, 'GUI', 'VehicleClassLogosHUD');
        if (!(0, fs_1.existsSync)(logosPath)) {
            console.warn(`Vehicle class logos directory not found: ${logosPath}`);
            return logoMap;
        }
        try {
            const files = await (0, promises_1.readdir)(logosPath);
            for (const file of files) {
                if ((0, path_1.extname)(file).toLowerCase() === '.dds') {
                    const classId = (0, path_1.basename)(file, '.dds');
                    logoMap.set(classId, (0, path_1.join)(logosPath, file));
                }
            }
            console.log(`Found ${logoMap.size} vehicle class logos`);
        }
        catch (error) {
            console.error(`Error reading vehicle class logos: ${error}`);
        }
        return logoMap;
    }
    /**
     * Map thumbnails to tracks
     */
    mapTrackThumbnails(trackId, logos, photos) {
        // Try exact match first
        let thumbnail = logos.get(trackId);
        let photo = photos.get(trackId);
        // Try variations (lowercase, replace underscores, etc.)
        if (!thumbnail) {
            const variations = [
                trackId.toLowerCase(),
                trackId.replace(/_/g, '-'),
                trackId.split('_')[0], // Try just the track name without variation
            ];
            for (const variant of variations) {
                if (logos.has(variant)) {
                    thumbnail = logos.get(variant);
                    break;
                }
            }
        }
        if (!photo) {
            const variations = [
                trackId.toLowerCase(),
                trackId.replace(/_/g, '-'),
                trackId.split('_')[0],
            ];
            for (const variant of variations) {
                if (photos.has(variant)) {
                    photo = photos.get(variant);
                    break;
                }
            }
        }
        return { thumbnail, photo };
    }
    /**
     * Find vehicle thumbnails (for mods)
     * Base game doesn't include these, but mods may add them
     */
    async findVehicleThumbnails() {
        const thumbnailMap = new Map();
        const thumbnailsPath = (0, path_1.join)(this.installPath, 'GUI', 'vehicleimages');
        if (!(0, fs_1.existsSync)(thumbnailsPath)) {
            console.warn(`Vehicle thumbnails directory not found: ${thumbnailsPath}`);
            console.warn(`This is normal for base game - mods add thumbnails here`);
            return thumbnailMap;
        }
        try {
            const files = await (0, promises_1.readdir)(thumbnailsPath);
            for (const file of files) {
                if ((0, path_1.extname)(file).toLowerCase() === '.dds') {
                    const vehicleId = (0, path_1.basename)(file, '.dds');
                    thumbnailMap.set(vehicleId, (0, path_1.join)(thumbnailsPath, file));
                }
            }
            console.log(`Found ${thumbnailMap.size} vehicle thumbnails`);
        }
        catch (error) {
            console.error(`Error reading vehicle thumbnails: ${error}`);
        }
        return thumbnailMap;
    }
    /**
     * Find manufacturer posters/logos
     */
    async findManufacturerPosters() {
        const posterMap = new Map();
        const postersPath = (0, path_1.join)(this.installPath, 'GUI', 'ManufacturerPosters');
        if (!(0, fs_1.existsSync)(postersPath)) {
            console.warn(`Manufacturer posters directory not found: ${postersPath}`);
            return posterMap;
        }
        try {
            const files = await (0, promises_1.readdir)(postersPath);
            for (const file of files) {
                if ((0, path_1.extname)(file).toLowerCase() === '.dds') {
                    const manufacturer = (0, path_1.basename)(file, '.dds');
                    posterMap.set(manufacturer, (0, path_1.join)(postersPath, file));
                }
            }
            console.log(`Found ${posterMap.size} manufacturer posters`);
        }
        catch (error) {
            console.error(`Error reading manufacturer posters: ${error}`);
        }
        return posterMap;
    }
    /**
     * Map vehicle class logo to vehicle
     */
    mapVehicleClassLogo(vehicleClass, logos) {
        // Try exact match
        let logo = logos.get(vehicleClass);
        // Try variations
        if (!logo) {
            const variations = [
                vehicleClass.toLowerCase(),
                vehicleClass.toUpperCase(),
                vehicleClass.replace(/_/g, ''),
            ];
            for (const variant of variations) {
                if (logos.has(variant)) {
                    logo = logos.get(variant);
                    break;
                }
            }
        }
        return logo;
    }
    /**
     * Map manufacturer poster to vehicle
     */
    mapManufacturerLogo(manufacturer, posters) {
        // Try exact match
        let poster = posters.get(manufacturer);
        // Try variations
        if (!poster) {
            const variations = [
                manufacturer.toLowerCase(),
                manufacturer.toUpperCase(),
                manufacturer.replace(/\s+/g, ''),
                manufacturer.replace(/-/g, ''),
            ];
            for (const variant of variations) {
                if (posters.has(variant)) {
                    poster = posters.get(variant);
                    break;
                }
            }
        }
        return poster;
    }
    /**
     * Convert DDS to PNG (placeholder - requires additional dependencies)
     *
     * To implement actual conversion, add dependencies:
     * - npm install sharp @types/sharp
     * - Or use ImageMagick via child_process
     */
    async convertDDSToPNG(ddsPath, outputPath) {
        console.warn('DDS conversion not yet implemented. Install sharp or ImageMagick for conversion.');
        // TODO: Implement actual conversion
        // Example with sharp (requires dds plugin):
        // const sharp = require('sharp');
        // await sharp(ddsPath).toFile(outputPath);
        return false;
    }
}
exports.ThumbnailConverter = ThumbnailConverter;
//# sourceMappingURL=thumbnail-converter.js.map