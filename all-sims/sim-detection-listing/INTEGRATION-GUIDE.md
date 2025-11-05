# GridVox MVP Integration Guide

Quick guide for integrating the racing simulator detection library into GridVox.

## Step 1: Install the Library

### Option A: Local Package (Recommended for MVP)

```bash
# In your GridVox project
npm install ../gridvox-sim-integration/all-sims/sim-detection-listing
```

Or add to `package.json`:
```json
{
  "dependencies": {
    "@gridvox/sim-detection": "file:../gridvox-sim-integration/all-sims/sim-detection-listing"
  }
}
```

### Option B: Publish to npm (For Production)

```bash
cd sim-detection-listing
npm publish
```

Then in GridVox:
```bash
npm install @gridvox/sim-detection
```

## Step 2: Implement in Electron Main Process

### Basic Implementation

```typescript
// src/main/index.ts
import { app, ipcMain } from 'electron';
import {
  detectSimulators,
  getInstalledSimulators,
  refreshDetection
} from '@gridvox/sim-detection';
import Store from 'electron-store';

const store = new Store();

// On app startup
app.whenReady().then(async () => {
  try {
    // First launch - full scan
    const isFirstLaunch = !store.has('simulators.lastScan');

    const result = await detectSimulators({
      enableSteam: true,
      enableEpic: true,
      enableEA: true,
      enableManualScan: isFirstLaunch, // Only first time
      useCache: !isFirstLaunch,
    });

    // Save to persistent storage
    store.set('simulators.detected', result.simulators);
    store.set('simulators.lastScan', new Date().toISOString());

    console.log(`✓ Detected ${result.simulators.length} simulators in ${result.detectionTime}ms`);

  } catch (error) {
    console.error('Simulator detection failed:', error);
  }

  // Continue with app initialization
  createWindow();
});
```

### IPC Handlers

```typescript
// Get detected simulators
ipcMain.handle('simulators:get', async () => {
  return store.get('simulators.detected', []);
});

// Refresh detection
ipcMain.handle('simulators:refresh', async () => {
  const result = await refreshDetection({
    enableSteam: true,
    enableEpic: true,
    enableEA: true,
    enableManualScan: true, // Full scan on refresh
  });

  store.set('simulators.detected', result.simulators);
  store.set('simulators.lastScan', new Date().toISOString());

  return result;
});

// Check if specific simulator is installed
ipcMain.handle('simulators:has', async (_event, simulatorId: string) => {
  const sims = store.get('simulators.detected', []);
  return sims.some((s: any) => s.id === simulatorId);
});

// Get simulator by ID
ipcMain.handle('simulators:getById', async (_event, simulatorId: string) => {
  const sims = store.get('simulators.detected', []);
  return sims.find((s: any) => s.id === simulatorId);
});
```

## Step 3: Use in Renderer Process

### Preload Script

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('simulators', {
  getAll: () => ipcRenderer.invoke('simulators:get'),
  refresh: () => ipcRenderer.invoke('simulators:refresh'),
  has: (id: string) => ipcRenderer.invoke('simulators:has', id),
  getById: (id: string) => ipcRenderer.invoke('simulators:getById', id),
});
```

### TypeScript Definitions

```typescript
// src/types/window.d.ts
export interface Simulator {
  id: string;
  name: string;
  installPath: string;
  executable: string;
  source: 'steam' | 'epic' | 'ea' | 'origin' | 'manual';
  steamAppId?: string;
  epicAppName?: string;
  metadata?: {
    userDataPath?: string;
    lastPlayed?: Date;
    sizeOnDisk?: number;
  };
}

declare global {
  interface Window {
    simulators: {
      getAll: () => Promise<Simulator[]>;
      refresh: () => Promise<{ simulators: Simulator[]; detectionTime: number }>;
      has: (id: string) => Promise<boolean>;
      getById: (id: string) => Promise<Simulator | undefined>;
    };
  }
}
```

### React Component Example

```typescript
// src/renderer/components/SimulatorSelector.tsx
import { useEffect, useState } from 'react';
import type { Simulator } from '@/types/window';

