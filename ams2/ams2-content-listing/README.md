# AMS2 Content Listing

TypeScript library for scanning and listing all installed content in Automobilista 2, including vehicles, tracks, DLC, and mods.

## Features

- **Vehicle Discovery**: Scans all installed vehicles with complete metadata
- **Track Discovery**: Scans all installed tracks and layouts
- **DLC Detection**: Identifies which content belongs to which DLC package
- **Mod Support**: Detects custom/modded content
- **Thumbnail Mapping**: Locates and maps DDS thumbnail images
- **DDS to PNG Conversion**: Built-in converter with delta updates (NEW!)
- **Fast Performance**: Scans 387 vehicles + 283 tracks in ~500ms
- **Type-Safe**: Full TypeScript support with comprehensive interfaces

## Installation

```bash
npm install
```

## Usage

### CLI Tool

Scan your AMS2 installation and generate a JSON database:

```bash
npm run scan
```

Or specify a custom installation path:

```bash
npm run scan "D:\SteamLibrary\steamapps\common\Automobilista 2"
```

This will:
1. Scan all vehicles and tracks
2. Map thumbnails to content
3. Generate `ams2-content.json` with complete database
4. Display summary statistics

### As a Library

```typescript
import { AMS2ContentScanner, ThumbnailConverter } from 'ams2-content-listing';

// Create scanner
const scanner = new AMS2ContentScanner('C:\\GAMES\\Automobilista 2');

// Scan content
const result = await scanner.scan();

// Access data
console.log(`Found ${result.database.vehicles.length} vehicles`);
console.log(`Found ${result.database.tracks.length} tracks`);
console.log(`Found ${result.database.dlcs.length} DLCs`);

// Display summary
console.log(scanner.getSummary(result.database));

// Map thumbnails
const thumbnailConverter = new ThumbnailConverter('C:\\GAMES\\Automobilista 2');
const trackLogos = await thumbnailConverter.findTrackLogos();
const vehicleClassLogos = await thumbnailConverter.findVehicleClassLogos();
```

### DDS to PNG Conversion

Convert all DDS thumbnails to PNG format for display in your app:

```bash
# Convert all thumbnails (first time)
npm run convert

# Update only new/changed files (after installing DLC/mods)
npm run convert-delta
```

**Performance:**
- Full conversion: 232 files in ~4.5 seconds
- Delta update: ~0.04 seconds (if nothing changed)

**Output:** PNG files in `ams2-thumbnails-png/` directory

**Programmatic Usage:**

```typescript
import { DDSToPNGConverter } from 'ams2-content-listing';

const converter = new DDSToPNGConverter('C:\\GAMES\\Automobilista 2');

// Convert everything
await converter.convertEverything();

// Or just new files
await converter.convertDelta();

// Get PNG path for a DDS file
const pngPath = await converter.getPNGPath(ddsFilePath);
```

See [DDS_CONVERSION_GUIDE.md](DDS_CONVERSION_GUIDE.md) for complete documentation.

## Data Structure

### Vehicle

```typescript
interface Vehicle {
  id: string;                  // Internal ID (e.g., "porsche_963_gtp")
  displayName: string;         // Display name (e.g., "Porsche 963")
  manufacturer: string;        // Manufacturer (e.g., "Porsche")
  model: string;              // Model (e.g., "963")
  vehicleClass: string;       // Class (e.g., "LMDh", "GT3")
  vehicleGroup: string;       // Group (e.g., "Hypercars", "GT3")
  year: number | null;        // Year (e.g., 2024)
  dlcId: string;              // DLC ID or "base"
  country: string;            // Country of origin
  price: number;              // In-game price
  description: string;        // Vehicle description
  thumbnail?: string;         // Path to class logo DDS file
  isModContent: boolean;      // Whether this is mod content
  filePath: string;           // Original .crd file path
}
```

### Track

