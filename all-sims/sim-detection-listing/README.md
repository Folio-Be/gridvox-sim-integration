# GridVox Racing Simulator Detection

A comprehensive Node.js/TypeScript library for detecting installed racing simulators across multiple platforms and game launchers.

## Features

- **Multi-Platform Support**: Windows, macOS, and Linux
- **Multiple Launcher Detection**:
  - Steam (primary - ~80% coverage)
  - Epic Games Store
  - EA App / Origin
  - Manual installations
- **Runtime Detection**: Detect currently running simulators
- **Built-in Caching**: Fast subsequent lookups
- **20+ Racing Sims**: Supports iRacing, Assetto Corsa, ACC, rFactor 2, Automobilista 2, and more
- **TypeScript**: Full type definitions included

## Installation

```bash
npm install @gridvox/sim-detection
```

## Quick Start

```typescript
import { detectSimulators, getInstalledSimulators } from '@gridvox/sim-detection';

// Simple usage - get array of detected sims
const simulators = await getInstalledSimulators();

console.log(`Found ${simulators.length} racing simulators:`);
simulators.forEach(sim => {
  console.log(`- ${sim.name} (${sim.source})`);
  console.log(`  Path: ${sim.installPath}`);
});

// Full detection with timing and error info
const result = await detectSimulators();
console.log(`Detection took ${result.detectionTime}ms`);
console.log(`Found ${result.simulators.length} simulators`);
if (result.errors) {
  console.log('Errors:', result.errors);
}
```

## API Reference

### Main Detection Functions

#### `detectSimulators(options?: DetectionOptions): Promise<DetectionResult>`

Comprehensive detection with timing and error information.

```typescript
const result = await detectSimulators({
  enableSteam: true,
  enableEpic: true,
  enableEA: true,
  enableManualScan: false, // Slow, disabled by default
  useCache: true,
  cacheTTL: 300000, // 5 minutes
  customPaths: ['D:\\MyGames'] // Optional custom scan paths
});

console.log(result.simulators);
console.log(result.detectionTime);
console.log(result.errors);
```

#### `getInstalledSimulators(options?: DetectionOptions): Promise<DetectedSim[]>`

Simple array of detected simulators.

```typescript
const sims = await getInstalledSimulators();
```

#### `isSimulatorInstalled(simulatorId: string, options?: DetectionOptions): Promise<boolean>`

Check if a specific simulator is installed.

```typescript
const hasIRacing = await isSimulatorInstalled('iracing');
const hasAC = await isSimulatorInstalled('assetto-corsa');
```

#### `getSimulator(simulatorId: string, options?: DetectionOptions): Promise<DetectedSim | undefined>`

Get information about a specific simulator.

```typescript
const iracing = await getSimulator('iracing');
if (iracing) {
  console.log(`iRacing installed at: ${iracing.installPath}`);
}
```

### Runtime Detection

#### `detectRunningSimulators(): Promise<RunningSimulator[]>`

Detect currently running racing simulators.

```typescript
import { detectRunningSimulators } from '@gridvox/sim-detection';

const running = await detectRunningSimulators();
if (running.length > 0) {
  console.log(`${running[0].name} is currently running (PID: ${running[0].pid})`);
}
```

#### `isSimulatorRunning(simulatorId: string): Promise<boolean>`

Check if a specific simulator is currently running.

```typescript
import { isSimulatorRunning } from '@gridvox/sim-detection';

if (await isSimulatorRunning('assetto-corsa')) {
  console.log('Assetto Corsa is running!');
}
```

### Cache Management

#### `clearCache(): void`

Clear the detection cache.

```typescript
import { clearCache } from '@gridvox/sim-detection';

clearCache();
```

#### `refreshDetection(options?: DetectionOptions): Promise<DetectionResult>`

Clear cache and perform fresh detection.

```typescript
import { refreshDetection } from '@gridvox/sim-detection';

const result = await refreshDetection();
```

## Supported Simulators

### Circuit Racing
- iRacing
- Assetto Corsa
- Assetto Corsa Competizione
- Assetto Corsa EVO
- rFactor 2
- Automobilista 2
- Le Mans Ultimate
- RaceRoom Racing Experience
- Project CARS / Project CARS 2
- BeamNG.drive
- KartKraft

