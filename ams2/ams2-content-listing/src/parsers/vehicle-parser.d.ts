import { Vehicle } from '../types';
/**
 * Parser for AMS2 vehicle .crd files
 */
export declare class VehicleParser {
    private xmlParser;
    constructor();
    /**
     * Parse a vehicle .crd file
     */
    parseVehicleFile(filePath: string): Promise<Vehicle | null>;
    /**
     * Extract vehicle class information from parsed vehicles
     */
    extractVehicleClasses(vehicles: Vehicle[]): Map<string, number>;
    /**
     * Extract DLC information from parsed vehicles
     */
    extractDLCs(vehicles: Vehicle[]): Map<string, {
        vehicleCount: number;
    }>;
}
//# sourceMappingURL=vehicle-parser.d.ts.map