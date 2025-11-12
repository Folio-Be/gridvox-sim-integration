# Quick Start Guide

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Test

```bash
# Quick test
node test-quick.js

# Detailed output
node test-detailed.js

# Full scan with filesystem
node test-full-scan.js
```

## Basic Usage

```typescript
import { detectSimulators, getInstalledSimulators } from '@SimVox.ai/sim-detection';

// Simple - just get the list
const sims = await getInstalledSimulators();
console.log(`Found ${sims.length} simulators`);

// Full control
const result = await detectSimulators({
  enableSteam: true,
  enableEpic: true,
  enableEA: true,
  enableManualScan: true,  // Slower but finds C:\GAMES
  customPaths: ['D:\\MyGames'],
});

console.log(`Detected ${result.simulators.length} sims in ${result.detectionTime}ms`);
```

## What It Does

✅ Detects 23+ racing simulators
✅ Scans Steam, Epic Games, EA/Origin
✅ Optional manual path scanning
✅ <250ms detection time
✅ Built-in caching

## Supported Simulators

iRacing • Assetto Corsa • ACC • AC EVO • rFactor 2 • AMS2 • Le Mans Ultimate • RaceRoom • Project CARS • BeamNG • KartKraft • Richard Burns Rally • DiRT Rally 2.0 • WRC 9 • EA WRC • F1 25/24/23/22 • ATS • ETS2

## Files

- `README.md` - Full documentation
- `INTEGRATION-GUIDE.md` - SimVox.ai integration steps
- `PROJECT-SUMMARY.md` - Complete project overview
- `example.ts` - Usage examples

## API

```typescript
detectSimulators(options?)       // Full detection with options
getInstalledSimulators(options?) // Simple array return
isSimulatorInstalled(id)         // Check if installed
getSimulator(id)                 // Get specific sim details
detectRunningSimulators()        // Currently running sims
isSimulatorRunning(id)          // Check if sim is running
clearCache()                     // Clear detection cache
refreshDetection(options?)       // Force fresh scan
```

## Performance Tips

**Fast (100-200ms):**
```typescript
{ enableManualScan: false }  // Steam/Epic only
```

**Thorough (200-500ms):**
```typescript
{ enableManualScan: true }   // Include C:\GAMES scan
```

## SimVox.ai Integration

1. Install: `npm install file:../path/to/sim-detection-listing`
2. Import in Electron main process
3. Call on app startup
4. Cache results
5. Add refresh button in settings

See `INTEGRATION-GUIDE.md` for complete setup.

## Tested With

✓ 7 real installations
✓ Steam (3 games)
✓ Epic Games (1 game)
✓ Manual installs (3 games)
✓ Complex paths (subfolders, versioned folders)

## Status

**Version:** 0.1.0
**Status:** Production-ready
**Platform:** Windows (tested), macOS/Linux (implemented)
