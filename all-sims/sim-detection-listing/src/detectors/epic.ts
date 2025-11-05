/**
 * Epic Games Store detector
 * Detects racing simulators installed through Epic Games Launcher
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { DetectedSim, EpicManifest } from '../types';
import { getSimulatorByEpicAppName, SIMULATORS } from '../data/simulators';

/**
 * Get Epic Games manifests directory
 */
function getEpicManifestsPath(): string | null {
  if (os.platform() !== 'win32') {
    return null;
  }

  const programData = process.env.PROGRAMDATA;
  if (!programData) {
    return null;
  }

  return path.join(programData, 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests');
}

/**
 * Parse Epic Games manifest file (.item)
 */
async function parseEpicManifest(manifestPath: string): Promise<EpicManifest | null> {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    const manifest: EpicManifest = JSON.parse(content);

    return manifest;
  } catch (error) {
    console.error(`Error parsing Epic manifest ${manifestPath}:`, error);
    return null;
  }
}

/**
 * Detect racing simulators installed through Epic Games Store
 */
export async function detectEpicSimulators(): Promise<DetectedSim[]> {
  const simulators: DetectedSim[] = [];

  const manifestsPath = getEpicManifestsPath();
  if (!manifestsPath) {
    return simulators;
  }

  try {
    // Check if manifests directory exists
    await fs.access(manifestsPath);

    const files = await fs.readdir(manifestsPath);

    for (const file of files) {
      if (file.endsWith('.item')) {
        const manifestPath = path.join(manifestsPath, file);
        const manifest = await parseEpicManifest(manifestPath);

        if (manifest && !manifest.bIsIncompleteInstall) {
          // Check if this is a known racing simulator
          let simDef = getSimulatorByEpicAppName(manifest.AppName);

          // If not found by Epic app name, try matching by display name
          if (!simDef) {
            simDef = SIMULATORS.find(
              (s) =>
                manifest.DisplayName.toLowerCase().includes(s.name.toLowerCase()) ||
                s.name.toLowerCase().includes(manifest.DisplayName.toLowerCase())
            );
          }

          if (simDef) {
            const installPath = manifest.InstallLocation;

            // Verify installation exists
            try {
              await fs.access(installPath);

              // Determine executable
              let executable = simDef.executable;
              if (manifest.LaunchExecutable) {
                // Use the executable from manifest if available
                executable = path.basename(manifest.LaunchExecutable);
              }

              const execPath = path.join(installPath, executable);

              try {
                await fs.access(execPath);

                simulators.push({
                  id: simDef.id,
                  name: simDef.name,
                  installPath,
                  executable,
                  source: 'epic',
                  epicAppName: manifest.AppName,
                  version: manifest.AppVersionString,
                  metadata: {
                    sizeOnDisk: manifest.InstallSize,
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
                      await fs.access(path.join(installPath, altExe));
                      simulators.push({
                        id: simDef.id,
                        name: simDef.name,
                        installPath,
                        executable: altExe,
                        source: 'epic',
                        epicAppName: manifest.AppName,
                        version: manifest.AppVersionString,
                        metadata: {
                          sizeOnDisk: manifest.InstallSize,
                        },
                      });
                      break;
                    } catch {
                      continue;
                    }
                  }
                }
              }
            } catch {
              // Installation path doesn't exist
              continue;
            }
          }
        }
      }
    }
  } catch (error) {
    // Manifests directory doesn't exist or can't be read
    console.debug('Epic Games manifests not found or inaccessible');
  }

  return simulators;
}