```typescript
interface Track {
  id: string;                  // Internal ID (e.g., "Interlagos_GP")
  displayName: string;         // Display name (e.g., "Interlagos GP")
  location: string;            // Location/city (e.g., "Brazil")
  country: string;             // Country code (e.g., "BR")
  length: number;              // Track length in meters
  trackGroup: string;          // Track group (e.g., "Interlagos")
  variation: string;           // Layout variation
  year: number | null;         // Track year/version
  dlcId: string;               // DLC ID or "base"
  trackType: string;           // Type (e.g., "Circuit", "Rally")
  maxAI: number;               // Maximum AI participants
  turns: number;               // Number of turns
  latitude?: number;           // GPS latitude
  longitude?: number;          // GPS longitude
  thumbnail?: string;          // Path to logo DDS file
  photo?: string;              // Path to photo DDS file
  isModContent: boolean;       // Whether this is mod content
  filePath: string;            // Original .trd file path
}
```

### ContentDatabase

```typescript
interface ContentDatabase {
  vehicles: Vehicle[];              // All vehicles
  tracks: Track[];                  // All tracks
  vehicleClasses: VehicleClass[];   // Unique vehicle classes
  dlcs: DLC[];                      // Detected DLCs
  lastScanned: Date;                // Scan timestamp
  installPath: string;              // AMS2 installation path
  modVehicleCount: number;          // Number of mod vehicles
  modTrackCount: number;            // Number of mod tracks
}
```

## Test Results

Tested with AMS2 installation at `C:\GAMES\Automobilista 2`:

```
✓ 387 vehicles scanned successfully
✓ 283 tracks scanned successfully
✓ 135 vehicle classes identified
✓ 25 DLCs detected
✓ 0 parsing errors
✓ Scan completed in 553ms
✓ 39 track logos mapped
✓ 42 track photos mapped
✓ 151 vehicle class logos mapped
```

## Vehicle Classes Detected

Top 10 by vehicle count:
- SafetyCar: 12
- GT4: 9
- GT3_Gen2: 8
- F-USA_Gen3: 7
- LMDh: 6
- GT3: 5
- Hypercar: 4
- LMP2: 4

Full list includes: GT1, GT2, GT3, GT4, LMP1, LMP2, LMP3, LMDh, Formula classes, Stock Cars, Touring Cars, Karts, Rally, and more.

## DLCs Detected

- Endurance Pack Pt1-3 (vehicles)
- Racing USA Pack Pt1-3 (vehicles + tracks)
- Brazilian Legends Pack (vehicles)
- Formula Hi-Tech Pack (vehicles)
- Lamborghini Dream Pack Pt1-2 (vehicles)
- Adrenaline Pack Pt1-2 (tracks)
- Track packs: Spa, Silverstone, IMSA, Nürburgring, Monza, Le Mans, Hockenheim, Barcelona

## File Structure

```
src/
├── types.ts                      # TypeScript interfaces
├── scanner.ts                    # Main scanner class
├── parsers/
│   ├── vehicle-parser.ts         # Parse .crd XML files
│   └── track-parser.ts           # Parse .trd XML files
├── thumbnail-converter.ts        # Thumbnail discovery
├── index.ts                      # Public API
└── cli.ts                        # CLI tool
```

## How It Works

### Vehicle Scanning

1. Reads `Vehicles/vehiclelist.lst` for list of all vehicle .crd file paths
2. Parses each .crd file (XML format with reflection schema)
3. Extracts metadata: name, manufacturer, class, year, DLC ID, etc.
4. Detects mod content by checking file path

### Track Scanning

1. Globs for all `Tracks/**/*.trd` files
2. Parses each .trd file (XML format with reflection schema)
3. Extracts metadata: name, location, length, turns, coordinates, etc.
4. Detects mod content by checking file path

### Thumbnail Mapping

1. Scans `GUI/tracklogos/` for track logo DDS files
2. Scans `GUI/trackphotos/` for track photo DDS files
3. Scans `GUI/VehicleClassLogosHUD/` for vehicle class logo DDS files
4. Maps thumbnails to content by ID matching (with fallback variations)

## SimVox.ai Integration

This library is designed for the SimVox.ai AI racing companion to:

1. **Pre-Race Setup**: Display available cars/tracks for session configuration
2. **Persona Context**: Provide AI personas with accurate car/track information
3. **Story Mode**: Filter cars by class/era for narrative campaigns
4. **Voice Commands**: Enable natural language car/track selection

### Example SimVox.ai Usage

