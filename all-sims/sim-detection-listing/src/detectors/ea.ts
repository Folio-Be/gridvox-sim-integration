/**
 * EA App / Origin detector
 * Detects racing simulators installed through EA App or Origin
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { DetectedSim } from '../types';
import { SIMULATORS } from '../data/simulators';

/**
 * Check if running on Windows
 */
function isWindows(): boolean {
  return os.platform() === 'win32';
}

/**
 * Query Windows registry for EA/Origin games
 */
async function queryEARegistry(): Promise<DetectedSim[]> {
  if (!isWindows()) {
    return [];
  }

  const simulators: DetectedSim[] = [];

  try {
    const Registry = require('regedit');

    const keys = [
      'HKLM\\SOFTWARE\\EA Games',
      'HKLM\\SOFTWARE\\Wow6432Node\\EA Games',
      'HKLM\\SOFTWARE\\Origin Games',
      'HKLM\\SOFTWARE\\Wow6432Node\\Origin Games',
    ];

    return new Promise((resolve) => {
      Registry.list(keys, async (err: Error, result: any) => {
        if (err) {
          console.error('Error querying EA/Origin registry:', err);
          resolve([]);
          return;
        }

        for (const [baseKey, data] of Object.entries(result)) {
          if (!data || typeof data !== 'object') continue;

          const regData = data as any;

          // Check subkeys for game installations
          if (regData.keys) {
            for (const [gameName, gameData] of Object.entries(regData.keys)) {
              const gameInfo = gameData as any;

              if (gameInfo.values) {
                const installDir = gameInfo.values['Install Dir']?.value || gameInfo.values.InstallDir?.value;
                const displayName = gameInfo.values.DisplayName?.value || gameName;

                if (installDir) {
                  // Try to match against known simulators
                  const simDef = SIMULATORS.find(
                    (s) =>
                      displayName.toLowerCase().includes(s.name.toLowerCase()) ||
                      s.name.toLowerCase().includes(displayName.toLowerCase()) ||
                      gameName.toLowerCase().includes(s.id.toLowerCase())
                  );

                  if (simDef) {
                    try {
                      await fs.access(installDir);

                      // Try to find executable
                      const execPath = path.join(installDir, simDef.executable);

                      try {
                        await fs.access(execPath);

                        simulators.push({
                          id: simDef.id,
                          name: simDef.name,
                          installPath: installDir,
                          executable: simDef.executable,
                          source: baseKey.includes('Origin') ? 'origin' : 'ea',
                          metadata: {
                            userDataPath: simDef.userDataPath
                              ? path.join(os.homedir(), 'Documents', simDef.userDataPath)
                              : undefined,
                          },
                        });
                      } catch {
                        // Try alternative executables
                        if (simDef.alternativeExecutables) {
                          for (const altExe of simDef.alternativeExecutables) {
                            try {
                              await fs.access(path.join(installDir, altExe));
                              simulators.push({
                                id: simDef.id,
                                name: simDef.name,
                                installPath: installDir,
                                executable: altExe,
                                source: baseKey.includes('Origin') ? 'origin' : 'ea',
                              });
                              break;
                            } catch {
                              continue;
                            }
                          }
                        }
                      }
                    } catch {
                      // Install directory doesn't exist
                    }
                  }
                }
              }
            }
          }
        }

        resolve(simulators);
      });
    });
  } catch (error) {
    console.error('Error in EA/Origin detection:', error);
    return [];
  }
}

/**
 * Detect racing simulators installed through EA App or Origin
 */
export async function detectEASimulators(): Promise<DetectedSim[]> {
  if (!isWindows()) {
    return [];
  }

  return queryEARegistry();
}
