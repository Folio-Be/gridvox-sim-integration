"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMS2ContentScanner = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const glob_1 = require("glob");
const vehicle_parser_1 = require("./parsers/vehicle-parser");
const track_parser_1 = require("./parsers/track-parser");
/**
 * Main scanner class for AMS2 content
 */
class AMS2ContentScanner {
    constructor(installPath) {
        this.installPath = (0, path_1.normalize)(installPath);
        this.vehicleParser = new vehicle_parser_1.VehicleParser();
        this.trackParser = new track_parser_1.TrackParser();
    }
    /**
     * Scan all content in the AMS2 installation
     */
    async scan(options) {
        const startTime = Date.now();
        const errors = [];
        let vehiclesScanned = 0;
        let tracksScanned = 0;
        console.log(`Scanning AMS2 content at: ${this.installPath}`);
        // Scan vehicles
        console.log('Scanning vehicles...');
        const vehicles = await this.scanVehicles(errors);
        vehiclesScanned = vehicles.length;
        console.log(`Found ${vehiclesScanned} vehicles`);
        // Scan tracks
        console.log('Scanning tracks...');
        const tracks = await this.scanTracks(errors);
        tracksScanned = tracks.length;
        console.log(`Found ${tracksScanned} tracks`);
        // Build content database
        const database = this.buildContentDatabase(vehicles, tracks);
        const duration = Date.now() - startTime;
        return {
            database,
            stats: {
                vehiclesScanned,
                tracksScanned,
                vehiclesParsed: vehicles.length,
                tracksParsed: tracks.length,
                errors,
                duration,
            },
        };
    }
    /**
     * Scan all vehicles
     */
    async scanVehicles(errors) {
        const vehicles = [];
        try {
            // Read vehiclelist.lst to get all vehicle .crd file paths
            const vehicleListPath = (0, path_1.join)(this.installPath, 'Vehicles', 'vehiclelist.lst');
            const listContent = await (0, promises_1.readFile)(vehicleListPath, 'utf8');
            const crdPaths = listContent
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.endsWith('.crd'));
            console.log(`Found ${crdPaths.length} vehicle entries in vehiclelist.lst`);
            // Parse each vehicle file
            for (const crdPath of crdPaths) {
                const fullPath = (0, path_1.join)(this.installPath, crdPath);
                const vehicle = await this.vehicleParser.parseVehicleFile(fullPath);
                if (vehicle) {
                    vehicles.push(vehicle);
                }
                else {
                    errors.push(`Failed to parse vehicle: ${crdPath}`);
                }
            }
        }
        catch (error) {
            const errorMsg = `Error scanning vehicles: ${error}`;
            console.error(errorMsg);
            errors.push(errorMsg);
        }
        return vehicles;
    }
    /**
     * Scan all tracks
     */
    async scanTracks(errors) {
        const tracks = [];
        try {
            // Find all .trd files in the Tracks directory
            const tracksPath = (0, path_1.join)(this.installPath, 'Tracks');
            const trdPattern = (0, path_1.join)(tracksPath, '**', '*.trd');
            const trdFiles = await (0, glob_1.glob)(trdPattern, { windowsPathsNoEscape: true });
            console.log(`Found ${trdFiles.length} track files`);
            // Parse each track file
            for (const trdPath of trdFiles) {
                const track = await this.trackParser.parseTrackFile(trdPath);
                if (track) {
                    tracks.push(track);
                }
                else {
                    errors.push(`Failed to parse track: ${trdPath}`);
                }
            }
        }
        catch (error) {
            const errorMsg = `Error scanning tracks: ${error}`;
            console.error(errorMsg);
            errors.push(errorMsg);
        }
        return tracks;
    }
    /**
     * Build the complete content database
     */
    buildContentDatabase(vehicles, tracks) {
        // Extract vehicle classes
        const vehicleClassMap = this.vehicleParser.extractVehicleClasses(vehicles);
        const vehicleClasses = Array.from(vehicleClassMap.entries()).map(([id, count]) => ({
            id,
            displayName: id,
            vehicleCount: count,
        }));
        // Extract DLCs
        const vehicleDLCs = this.vehicleParser.extractDLCs(vehicles);
        const trackDLCs = this.trackParser.extractDLCs(tracks);
        // Merge DLC information
        const dlcMap = new Map();
        for (const [dlcId, data] of vehicleDLCs) {
            dlcMap.set(dlcId, {
                id: dlcId,
                displayName: this.formatDLCName(dlcId),
                vehicleCount: data.vehicleCount,
                trackCount: 0,
                isInstalled: true,
            });
        }
        for (const [dlcId, data] of trackDLCs) {
            const dlc = dlcMap.get(dlcId) || {
                id: dlcId,
                displayName: this.formatDLCName(dlcId),
                vehicleCount: 0,
                trackCount: 0,
                isInstalled: true,
            };
            dlc.trackCount = data.trackCount;
            dlcMap.set(dlcId, dlc);
        }
        const dlcs = Array.from(dlcMap.values());
        // Count mod content
        const modVehicleCount = vehicles.filter((v) => v.isModContent).length;
        const modTrackCount = tracks.filter((t) => t.isModContent).length;
        return {
            vehicles,
            tracks,
            vehicleClasses,
            dlcs,
            lastScanned: new Date(),
            installPath: this.installPath,
            modVehicleCount,
            modTrackCount,
        };
    }
    /**
     * Format DLC ID into display name
     */
    formatDLCName(dlcId) {
        // Convert camelCase/lowercase to Title Case
        return dlcId
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }
    /**
     * Get summary statistics
     */
    getSummary(database) {
        const lines = [
            `AMS2 Content Summary`,
            `===================`,
            `Installation: ${database.installPath}`,
            `Last Scanned: ${database.lastScanned.toISOString()}`,
            ``,
            `Vehicles: ${database.vehicles.length} (${database.modVehicleCount} mods)`,
            `Tracks: ${database.tracks.length} (${database.modTrackCount} mods)`,
            `Vehicle Classes: ${database.vehicleClasses.length}`,
            `DLCs: ${database.dlcs.length}`,
            ``,
            `Vehicle Classes:`,
            ...database.vehicleClasses
                .sort((a, b) => b.vehicleCount - a.vehicleCount)
                .slice(0, 10)
                .map((vc) => `  ${vc.displayName}: ${vc.vehicleCount}`),
            ``,
            `DLCs:`,
            ...database.dlcs.map((dlc) => `  ${dlc.displayName}: ${dlc.vehicleCount} vehicles, ${dlc.trackCount} tracks`),
        ];
        return lines.join('\n');
    }
}
exports.AMS2ContentScanner = AMS2ContentScanner;
//# sourceMappingURL=scanner.js.map