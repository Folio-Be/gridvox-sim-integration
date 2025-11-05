/**
 * Process detector
 * Detects currently running racing simulators
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import { getSimulatorByExecutable } from '../data/simulators';

const execAsync = promisify(exec);

export interface RunningProcess {
  pid: number;
  name: string;
  path?: string;
}

export interface RunningSimulator {
  id: string;
  name: string;
  pid: number;
  executable: string;
  path?: string;
}

/**
 * Get running processes on Windows
 */
async function getWindowsProcesses(): Promise<RunningProcess[]> {
  try {
    // Use WMIC to get process list with full path
    const { stdout } = await execAsync(
      'wmic process get ProcessId,Name,ExecutablePath /format:csv',
      { windowsHide: true }
    );

    const lines = stdout.split('\n').filter((line) => line.trim());
    const processes: RunningProcess[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 3) {
        const execPath = parts[1]?.trim();
        const name = parts[2]?.trim();
        const pid = parseInt(parts[3]?.trim() || '0');

        if (name && pid > 0) {
          processes.push({
            pid,
            name,
            path: execPath || undefined,
          });
        }
      }
    }

    return processes;
  } catch (error) {
    console.error('Error getting Windows processes:', error);
    return [];
  }
}

/**
 * Get running processes on macOS
 */
async function getMacOSProcesses(): Promise<RunningProcess[]> {
  try {
    const { stdout } = await execAsync('ps -axo pid,comm');

    const lines = stdout.split('\n').filter((line) => line.trim());
    const processes: RunningProcess[] = [];

    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        processes.push({
          pid: parseInt(match[1]),
          name: match[2].split('/').pop() || match[2],
          path: match[2],
        });
      }
    }

    return processes;
  } catch (error) {
    console.error('Error getting macOS processes:', error);
    return [];
  }
}

/**
 * Get running processes on Linux
 */
async function getLinuxProcesses(): Promise<RunningProcess[]> {
  try {
    const { stdout } = await execAsync('ps -eo pid,comm,cmd');

    const lines = stdout.split('\n').filter((line) => line.trim());
    const processes: RunningProcess[] = [];

    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].trim().match(/^(\d+)\s+(\S+)\s+(.+)$/);
      if (match) {
        processes.push({
          pid: parseInt(match[1]),
          name: match[2],
          path: match[3],
        });
      }
    }

    return processes;
  } catch (error) {
    console.error('Error getting Linux processes:', error);
    return [];
  }
}

/**
 * Get all running processes
 */
async function getRunningProcesses(): Promise<RunningProcess[]> {
  const platform = os.platform();

  if (platform === 'win32') {
    return getWindowsProcesses();
  } else if (platform === 'darwin') {
    return getMacOSProcesses();
  } else {
    return getLinuxProcesses();
  }
}

/**
 * Detect currently running racing simulators
 */
export async function detectRunningSimulators(): Promise<RunningSimulator[]> {
  const processes = await getRunningProcesses();
  const runningSimulators: RunningSimulator[] = [];

  for (const process of processes) {
    const simDef = getSimulatorByExecutable(process.name);

    if (simDef) {
      runningSimulators.push({
        id: simDef.id,
        name: simDef.name,
        pid: process.pid,
        executable: process.name,
        path: process.path,
      });
    }
  }

  return runningSimulators;
}

/**
 * Check if a specific simulator is currently running
 */
export async function isSimulatorRunning(simulatorId: string): Promise<boolean> {
  const running = await detectRunningSimulators();
  return running.some((sim) => sim.id === simulatorId);
}
