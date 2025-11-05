import { readFile } from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { Vehicle } from '../types';

/**
 * Parser for AMS2 vehicle .crd files
 */
export class VehicleParser {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  /**
   * Parse a vehicle .crd file
   */
  async parseVehicleFile(filePath: string): Promise<Vehicle | null> {
    try {
      const xmlContent = await readFile(filePath, 'utf8');
      const xmlData = this.xmlParser.parse(xmlContent);

      if (!xmlData?.Reflection?.data?.prop) {
        console.warn(`Invalid XML structure in ${filePath}`);
        return null;
      }

      const props = xmlData.Reflection.data.prop;
      const getProp = (name: string): string => {
        const prop = Array.isArray(props)
          ? props.find((p: any) => p['@_name'] === name)
          : props['@_name'] === name
          ? props
          : undefined;
        return prop?.['@_data'] || '';
      };

      const getPropInt = (name: string): number => {
        const value = getProp(name);
        return value ? parseInt(value, 10) : 0;
      };

      const id = getProp('Name');
      if (!id) {
        console.warn(`No vehicle ID found in ${filePath}`);
        return null;
      }

      // Determine if this is mod content based on file path
      const isModContent =
        filePath.includes('UserData\\Mods') ||
        filePath.includes('UserData/Mods') ||
        filePath.includes('Mods\\Enabled') ||
        filePath.includes('Mods/Enabled');

      const vehicle: Vehicle = {
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
    } catch (error) {
      console.error(`Error parsing vehicle file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract vehicle class information from parsed vehicles
   */
  extractVehicleClasses(vehicles: Vehicle[]): Map<string, number> {
    const classMap = new Map<string, number>();

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
  extractDLCs(vehicles: Vehicle[]): Map<string, { vehicleCount: number }> {
    const dlcMap = new Map<string, { vehicleCount: number }>();

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
