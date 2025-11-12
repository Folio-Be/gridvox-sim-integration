"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackParser = void 0;
const promises_1 = require("fs/promises");
const fast_xml_parser_1 = require("fast-xml-parser");
/**
 * Parser for AMS2 track .trd files
 */
class TrackParser {
    constructor() {
        this.xmlParser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });
    }
    /**
     * Parse a track .trd file
     */
    async parseTrackFile(filePath) {
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
            const getPropFloat = (name) => {
                const value = getProp(name);
                return value ? parseFloat(value) : undefined;
            };
            const id = getProp('Name');
            if (!id) {
                console.warn(`No track ID found in ${filePath}`);
                return null;
            }
            // Determine if this is mod content based on file path
            const isModContent = filePath.includes('UserData\\Mods') ||
                filePath.includes('UserData/Mods') ||
                filePath.includes('Mods\\Enabled') ||
                filePath.includes('Mods/Enabled');
            const track = {
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
        }
        catch (error) {
            console.error(`Error parsing track file ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Extract DLC information from parsed tracks
     */
    extractDLCs(tracks) {
        const dlcMap = new Map();
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
    groupByTrackGroup(tracks) {
        const groupMap = new Map();
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
exports.TrackParser = TrackParser;
//# sourceMappingURL=track-parser.js.map