import { readFile } from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { Track } from '../types';

/**
 * Parser for AMS2 track .trd files
 */
export class TrackParser {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  /**
   * Parse a track .trd file
   */
  async parseTrackFile(filePath: string): Promise<Track | null> {
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

      const getPropFloat = (name: string): number | undefined => {
        const value = getProp(name);
        return value ? parseFloat(value) : undefined;
      };

      const id = getProp('Name');
      if (!id) {
        console.warn(`No track ID found in ${filePath}`);
        return null;
      }

      // Determine if this is mod content based on file path
      const isModContent =
        filePath.includes('UserData\\Mods') ||
        filePath.includes('UserData/Mods') ||
        filePath.includes('Mods\\Enabled') ||
        filePath.includes('Mods/Enabled');

      const track: Track = {
        id,
        displayName: getProp('TrackName') || id,
        location: getProp('Location'),
        country: getProp('Country'),
        length: getPropInt('Length'),
        trackGroup: getProp('Track Group'),
        variation: getProp('Track_Variation') || id,
        year: getPropInt('Year') || null,
        dlcId: getProp('DLC ID') || 'base',
        trackType: getProp('Track Type'),
        maxAI: getPropInt('Max AI participants'),
        turns: getPropInt('Number Of Turns'),
        latitude: getPropFloat('Track_Latitude'),
        longitude: getPropFloat('Track_Longitude'),
        isModContent,
        filePath,
      };

      return track;
    } catch (error) {
      console.error(`Error parsing track file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract DLC information from parsed tracks
   */
  extractDLCs(tracks: Track[]): Map<string, { trackCount: number }> {
    const dlcMap = new Map<string, { trackCount: number }>();

    for (const track of tracks) {
      if (track.dlcId && track.dlcId !== 'base') {
        const dlc = dlcMap.get(track.dlcId) || { trackCount: 0 };
        dlc.trackCount++;
        dlcMap.set(track.dlcId, dlc);
      }
    }

    return dlcMap;
  }

  /**
   * Group tracks by track group
   */
  groupByTrackGroup(tracks: Track[]): Map<string, Track[]> {
    const groupMap = new Map<string, Track[]>();

    for (const track of tracks) {
      if (track.trackGroup) {
        const group = groupMap.get(track.trackGroup) || [];
        group.push(track);
        groupMap.set(track.trackGroup, group);
      }
    }

    return groupMap;
  }
}
