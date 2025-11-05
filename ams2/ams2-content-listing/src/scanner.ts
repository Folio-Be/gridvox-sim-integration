import { readFile } from 'fs/promises';
import { join, normalize } from 'path';
import { glob } from 'glob';
import { VehicleParser } from './parsers/vehicle-parser';
import { TrackParser } from './parsers/track-parser';
import {
  ScanOptions,
  ScanResult,
  ContentDatabase,
  Vehicle,
  Track,
  VehicleClass,
  DLC,
} from './types';

/**
 * Main scanner class for AMS2 content
 */
export class AMS2ContentScanner {
  private vehicleParser: VehicleParser;
  private trackParser: TrackParser;
  private installPath: string;

  constructor(installPath: string) {
    this.installPath = normalize(installPath);
    this.vehicleParser = new VehicleParser();
    this.trackParser = new TrackParser();
  }

  /**
   * Scan all content in the AMS2 installation
   */
  async scan(options?: Partial<ScanOptions>): Promise<ScanResult> {
    const startTime = Date.now();
    const errors: string[] = [];
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
  private async scanVehicles(errors: string[]): Promise<Vehicle[]> {
    const vehicles: Vehicle[] = [];

    try {
      // Read vehiclelist.lst to get all vehicle .crd file paths
      const vehicleListPath = join(this.installPath, 'Vehicles', 'vehiclelist.lst');
      const listContent = await readFile(vehicleListPath, 'utf8');
      const crdPaths = listContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.endsWith('.crd'));

      console.log(`Found ${crdPaths.length} vehicle entries in vehiclelist.lst`);

      // Parse each vehicle file
      for (const crdPath of crdPaths) {
        const fullPath = join(this.installPath, crdPath);
        const vehicle = await this.vehicleParser.parseVehicleFile(fullPath);
        if (vehicle) {
          vehicles.push(vehicle);
        } else {
          errors.push(`Failed to parse vehicle: ${crdPath}`);
        }
      }
    } catch (error) {
      const errorMsg = `Error scanning vehicles: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    return vehicles;
  }

  /**
   * Scan all tracks
   */
  private async scanTracks(errors: string[]): Promise<Track[]> {
    const tracks: Track[] = [];

    try {
      // Find all .trd files in the Tracks directory
      const tracksPath = join(this.installPath, 'Tracks');
      const trdPattern = join(tracksPath, '**', '*.trd');
      const trdFiles = await glob(trdPattern, { windowsPathsNoEscape: true });

      console.log(`Found ${trdFiles.length} track files`);

      // Parse each track file
      for (const trdPath of trdFiles) {
        const track = await this.trackParser.parseTrackFile(trdPath);
        if (track) {
          tracks.push(track);
        } else {
          errors.push(`Failed to parse track: ${trdPath}`);
        }
      }
    } catch (error) {
      const errorMsg = `Error scanning tracks: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    return tracks;
  }

  /**
   * Build the complete content database
   */
  private buildContentDatabase(vehicles: Vehicle[], tracks: Track[]): ContentDatabase {
    // Extract vehicle classes
    const vehicleClassMap = this.vehicleParser.extractVehicleClasses(vehicles);
    const vehicleClasses: VehicleClass[] = Array.from(vehicleClassMap.entries()).map(
      ([id, count]) => ({
        id,
        displayName: id,
        vehicleCount: count,
      })
    );

    // Extract DLCs
    const vehicleDLCs = this.vehicleParser.extractDLCs(vehicles);
    const trackDLCs = this.trackParser.extractDLCs(tracks);

    // Merge DLC information
    const dlcMap = new Map<string, DLC>();
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
  private formatDLCName(dlcId: string): string {
    // Convert camelCase/lowercase to Title Case
    return dlcId
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Get summary statistics
   */
  getSummary(database: ContentDatabase): string {
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
      ...database.dlcs.map(
        (dlc) => `  ${dlc.displayName}: ${dlc.vehicleCount} vehicles, ${dlc.trackCount} tracks`
      ),
    ];

    return lines.join('\n');
  }
}
