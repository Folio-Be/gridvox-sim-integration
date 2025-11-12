"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleParser = void 0;
const promises_1 = require("fs/promises");
const fast_xml_parser_1 = require("fast-xml-parser");
/**
 * Parser for AMS2 vehicle .crd files
 */
class VehicleParser {
    constructor() {
        this.xmlParser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });
    }
    /**
     * Parse a vehicle .crd file
     */
    async parseVehicleFile(filePath) {
        try {
            const xmlContent = await (0, promises_1.readFile)(filePath, 'utf8');
            const xmlData = this.xmlParser.parse(xmlContent);
            if (!xmlData?.Reflection?.data?.prop) {
                console.warn(`Invalid XML structure in ${filePath}`);
                return null;
            }
            const props = xmlData.Reflection.data.prop;
            const getProp = (name) => {
                const prop = Array.isArray(props)
                    ? props.find((p) => p['@_name'] === name)
                    : props['@_name'] === name
                        ? props
                        : undefined;
                return prop?.['@_data'] || '';
            };
            const getPropInt = (name) => {
                const value = getProp(name);
                return value ? parseInt(value, 10) : 0;
            };
            const id = getProp('Name');
            if (!id) {
                console.warn(`No vehicle ID found in ${filePath}`);
                return null;
            }
            // Determine if this is mod content based on file path
            const isModContent = filePath.includes('UserData\\Mods') ||
                filePath.includes('UserData/Mods') ||
                filePath.includes('Mods\\Enabled') ||
                filePath.includes('Mods/Enabled');
            const vehicle = {
                id,
                displayName: getProp('Vehicle Name') || id,
                manufacturer: getProp('VehicleManufacturer'),
                model: getProp('VehicleModel'),
                vehicleClass: getProp('Vehicle Class'),
                vehicleGroup: getProp('Vehicle Group'),
                year: getPropInt('Vehicle Year') || null,
                dlcId: getProp('DLC ID') || 'base',
                country: getProp('Country'),
                price: getPropInt('Price'),
                description: getProp('Vehicle Description'),
                isModContent,
                filePath,
            };
            return vehicle;
        }
        catch (error) {
            console.error(`Error parsing vehicle file ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Extract vehicle class information from parsed vehicles
     */
    extractVehicleClasses(vehicles) {
        const classMap = new Map();
        for (const vehicle of vehicles) {
            if (vehicle.vehicleClass) {
                const count = classMap.get(vehicle.vehicleClass) || 0;
                classMap.set(vehicle.vehicleClass, count + 1);
            }
        }
        return classMap;
    }
    /**
     * Extract DLC information from parsed vehicles
     */
    extractDLCs(vehicles) {
        const dlcMap = new Map();
        for (const vehicle of vehicles) {
            if (vehicle.dlcId && vehicle.dlcId !== 'base') {
                const dlc = dlcMap.get(vehicle.dlcId) || { vehicleCount: 0 };
                dlc.vehicleCount++;
                dlcMap.set(vehicle.dlcId, dlc);
            }
        }
        return dlcMap;
    }
}
exports.VehicleParser = VehicleParser;
//# sourceMappingURL=vehicle-parser.js.map