```typescript
// Scan installed content
const scanner = new AMS2ContentScanner(amsInstallPath);
const { database } = await scanner.scan();

// Filter GT3 cars for a race
const gt3Cars = database.vehicles.filter(v => v.vehicleClass === 'GT3_Gen2');

// Find tracks in Brazil
const brazilTracks = database.tracks.filter(t => t.country === 'BR');

// Get all DLC content
const dlcContent = database.vehicles.filter(v => v.dlcId !== 'base');

// Provide context to AI persona
const context = `You're driving the ${vehicle.displayName} at ${track.displayName}.`;
```

## Future Enhancements

- [ ] DDS to PNG/WebP thumbnail conversion
- [ ] Vehicle livery extraction
- [ ] Track layout image generation
- [ ] Car spec comparison (horsepower, weight, etc.)
- [ ] Track records/leaderboards integration
- [ ] File watcher for automatic updates
- [ ] Steam Workshop mod detection

## Technical Notes

### XML Parsing

AMS2 uses a reflection-based XML schema for `.crd` and `.trd` files:

```xml
<Reflection>
  <data>
    <prop name="Vehicle Name" data="Porsche 963" />
    <prop name="VehicleClass" data="LMDh" />
  </data>
</Reflection>
```

Properties are extracted using attribute matching.

### DDS Image Format

Thumbnails are stored in DirectDraw Surface (DDS) format, a compressed texture format used by DirectX. To display in web apps, conversion to PNG/WebP is recommended using tools like:
- ImageMagick
- Sharp (with DDS plugin)
- Canvas API with DDS loader

### Performance

- Vehicle list parsing: ~200ms (387 files)
- Track discovery: ~300ms (283 files)
- Thumbnail scanning: ~50ms
- Total: ~550ms for complete scan

## Available Thumbnails

### ✅ What IS Available

**Track Images:**
- 39 track logos (512x512 DDS)
- 42 track photos (1024x512 DDS)
- Full coverage for all tracks

**Vehicle Class Badges:**
- 151 class logos (GT3, LMDh, Formula, etc.)
- Used as vehicle thumbnail fallback

**Manufacturer Logos:**
- 14 manufacturer posters (Porsche, Ferrari, BMW, etc.)
- Available via `findManufacturerPosters()`

**Mod Support:**
- `findVehicleThumbnails()` scans `GUI/vehicleimages` folder
- Mods can add individual car thumbnails (512x128 DDS)

### ❌ What's NOT Available

**Individual Car Thumbnails:**
- Base game does NOT include car-specific preview images
- Car textures are stored in .bff archives (not easily accessible)
- For car images, use:
  1. Manufacturer logos (`manufacturerLogo` field)
  2. Class badges (`thumbnail` field with class logo)
  3. Or extract from .bff files (see `ams2-car-image-extractor` project)

### Image Extraction Project

For extracting individual car images from .bff archives, see:
- **Project**: `ams2-car-image-extractor` (separate subproject)
- **Purpose**: Developer tool to extract and convert car livery textures
- **Output**: Can be bundled with SimVox.ai or hosted on CDN
- **Note**: Requires PCarsTools + .NET 6.0 (developer-only, not end-user)

## API Reference

### ThumbnailConverter Methods

```typescript
// Core thumbnail scanning
await converter.findTrackLogos()           // Track logos
await converter.findTrackPhotos()          // Track photos
await converter.findVehicleClassLogos()    // Class badges

// NEW: Additional image sources
await converter.findVehicleThumbnails()    // Mod car thumbnails
await converter.findManufacturerPosters()  // Manufacturer logos

// Mapping helpers
converter.mapTrackThumbnails(trackId, logos, photos)
converter.mapVehicleClassLogo(vehicleClass, logos)
converter.mapManufacturerLogo(manufacturer, posters)  // NEW
```

### DDSToPNGConverter Methods

```typescript
// Full conversion
await converter.convertEverything()        // Convert all DDS → PNG

// Delta updates
await converter.convertDelta()             // Only convert new/changed files

// Query
await converter.getPNGPath(ddsPath)        // Get PNG for a DDS file
```

## License

MIT

## Contributing

This is part of the SimVox.ai sim racing companion project. See main repository for contribution guidelines.