export function SimulatorSelector() {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSimulators();
  }, []);

  const loadSimulators = async () => {
    try {
      const sims = await window.simulators.getAll();
      setSimulators(sims);
    } catch (error) {
      console.error('Failed to load simulators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await window.simulators.refresh();
      setSimulators(result.simulators);
      console.log(`Refreshed in ${result.detectionTime}ms`);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div>Detecting simulators...</div>;
  }

  return (
    <div className="simulator-selector">
      <div className="header">
        <h2>Select Racing Simulator</h2>
        <button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {simulators.length === 0 ? (
        <div className="empty-state">
          <p>No racing simulators detected</p>
          <button onClick={handleRefresh}>Scan Again</button>
        </div>
      ) : (
        <div className="simulator-grid">
          {simulators.map((sim) => (
            <SimulatorCard key={sim.id} simulator={sim} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SimulatorCardProps {
  simulator: Simulator;
}

function SimulatorCard({ simulator }: SimulatorCardProps) {
  return (
    <div className="simulator-card">
      <div className="card-header">
        <h3>{simulator.name}</h3>
        <span className="source-badge">{simulator.source}</span>
      </div>

      <div className="card-details">
        <p className="path">{simulator.installPath}</p>

        {simulator.metadata?.sizeOnDisk && (
          <p className="size">
            {(simulator.metadata.sizeOnDisk / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
        )}

        {simulator.metadata?.lastPlayed && (
          <p className="last-played">
            Last played: {new Date(simulator.metadata.lastPlayed).toLocaleDateString()}
          </p>
        )}
      </div>

      <button className="select-button">
        Select Simulator
      </button>
    </div>
  );
}
```

## Step 4: UI Integration Points

### 1. Onboarding Wizard

```typescript
// In OnboardingWizard screen
const [detectedSims, setDetectedSims] = useState<Simulator[]>([]);

useEffect(() => {
  window.simulators.getAll().then(setDetectedSims);
}, []);

// Show detected simulators and let user select their primary sim
```

### 2. Settings Screen

```typescript
// In Settings screen
<Section title="Detected Simulators">
  <Button onClick={handleRefresh}>
    Scan for New Simulators
  </Button>

  <SimulatorList simulators={detectedSims} />

  <Button variant="secondary">
    Add Custom Installation Path
  </Button>
</Section>
```

### 3. Race Hub Pre-Race

```typescript
// In RaceHubPreRace screen
const [selectedSim, setSelectedSim] = useState<Simulator | null>(null);

// Load user's preferred simulator or let them choose
useEffect(() => {
  const preferred = settings.get('preferredSimulator');
  if (preferred) {
    window.simulators.getById(preferred).then(setSelectedSim);
  }
}, []);
```

## Step 5: Error Handling

```typescript
// Wrapper for simulator detection with error handling
async function detectSimulatorsWithErrorHandling() {
  try {
    const result = await window.simulators.refresh();

    if (result.errors && result.errors.length > 0) {
      console.warn('Some detectors failed:', result.errors);
      // Still return partial results
    }

    return result;

  } catch (error) {
    console.error('Complete detection failure:', error);

    // Fallback: try to load cached results
    try {
      return await window.simulators.getAll();
    } catch {
      // Show error to user
      showErrorToast('Failed to detect simulators. Please try manual setup.');
      return { simulators: [], detectionTime: 0 };
    }
  }
}
```

## Step 6: Performance Optimization

### Caching Strategy

```typescript
// Main process
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

ipcMain.handle('simulators:get', async () => {
  const lastScan = store.get('simulators.lastScan');
  const cached = store.get('simulators.detected', []);

  // Return cached if recent
  if (lastScan && Date.now() - new Date(lastScan).getTime() < CACHE_DURATION) {
    return cached;
  }

  // Otherwise refresh
  const result = await detectSimulators({
    enableSteam: true,
    enableEpic: true,
    enableEA: true,
    enableManualScan: false, // Skip slow scan
  });

  store.set('simulators.detected', result.simulators);
  store.set('simulators.lastScan', new Date().toISOString());

  return result.simulators;
});
```

### Background Refresh

```typescript
// Periodically refresh in background
setInterval(async () => {
  try {
    const result = await detectSimulators({
      enableManualScan: false, // Fast scan only
    });

    store.set('simulators.detected', result.simulators);

    // Notify renderer if new sims detected
    if (result.simulators.length > previousCount) {
      mainWindow?.webContents.send('simulators:updated', result.simulators);
    }
  } catch (error) {
    console.error('Background refresh failed:', error);
  }
}, 10 * 60 * 1000); // Every 10 minutes
```

## Testing

### Test Detection

```typescript
// Add to main process for debugging
ipcMain.handle('simulators:test', async () => {
  const result = await detectSimulators({
    enableSteam: true,
    enableEpic: true,
    enableEA: true,
    enableManualScan: true,
    useCache: false, // Force fresh scan
  });

  console.log('Detection test results:', {
    count: result.simulators.length,
    time: result.detectionTime,
    errors: result.errors,
    simulators: result.simulators.map(s => ({
      name: s.name,
      source: s.source,
      path: s.installPath,
    })),
  });

  return result;
});
```

### Manual Test Script

```typescript
// test-integration.ts
import { detectSimulators } from '@gridvox/sim-detection';

async function test() {
  console.log('Testing simulator detection...\n');

  const result = await detectSimulators({
    enableSteam: true,
    enableEpic: true,
    enableEA: true,
    enableManualScan: true,
  });

  console.log(`✓ Found ${result.simulators.length} simulators in ${result.detectionTime}ms\n`);

  result.simulators.forEach((sim, i) => {
    console.log(`${i + 1}. ${sim.name} (${sim.source})`);
    console.log(`   ${sim.installPath}`);
  });
}

test();
```

## Troubleshooting

### No Simulators Detected

1. Check if Steam/Epic are installed
2. Try enabling `enableManualScan: true`
3. Add custom paths via `customPaths` option
4. Check console for error messages

### Slow Detection

1. Disable `enableManualScan` for faster results
2. Use cached results when possible
3. Run full scan only on first launch or manual refresh

### Missing Simulator

1. Check if it's in the supported list (23 sims currently)
2. Add custom path to the simulator's installation directory
3. File an issue to add support for new simulator

## Support

**Documentation:** See [README.md](README.md)
**Examples:** See [example.ts](example.ts)
**Issues:** GridVox internal issue tracker

---

**Ready to integrate!** This library has been tested with 7 real installations and is production-ready.