### Rally
- Richard Burns Rally (with RallySimFans mod support)
- DiRT Rally 2.0
- WRC 9
- EA SPORTS WRC

### Formula 1
- F1 25
- F1 24
- F1 23
- F1 22

### Truck Simulators
- American Truck Simulator
- Euro Truck Simulator 2

## Data Types

### `DetectedSim`

```typescript
interface DetectedSim {
  id: string;              // Standardized ID (e.g., 'iracing')
  name: string;            // Display name
  installPath: string;     // Full installation path
  executable: string;      // Main executable filename
  source: 'steam' | 'epic' | 'ea' | 'origin' | 'manual' | 'unknown';
  steamAppId?: string;     // Steam AppID if applicable
  epicAppName?: string;    // Epic app name if applicable
  version?: string;        // Game version
  metadata?: {
    userDataPath?: string;    // Save/config directory
    lastPlayed?: Date;        // Last played timestamp
    sizeOnDisk?: number;      // Install size in bytes
  };
}
```

### `DetectionOptions`

```typescript
interface DetectionOptions {
  enableSteam?: boolean;        // Default: true
  enableEpic?: boolean;         // Default: true
  enableEA?: boolean;           // Default: true
  enableManualScan?: boolean;   // Default: false (slow)
  customPaths?: string[];       // Additional paths to scan
  useCache?: boolean;           // Default: true
  cacheTTL?: number;            // Cache TTL in ms (default: 300000)
}
```

### `DetectionResult`

```typescript
interface DetectionResult {
  simulators: DetectedSim[];
  detectionTime: number;        // Milliseconds
  errors?: Array<{
    detector: string;
    error: string;
  }>;
}
```

## Platform-Specific Notes

### Windows

- **Steam**: Detected via registry and VDF parsing
- **Epic Games**: Reads manifests from `%PROGRAMDATA%\Epic\EpicGamesLauncher\Data\Manifests`
- **EA/Origin**: Registry-based detection
- **Manual**: Optional filesystem scanning

### macOS

- **Steam**: Reads from `~/Library/Application Support/Steam`
- Uses `system_profiler` for application detection

### Linux

- **Steam**: Reads from `~/.local/share/Steam` or `~/.steam/steam`
- **Flatpak Steam**: Supports `~/.var/app/com.valvesoftware.Steam/`
- **Proton**: Detects Windows games running via Proton

## Performance

- **Typical detection time**: 50-200ms (with Steam + Epic + EA)
- **With filesystem scan**: 500-2000ms (depending on directory structure)
- **Cached lookups**: <1ms

**Recommendation**: Use default options (manual scan disabled) for best performance.

## Integration with GridVox

This library is designed to be called from the Electron main process:

```typescript
// In Electron main process
import { app, ipcMain } from 'electron';
import { detectSimulators } from '@gridvox/sim-detection';

app.whenReady().then(async () => {
  // Detect sims on startup
  const result = await detectSimulators();
  console.log(`Detected ${result.simulators.length} racing simulators`);

  // Store for later use
  global.installedSims = result.simulators;
});

// IPC handler for renderer process
ipcMain.handle('get-installed-sims', async () => {
  return global.installedSims;
});
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Format
npm run format
```

## Requirements

- Node.js >= 18.0.0
- Windows: Requires `regedit` npm package (Windows only)
- macOS: Uses `system_profiler` command (built-in)
- Linux: Uses `ps` command (built-in)

## License

MIT

## Contributing

Contributions welcome! Please submit PRs for:

- Additional simulator definitions
- Platform-specific improvements
- Bug fixes
- Performance optimizations

## Roadmap

- [ ] GOG Galaxy detection
- [ ] Microsoft Store detection
- [ ] Additional sim definitions
- [ ] Launcher integration APIs
- [ ] Auto-update detection (file watchers)
- [ ] Game version extraction
- [ ] DLC/content pack detection

## Credits

Built for **GridVox** - AI-driven sim racing companion application.

Research sources:
- Steam VDF format documentation
- SimHub community
- PCGamingWiki
- Various racing sim communities
