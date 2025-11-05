/**
 * Steam library detection
 * Detects racing simulators installed through Steam
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as VDF from '@node-steam/vdf';
import { DetectedSim, SteamLibrary, SteamAppManifest } from '../types';
import { getSimulatorBySteamAppId } from '../data/simulators';

/**
 * Get Steam installation path for current platform
 */
export async function getSteamInstallPath(): Promise<string | null> {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // On Windows, check registry for Steam path
      const Registry = require('regedit');

      return new Promise((resolve) => {
        const keys = [
          'HKLM\\SOFTWARE\\Valve\\Steam',
          'HKLM\\SOFTWARE\\Wow6432Node\\Valve\\Steam'
        ];

        Registry.list(keys, (err: Error, result: any) => {
          if (err) {
            resolve(null);
            return;
          }

          for (const key of keys) {
            const installPath = result[key]?.values?.InstallPath?.value;
            if (installPath) {
              resolve(installPath);
              return;
            }
          }

          resolve(null);
        });
      });
    } else if (platform === 'darwin') {
      // macOS default path
      const defaultPath = path.join(os.homedir(), 'Library/Application Support/Steam');
      try {
        await fs.access(defaultPath);
        return defaultPath;
      } catch {
        return null;
      }
    } else if (platform === 'linux') {
      // Linux default paths
      const paths = [
        path.join(os.homedir(), '.local/share/Steam'),
        path.join(os.homedir(), '.steam/steam'),
        path.join(os.homedir(), '.var/app/com.valvesoftware.Steam/.local/share/Steam'), // Flatpak
      ];

      for (const steamPath of paths) {
        try {
          await fs.access(steamPath);
          return steamPath;
        } catch {
          continue;
        }
      }
      return null;
    }
  } catch (error) {
    console.error('Error finding Steam installation:', error);
  }

  return null;
}

/**
 * Parse Steam libraryfolders.vdf file
 */
export async function parseSteamLibraries(steamPath: string): Promise<SteamLibrary[]> {
  const libraryFoldersPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');

  try {
    const content = await fs.readFile(libraryFoldersPath, 'utf-8');
    const parsed = VDF.parse(content);

    const libraries: SteamLibrary[] = [];

    // Add main Steam library
    libraries.push({
      path: steamPath,
      label: 'Main Library',
    });

    // Parse additional libraries
    const libraryData = parsed.libraryfolders || parsed.LibraryFolders;

    if (libraryData) {
      for (const [key, value] of Object.entries(libraryData)) {
        // Skip numeric keys that are not library entries
        if (key === 'contentstatsid' || key === 'TimeNextStatsReport') {
          continue;
        }

        if (typeof value === 'object' && value !== null) {
          const libEntry = value as any;
          if (libEntry.path) {
            libraries.push({
              path: libEntry.path,
              label: libEntry.label || `Library ${key}`,
              contentid: libEntry.contentid,
              totalsize: libEntry.totalsize,
            });
          }
        }
      }
    }

    return libraries;
  } catch (error) {
    console.error('Error parsing Steam library folders:', error);
    return [{ path: steamPath, label: 'Main Library' }];
  }
}

/**
 * Parse Steam app manifest file (appmanifest_*.acf)
 */
async function parseAppManifest(manifestPath: string): Promise<SteamAppManifest | null> {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    const parsed = VDF.parse(content);

    const appState = parsed.AppState;
    if (!appState) {
      return null;
    }

    return {
      appid: appState.appid,
      name: appState.name,
      installdir: appState.installdir,
      StateFlags: appState.StateFlags,
      LastUpdated: appState.LastUpdated,
      SizeOnDisk: appState.SizeOnDisk,
      buildid: appState.buildid,
    };
  } catch (error) {
    console.error(`Error parsing manifest ${manifestPath}:`, error);
    return null;
  }
}

/**
 * Get all installed Steam apps in a library
 */
async function getInstalledAppsInLibrary(libraryPath: string): Promise<SteamAppManifest[]> {
  const steamappsPath = path.join(libraryPath, 'steamapps');
  const manifests: SteamAppManifest[] = [];

  try {
    const files = await fs.readdir(steamappsPath);

    for (const file of files) {
      if (file.startsWith('appmanifest_') && file.endsWith('.acf')) {
        const manifestPath = path.join(steamappsPath, file);
        const manifest = await parseAppManifest(manifestPath);
        if (manifest) {
          manifests.push(manifest);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading library at ${libraryPath}:`, error);
  }

  return manifests;
}

/**
 * Detect racing simulators installed through Steam
 */
export async function detectSteamSimulators(): Promise<DetectedSim[]> {
  const simulators: DetectedSim[] = [];

  // Find Steam installation
  const steamPath = await getSteamInstallPath();
  if (!steamPath) {
    console.warn('Steam installation not found');
    return simulators;
  }

  // Get all Steam libraries
  const libraries = await parseSteamLibraries(steamPath);

  // Scan each library for installed games
  for (const library of libraries) {
    const apps = await getInstalledAppsInLibrary(library.path);

    for (const app of apps) {
      // Check if this app is a known racing simulator
      const simDef = getSimulatorBySteamAppId(app.appid);

      if (simDef) {
        const installPath = path.join(library.path, 'steamapps', 'common', app.installdir);

        // Verify the installation exists
        try {
          await fs.access(installPath);

          // Try to find the executable
          const execPath = path.join(installPath, simDef.executable);
          let executableExists = false;

          try {
            await fs.access(execPath);
            executableExists = true;
          } catch {
            // Try alternative executables
            if (simDef.alternativeExecutables) {
              for (const altExe of simDef.alternativeExecutables) {
                try {
                  await fs.access(path.join(installPath, altExe));
                  executableExists = true;
                  break;
                } catch {
                  continue;
                }
              }
            }
          }

          if (executableExists) {
            simulators.push({
              id: simDef.id,
              name: simDef.name,
              installPath,
              executable: simDef.executable,
              source: 'steam',
              steamAppId: app.appid,
              metadata: {
                lastPlayed: app.LastUpdated ? new Date(parseInt(app.LastUpdated) * 1000) : undefined,
                sizeOnDisk: app.SizeOnDisk ? parseInt(app.SizeOnDisk) : undefined,
                userDataPath: simDef.userDataPath
                  ? path.join(os.homedir(), 'Documents', simDef.userDataPath)
                  : undefined,
              },
            });
          }
        } catch {
          // Installation path doesn't exist, skip
          continue;
        }
      }
    }
  }

  return simulators;
}
