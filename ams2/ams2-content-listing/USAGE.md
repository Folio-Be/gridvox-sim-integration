# Quick Usage Guide

## Running the Scanner

### 1. Scan and Generate JSON Database

```bash
npm run scan
```

This will:
- Scan all vehicles and tracks
- Map thumbnails to content
- Generate `ams2-content.json` with complete database
- Display summary statistics

**Output**: `ams2-content.json` (3.5MB JSON file with all content metadata)

### 2. View Detailed Listing with Image Paths

```bash
npm run list
```

This displays:
- All 387 vehicles grouped by class with image paths
- All 283 tracks grouped by country with image paths
- Complete list of all DDS thumbnail files

**Output**: Console listing (5,699 lines)

To save to file:
```bash
npm run list > my-listing.txt
```

**Pre-generated**: See `content-listing-full.txt` for complete listing

### 3. View Just the JSON

```bash
cat ams2-content.json
```

Or open in your editor to browse the structured data.

## Available Commands

```bash
npm run build     # Compile TypeScript to JavaScript
npm run scan      # Scan AMS2 installation and generate JSON
npm run list      # Display detailed listing with image paths
```

## What You Get

### JSON Database (`ams2-content.json`)

Complete structured data for all content:

```json
{
  "vehicles": [
    {
      "id": "Alpine_A424",
      "displayName": "Alpine A424",
      "manufacturer": "Alpine",
      "vehicleClass": "LMDh",
      "year": 2024,
      "dlcId": "endurancept2pack",
      "thumbnail": "C:\\GAMES\\Automobilista 2\\GUI\\VehicleClassLogosHUD\\LMDh.dds",
      "filePath": "C:\\GAMES\\Automobilista 2\\vehicles\\Alpine_A424\\Alpine_A424.crd"
    }
  ],
  "tracks": [
    {
      "id": "interlagos_gp",
      "displayName": "Interlagos GP",
      "location": "Brazil",
      "length": 4295,
      "turns": 15,
      "thumbnail": "C:\\GAMES\\Automobilista 2\\GUI\\tracklogos\\interlagos.dds",
      "photo": "C:\\GAMES\\Automobilista 2\\GUI\\trackphotos\\interlagos.dds"
    }
  ]
}
```

### Text Listing (`content-listing-full.txt`)

Human-readable listing organized by:
- Vehicle classes (135 classes)
- Track countries
- Complete image path references

### Summary Stats

- **387 vehicles** across 135 classes
- **283 tracks** across 40+ countries
- **120 unique vehicle class logos** (DDS format)
- **35 unique track logos** (DDS format)
- **35 unique track photos** (DDS format)

## Image Locations

All images are in DDS format at:

### Vehicle Class Logos
```
C:\GAMES\Automobilista 2\GUI\VehicleClassLogosHUD\*.dds
```
Examples: `GT3_Gen2.dds`, `LMDh.dds`, `F-Ultimate.dds`

### Track Logos
```
C:\GAMES\Automobilista 2\GUI\tracklogos\*.dds
```
Examples: `interlagos.dds`, `spa-francorchamps.dds`

### Track Photos
```
C:\GAMES\Automobilista 2\GUI\trackphotos\*.dds
```
Larger preview images for track selection screens

## Integration Example

```typescript
import { AMS2ContentScanner } from 'ams2-content-listing';

const scanner = new AMS2ContentScanner('C:\\GAMES\\Automobilista 2');
const { database } = await scanner.scan();

// Filter GT3 cars
const gt3Cars = database.vehicles.filter(v => v.vehicleClass === 'GT3_Gen2');

// Find tracks in Europe
const europeanTracks = database.tracks.filter(t =>
  ['GB', 'DE', 'IT', 'BE', 'ES', 'FR'].includes(t.country)
);

// Get DLC content
const dlcContent = database.vehicles.filter(v => v.dlcId !== 'base');
```

See [examples/basic-usage.ts](examples/basic-usage.ts) for more integration examples.

## Notes

- **DDS Images**: Thumbnails are in DirectDraw Surface format. For web display, convert to PNG/WebP using ImageMagick or Sharp
- **Performance**: Full scan takes ~500ms
- **Updates**: Re-run `npm run scan` after installing new DLC or mods
- **Custom Path**: Pass custom path as argument: `npm run scan "D:\Steam\Automobilista 2"`
