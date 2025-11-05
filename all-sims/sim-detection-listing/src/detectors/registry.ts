/**
 * Windows Registry detector
 * Detects simulators installed via registry entries (non-Steam installations)
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { DetectedSim } from '../types';
import { SIMULATORS, getSimulatorById } from '../data/simulators';

/**
 * Check if running on Windows
 */
function isWindows(): boolean {
  return os.platform() === 'win32';
}

/**
 * Query Windows registry using regedit package
 */
async function queryRegistry(keys: string[]): Promise<any> {
  if (!isWindows()) {
    return {};
  }

  try {
    const Registry = require('regedit');

    return new Promise((resolve, reject) => {
      Registry.list(keys, (err: Error, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error('Error querying registry:', error);
    return {};
  }
}

/**
 * Check Steam uninstall entries in registry
 */
async function checkSteamUninstallEntries(): Promise<DetectedSim[]> {
  const simulators: DetectedSim[] = [];

  const steamAppKeys = SIMULATORS.filter((s) => s.steamAppId).map(
    (s) => `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App ${s.steamAppId}`
  );

  try {
    const results = await queryRegistry(steamAppKeys);

    for (const [key, data] of Object.entries(results)) {
      if (data && typeof data === 'object') {
        const regData = data as any;
        const appId = key.match(/Steam App (\d+)/)?.[1];

        if (appId && regData.values?.InstallLocation?.value) {
          const simDef = SIMULATORS.find((s) => s.steamAppId === appId);

          if (simDef) {
            const installPath = regData.values.InstallLocation.value;

            // Verify executable exists
            try {
              const execPath = path.join(installPath, simDef.executable);
              await fs.access(execPath);

              simulators.push({
                id: simDef.id,
                name: simDef.name,
                installPath,
                executable: simDef.executable,
                source: 'steam',
                steamAppId: appId,
              });
            } catch {
              // Executable not found, skip
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking Steam uninstall entries:', error);
  }

  return simulators;
}

/**
 * Check general uninstall entries for manually installed games
 */
async function checkUninstallEntries(): Promise<DetectedSim[]> {
  const simulators: DetectedSim[] = [];

  const uninstallKeys = [
    'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  ];

  try {
    const results = await queryRegistry(uninstallKeys);

    for (const [baseKey, data] of Object.entries(results)) {
      if (!data || typeof data !== 'object') continue;

      const regData = data as any;

      // Iterate through subkeys
      if (regData.keys) {
        for (const [subkeyName, subkeyData] of Object.entries(regData.keys)) {
          const subData = subkeyData as any;

          if (subData.values) {
            const displayName = subData.values.DisplayName?.value;
            const installLocation = subData.values.InstallLocation?.value;

            if (displayName && installLocation) {
              // Try to match against known simulators
              const simDef = SIMULATORS.find(
                (s) =>
                  displayName.toLowerCase().includes(s.name.toLowerCase()) ||
                  s.name.toLowerCase().includes(displayName.toLowerCase())
              );

              if (simDef) {
                try {
                  const execPath = path.join(installLocation, simDef.executable);
                  await fs.access(execPath);

                  // Check if we already detected this via Steam
                  if (!simulators.some((s) => s.installPath === installLocation)) {
                    simulators.push({
                      id: simDef.id,
                      name: simDef.name,
                      installPath: installLocation,
                      executable: simDef.executable,
                      source: 'manual',
                    });
                  }
                } catch {
                  // Executable not found
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking uninstall entries:', error);
  }

  return simulators;
}

/**
 * Detect racing simulators via Windows registry
 */
export async function detectRegistrySimulators(): Promise<DetectedSim[]> {
  if (!isWindows()) {
    return [];
  }

  const steamSims = await checkSteamUninstallEntries();
  const manualSims = await checkUninstallEntries();

  // Combine and deduplicate
  const allSims = [...steamSims, ...manualSims];
  const uniqueSims = new Map<string, DetectedSim>();

  for (const sim of allSims) {
    const key = `${sim.id}:${sim.installPath}`;
    if (!uniqueSims.has(key)) {
      uniqueSims.set(key, sim);
    }
  }

  return Array.from(uniqueSims.values());
}
