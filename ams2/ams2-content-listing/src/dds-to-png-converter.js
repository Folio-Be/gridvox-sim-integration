"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DDSToPNGConverter = void 0;
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const sharp_1 = __importDefault(require("sharp"));
const thumbnail_converter_1 = require("./thumbnail-converter");
// Load UTEX.js (global namespace)
// @ts-ignore
require("./vendor/utex/UTEX.js");
// @ts-ignore
require("./vendor/utex/UTEX.DDS.js");
/**
 * DDS to PNG converter with delta update support
 */
class DDSToPNGConverter {
    constructor(installPath, outputDir) {
        this.installPath = installPath;
        this.outputDir = outputDir || (0, path_1.join)(installPath, '..', 'ams2-thumbnails-png');
        this.manifestPath = (0, path_1.join)(this.outputDir, 'conversion-manifest.json');
    }
    /**
     * Convert a single DDS file to PNG
     */
    async convertSingleDDS(ddsPath, outputPath) {
        // Read DDS file
        const ddsBuffer = await (0, promises_1.readFile)(ddsPath);
        const arrayBuffer = ddsBuffer.buffer.slice(ddsBuffer.byteOffset, ddsBuffer.byteOffset + ddsBuffer.byteLength);
        // Decode using UTEX.DDS
        const images = UTEX.DDS.decode(arrayBuffer);
        if (!images || images.length === 0) {
            throw new Error(`No images found in DDS file: ${ddsPath}`);
        }
        // Get the first mipmap level (main image)
        const mainImage = images[0];
        const { width, height, image } = mainImage;
        // Ensure output directory exists
        const outDir = (0, path_1.dirname)(outputPath);
        if (!(0, fs_1.existsSync)(outDir)) {
            await (0, promises_1.mkdir)(outDir, { recursive: true });
        }
        // Convert RGBA buffer to PNG using sharp
        await (0, sharp_1.default)(Buffer.from(image), {
            raw: {
                width,
                height,
                channels: 4, // RGBA
            },
        })
            .png()
            .toFile(outputPath);
    }
    /**
     * Load existing conversion manifest
     */
    async loadManifest() {
        if (!(0, fs_1.existsSync)(this.manifestPath)) {
            return null;
        }
        try {
            const content = await (0, promises_1.readFile)(this.manifestPath, 'utf8');
            const manifest = JSON.parse(content);
            // Convert date strings back to Date objects
            manifest.lastConverted = new Date(manifest.lastConverted);
            for (const filePath in manifest.files) {
                manifest.files[filePath].converted = new Date(manifest.files[filePath].converted);
            }
            return manifest;
        }
        catch (error) {
            console.error('Failed to load manifest:', error);
            return null;
        }
    }
    /**
     * Save conversion manifest
     */
    async saveManifest(manifest) {
        if (!(0, fs_1.existsSync)(this.outputDir)) {
            await (0, promises_1.mkdir)(this.outputDir, { recursive: true });
        }
        await (0, promises_1.writeFile)(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    }
    /**
     * Create a new empty manifest
     */
    createEmptyManifest() {
        return {
            version: '1.0.0',
            lastConverted: new Date(),
            installPath: this.installPath,
            outputDir: this.outputDir,
            files: {},
        };
    }
    /**
     * Get file stats (size and modification time)
     */
    async getFileStats(filePath) {
        const stats = await (0, promises_1.stat)(filePath);
        return {
            size: stats.size,
            mtime: stats.mtimeMs,
        };
    }
    /**
     * Check if a DDS file needs to be converted
     */
    async needsConversion(ddsPath, manifestEntry) {
        // No manifest entry = needs conversion
        if (!manifestEntry) {
            return true;
        }
        // Check if PNG file exists
        if (!(0, fs_1.existsSync)(manifestEntry.pngPath)) {
            return true;
        }
        // Check if DDS file has changed
        try {
            const stats = await this.getFileStats(ddsPath);
            return stats.size !== manifestEntry.fileSize || stats.mtime !== manifestEntry.mtime;
        }
        catch (error) {
            // If we can't stat the DDS file, assume it needs conversion
            return true;
        }
    }
    /**
     * Convert all DDS thumbnails to PNG
     */
    async convertEverything() {
        const startTime = Date.now();
        const result = {
            converted: 0,
            skipped: 0,
            errors: 0,
            errorMessages: [],
            duration: 0,
            convertedFiles: [],
        };
        console.log('Starting full DDS to PNG conversion...');
        console.log(`Installation: ${this.installPath}`);
        console.log(`Output: ${this.outputDir}`);
        console.log();
        // Create thumbnail converter to find all DDS files
        const thumbnailConverter = new thumbnail_converter_1.ThumbnailConverter(this.installPath);
        // Find all DDS files
        console.log('Scanning for DDS files...');
        const trackLogos = await thumbnailConverter.findTrackLogos();
        const trackPhotos = await thumbnailConverter.findTrackPhotos();
        const classLogos = await thumbnailConverter.findVehicleClassLogos();
        console.log(`Found ${trackLogos.size} track logos`);
        console.log(`Found ${trackPhotos.size} track photos`);
        console.log(`Found ${classLogos.size} vehicle class logos`);
        console.log();
        // Create new manifest
        const manifest = this.createEmptyManifest();
        // Convert track logos
        console.log('Converting track logos...');
        for (const [id, ddsPath] of trackLogos) {
            const outputPath = (0, path_1.join)(this.outputDir, 'tracklogos', `${id}.png`);
            try {
                await this.convertSingleDDS(ddsPath, outputPath);
                const stats = await this.getFileStats(ddsPath);
                manifest.files[ddsPath] = {
                    pngPath: outputPath,
                    fileSize: stats.size,
                    mtime: stats.mtime,
                    converted: new Date(),
                };
                result.converted++;
                result.convertedFiles.push(outputPath);
                console.log(`  ✓ ${id}.png`);
            }
            catch (error) {
                result.errors++;
                const errorMsg = `Failed to convert ${ddsPath}: ${error}`;
                result.errorMessages.push(errorMsg);
                console.error(`  ✗ ${id}: ${error}`);
            }
        }
        // Convert track photos
        console.log('\nConverting track photos...');
        for (const [id, ddsPath] of trackPhotos) {
            const outputPath = (0, path_1.join)(this.outputDir, 'trackphotos', `${id}.png`);
            try {
                await this.convertSingleDDS(ddsPath, outputPath);
                const stats = await this.getFileStats(ddsPath);
                manifest.files[ddsPath] = {
                    pngPath: outputPath,
                    fileSize: stats.size,
                    mtime: stats.mtime,
                    converted: new Date(),
                };
                result.converted++;
                result.convertedFiles.push(outputPath);
                console.log(`  ✓ ${id}.png`);
            }
            catch (error) {
                result.errors++;
                const errorMsg = `Failed to convert ${ddsPath}: ${error}`;
                result.errorMessages.push(errorMsg);
                console.error(`  ✗ ${id}: ${error}`);
            }
        }
        // Convert vehicle class logos
        console.log('\nConverting vehicle class logos...');
        for (const [id, ddsPath] of classLogos) {
            const outputPath = (0, path_1.join)(this.outputDir, 'classlogos', `${id}.png`);
            try {
                await this.convertSingleDDS(ddsPath, outputPath);
                const stats = await this.getFileStats(ddsPath);
                manifest.files[ddsPath] = {
                    pngPath: outputPath,
                    fileSize: stats.size,
                    mtime: stats.mtime,
                    converted: new Date(),
                };
                result.converted++;
                result.convertedFiles.push(outputPath);
                console.log(`  ✓ ${id}.png`);
            }
            catch (error) {
                result.errors++;
                const errorMsg = `Failed to convert ${ddsPath}: ${error}`;
                result.errorMessages.push(errorMsg);
                console.error(`  ✗ ${id}: ${error}`);
            }
        }
        // Save manifest
        manifest.lastConverted = new Date();
        await this.saveManifest(manifest);
        result.duration = Date.now() - startTime;
        console.log('\n' + '='.repeat(60));
        console.log('Conversion Complete!');
        console.log('='.repeat(60));
        console.log(`Converted: ${result.converted} files`);
        console.log(`Errors: ${result.errors} files`);
        console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
        console.log(`Output: ${this.outputDir}`);
        return result;
    }
    /**
     * Convert only new or changed DDS files (delta update)
     */
    async convertDelta() {
        const startTime = Date.now();
        const result = {
            converted: 0,
            skipped: 0,
            errors: 0,
            errorMessages: [],
            duration: 0,
            convertedFiles: [],
        };
        console.log('Starting delta DDS to PNG conversion...');
        console.log(`Installation: ${this.installPath}`);
        console.log(`Output: ${this.outputDir}`);
        console.log();
        // Load existing manifest
        let manifest = await this.loadManifest();
        if (!manifest) {
            console.log('No existing manifest found. Running full conversion...');
            return this.convertEverything();
        }
        console.log(`Loaded manifest with ${Object.keys(manifest.files).length} files`);
        console.log();
        // Create thumbnail converter to find all DDS files
        const thumbnailConverter = new thumbnail_converter_1.ThumbnailConverter(this.installPath);
        // Find all DDS files
        console.log('Scanning for DDS files...');
        const trackLogos = await thumbnailConverter.findTrackLogos();
        const trackPhotos = await thumbnailConverter.findTrackPhotos();
        const classLogos = await thumbnailConverter.findVehicleClassLogos();
        console.log(`Found ${trackLogos.size} track logos`);
        console.log(`Found ${trackPhotos.size} track photos`);
        console.log(`Found ${classLogos.size} vehicle class logos`);
        console.log();
        // Process track logos
        console.log('Processing track logos...');
        for (const [id, ddsPath] of trackLogos) {
            const manifestEntry = manifest.files[ddsPath];
            const needsConv = await this.needsConversion(ddsPath, manifestEntry);
            if (!needsConv) {
                result.skipped++;
                continue;
            }
            const outputPath = (0, path_1.join)(this.outputDir, 'tracklogos', `${id}.png`);
            try {
                await this.convertSingleDDS(ddsPath, outputPath);
                const stats = await this.getFileStats(ddsPath);
                manifest.files[ddsPath] = {
                    pngPath: outputPath,
                    fileSize: stats.size,
                    mtime: stats.mtime,
                    converted: new Date(),
                };
                result.converted++;
                result.convertedFiles.push(outputPath);
                console.log(`  ✓ ${id}.png (new/updated)`);
            }
            catch (error) {
                result.errors++;
                const errorMsg = `Failed to convert ${ddsPath}: ${error}`;
                result.errorMessages.push(errorMsg);
                console.error(`  ✗ ${id}: ${error}`);
            }
        }
        // Process track photos
        console.log('\nProcessing track photos...');
        for (const [id, ddsPath] of trackPhotos) {
            const manifestEntry = manifest.files[ddsPath];
            const needsConv = await this.needsConversion(ddsPath, manifestEntry);
            if (!needsConv) {
                result.skipped++;
                continue;
            }
            const outputPath = (0, path_1.join)(this.outputDir, 'trackphotos', `${id}.png`);
            try {
                await this.convertSingleDDS(ddsPath, outputPath);
                const stats = await this.getFileStats(ddsPath);
                manifest.files[ddsPath] = {
                    pngPath: outputPath,
                    fileSize: stats.size,
                    mtime: stats.mtime,
                    converted: new Date(),
                };
                result.converted++;
                result.convertedFiles.push(outputPath);
                console.log(`  ✓ ${id}.png (new/updated)`);
            }
            catch (error) {
                result.errors++;
                const errorMsg = `Failed to convert ${ddsPath}: ${error}`;
                result.errorMessages.push(errorMsg);
                console.error(`  ✗ ${id}: ${error}`);
            }
        }
        // Process vehicle class logos
        console.log('\nProcessing vehicle class logos...');
        for (const [id, ddsPath] of classLogos) {
            const manifestEntry = manifest.files[ddsPath];
            const needsConv = await this.needsConversion(ddsPath, manifestEntry);
            if (!needsConv) {
                result.skipped++;
                continue;
            }
            const outputPath = (0, path_1.join)(this.outputDir, 'classlogos', `${id}.png`);
            try {
                await this.convertSingleDDS(ddsPath, outputPath);
                const stats = await this.getFileStats(ddsPath);
                manifest.files[ddsPath] = {
                    pngPath: outputPath,
                    fileSize: stats.size,
                    mtime: stats.mtime,
                    converted: new Date(),
                };
                result.converted++;
                result.convertedFiles.push(outputPath);
                console.log(`  ✓ ${id}.png (new/updated)`);
            }
            catch (error) {
                result.errors++;
                const errorMsg = `Failed to convert ${ddsPath}: ${error}`;
                result.errorMessages.push(errorMsg);
                console.error(`  ✗ ${id}: ${error}`);
            }
        }
        // Save updated manifest
        manifest.lastConverted = new Date();
        await this.saveManifest(manifest);
        result.duration = Date.now() - startTime;
        console.log('\n' + '='.repeat(60));
        console.log('Delta Conversion Complete!');
        console.log('='.repeat(60));
        console.log(`Converted: ${result.converted} files`);
        console.log(`Skipped: ${result.skipped} files (already up to date)`);
        console.log(`Errors: ${result.errors} files`);
        console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
        console.log(`Output: ${this.outputDir}`);
        return result;
    }
    /**
     * Get PNG path for a DDS file (if it exists in manifest)
     */
    async getPNGPath(ddsPath) {
        const manifest = await this.loadManifest();
        if (!manifest) {
            return null;
        }
        const entry = manifest.files[ddsPath];
        if (!entry) {
            return null;
        }
        // Check if PNG still exists
        if (!(0, fs_1.existsSync)(entry.pngPath)) {
            return null;
        }
        return entry.pngPath;
    }
}
exports.DDSToPNGConverter = DDSToPNGConverter;
//# sourceMappingURL=dds-to-png-converter.js.map