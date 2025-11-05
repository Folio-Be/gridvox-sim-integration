/**
 * Filesystem scanner
 * Scans common installation directories for manually installed simulators
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { DetectedSim } from '../types';
import { SIMULATORS, getSimulatorByExecutable } from '../data/simulators';

/**
 * Common installation directories to scan
 */
function getCommonInstallPaths(): string[] {
  const platform = os.platform();
  const paths: string[] = [];

  if (platform === 'win32') {
    // Windows common paths
    const drives = ['C', 'D', 'E', 'F'];

    for (const drive of drives) {
      paths.push(
        `${drive}:\\Program Files`,
        `${drive}:\\Program Files (x86)`,
        `${drive}:\\Games`,
        `${drive}:\\SteamLibrary`,
        `${drive}:\\Epic Games`
      );
    }
  } else if (platform === 'darwin') {
    // macOS paths
    paths.push(
      '/Applications',
      path.join(os.homedir(), 'Applications'),
      path.join(os.homedir(), 'Games')
    );
  } else {
    // Linux paths
    paths.push(
      path.join(os.homedir(), 'Games'),
      '/opt',
      '/usr/local/games',
      path.join(os.homedir(), '.wine/drive_c/Program Files'),
      path.join(os.homedir(), '.wine/drive_c/Program Files (x86)')
    );
  }

  return paths;
}

/**
 * Recursively search for simulator executable
 * Limited depth to avoid excessive scanning
 */
async function searchForExecutable(
  dir: string,
  executable: string,
  maxDepth: number = 3,
  currentDepth: number = 0
): Promise<string | null> {
  if (currentDepth >= maxDepth) {
    return null;
  }

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    // First, check if executable is in current directory
    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase() === executable.toLowerCase()) {
        return dir;
      }
    }

    // Then search subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip common non-game directories
        const skipDirs = ['$RECYCLE.BIN', 'System Volume Information', 'Windows', 'ProgramData'];
        if (skipDirs.includes(entry.name)) {
          continue;
        }

        const subPath = path.join(dir, entry.name);
        const found = await searchForExecutable(subPath, executable, maxDepth, currentDepth + 1);
        if (found) {
          return found;
        }
      }
    }
  } catch (error) {
    // Permission denied or other error, skip this directory
  }

  return null;
}

/**
 * Scan a specific directory for known simulators
 */
async function scanDirectory(dir: string): Promise<DetectedSim[]> {
  const simulators: DetectedSim[] = [];

  try {
    // Check if directory exists
    await fs.access(dir);

    // Look for each known simulator
    for (const simDef of SIMULATORS) {
      // Check known paths first
      if (simDef.knownPaths) {
        for (const knownPath of simDef.knownPaths) {
          const potentialPath = path.join(dir, knownPath);

          try {
            await fs.access(potentialPath);

            // Check if executable exists
            const execPath = path.join(potentialPath, simDef.executable);

            try {
              await fs.access(execPath);

              simulators.push({
                id: simDef.id,
                name: simDef.name,
                installPath: potentialPath,
                executable: simDef.executable,
                source: 'manual',
                metadata: {
                  userDataPath: simDef.userDataPath
                    ? path.join(os.homedir(), 'Documents', simDef.userDataPath)
                    : undefined,
                },
              });

              continue; // Found this sim, move to next
            } catch {
              // Try alternative executables
              if (simDef.alternativeExecutables) {
                for (const altExe of simDef.alternativeExecutables) {
                  try {
                    await fs.access(path.join(potentialPath, altExe));

                    simulators.push({
                      id: simDef.id,
                      name: simDef.name,
                      installPath: potentialPath,
                      executable: altExe,
                      source: 'manual',
                    });

                    break; // Found with alternative exe
                  } catch {
                    continue;
                  }
                }
              }
            }
          } catch {
            // Path doesn't exist, continue
          }
        }
      }

      // If not found in known paths, do a limited depth search
      const foundPath = await searchForExecutable(dir, simDef.executable, 2);
      if (foundPath) {
        // Make sure we haven't already added this
        if (!simulators.some((s) => s.installPath === foundPath)) {
          simulators.push({
            id: simDef.id,
            name: simDef.name,
            installPath: foundPath,
            executable: simDef.executable,
            source: 'manual',
          });
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be accessed
  }

  return simulators;
}

/**
 * Scan filesystem for manually installed racing simulators
 */
export async function detectFilesystemSimulators(customPaths?: string[]): Promise<DetectedSim[]> {
  const allPaths = [...getCommonInstallPaths(), ...(customPaths || [])];
  const allSimulators: DetectedSim[] = [];

  // Scan all paths in parallel
  const results = await Promise.allSettled(allPaths.map((p) => scanDirectory(p)));

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allSimulators.push(...result.value);
    }
  }

  // Deduplicate based on install path
  const uniqueSims = new Map<string, DetectedSim>();

  for (const sim of allSimulators) {
    const key = `${sim.id}:${sim.installPath}`;
    if (!uniqueSims.has(key)) {
      uniqueSims.set(key, sim);
    }
  }

  return Array.from(uniqueSims.values());
}
