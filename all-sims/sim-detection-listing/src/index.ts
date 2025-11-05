/**
 * Racing Simulator Detection Library
 * Main API entry point
 */

import NodeCache from 'node-cache';
import { DetectedSim, DetectionOptions, DetectionResult } from './types';
import { detectSteamSimulators } from './detectors/steam';
import { detectRegistrySimulators } from './detectors/registry';
import { detectEpicSimulators } from './detectors/epic';
import { detectEASimulators } from './detectors/ea';
import { detectFilesystemSimulators } from './detectors/filesystem';
import { detectRunningSimulators, isSimulatorRunning } from './detectors/process';

// Export types
export * from './types';
export * from './data/simulators';
export { detectRunningSimulators, isSimulatorRunning } from './detectors/process';

// Initialize cache
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60,
  useClones: false,
});

/**
 * Default detection options
 */
const DEFAULT_OPTIONS: DetectionOptions = {
  enableSteam: true,
  enableEpic: true,
  enableEA: true,
  enableManualScan: false, // Disabled by default as it's slower
  useCache: true,
  cacheTTL: 300000, // 5 minutes
};

/**
 * Detect all installed racing simulators
 */
export async function detectSimulators(options?: DetectionOptions): Promise<DetectionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cacheKey = 'all-simulators';
  const startTime = Date.now();

  // Check cache
  if (opts.useCache) {
    const cached = cache.get<DetectionResult>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const errors: Array<{ detector: string; error: string }> = [];
  const allSimulators: DetectedSim[] = [];

  // Run all enabled detectors in parallel
  const detectionPromises: Promise<DetectedSim[]>[] = [];

  if (opts.enableSteam) {
    detectionPromises.push(
      detectSteamSimulators().catch((err) => {
        errors.push({ detector: 'steam', error: err.message });
        return [];
      })
    );

    // Registry detector also finds Steam games on Windows
    detectionPromises.push(
      detectRegistrySimulators().catch((err) => {
        errors.push({ detector: 'registry', error: err.message });
        return [];
      })
    );
  }

  if (opts.enableEpic) {
    detectionPromises.push(
      detectEpicSimulators().catch((err) => {
        errors.push({ detector: 'epic', error: err.message });
        return [];
      })
    );
  }

  if (opts.enableEA) {
    detectionPromises.push(
      detectEASimulators().catch((err) => {
        errors.push({ detector: 'ea', error: err.message });
        return [];
      })
    );
  }

  if (opts.enableManualScan) {
    detectionPromises.push(
      detectFilesystemSimulators(opts.customPaths).catch((err) => {
        errors.push({ detector: 'filesystem', error: err.message });
        return [];
      })
    );
  }

  // Wait for all detectors
  const results = await Promise.all(detectionPromises);

  // Combine results
  for (const simList of results) {
    allSimulators.push(...simList);
  }

  // Deduplicate simulators (same ID + install path)
  const uniqueSimulators = new Map<string, DetectedSim>();

  for (const sim of allSimulators) {
    const key = `${sim.id}:${sim.installPath}`;

    if (!uniqueSimulators.has(key)) {
      uniqueSimulators.set(key, sim);
    } else {
      // If duplicate, prefer Steam source
      const existing = uniqueSimulators.get(key)!;
      if (sim.source === 'steam' && existing.source !== 'steam') {
        uniqueSimulators.set(key, sim);
      }
    }
  }

  const detectionTime = Date.now() - startTime;

  const result: DetectionResult = {
    simulators: Array.from(uniqueSimulators.values()),
    detectionTime,
    errors: errors.length > 0 ? errors : undefined,
  };

  // Cache the result
  if (opts.useCache && opts.cacheTTL) {
    cache.set(cacheKey, result, opts.cacheTTL / 1000);
  }

  return result;
}

/**
 * Detect simulators and return simple array
 */
export async function getInstalledSimulators(options?: DetectionOptions): Promise<DetectedSim[]> {
  const result = await detectSimulators(options);
  return result.simulators;
}

/**
 * Check if a specific simulator is installed
 */
export async function isSimulatorInstalled(
  simulatorId: string,
  options?: DetectionOptions
): Promise<boolean> {
  const simulators = await getInstalledSimulators(options);
  return simulators.some((sim) => sim.id === simulatorId);
}

/**
 * Get a specific simulator by ID
 */
export async function getSimulator(
  simulatorId: string,
  options?: DetectionOptions
): Promise<DetectedSim | undefined> {
  const simulators = await getInstalledSimulators(options);
  return simulators.find((sim) => sim.id === simulatorId);
}

/**
 * Clear the detection cache
 */
export function clearCache(): void {
  cache.flushAll();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}

/**
 * Refresh detection (clears cache and re-detects)
 */
export async function refreshDetection(options?: DetectionOptions): Promise<DetectionResult> {
  clearCache();
  return detectSimulators(options);
}

// Default export
export default {
  detectSimulators,
  getInstalledSimulators,
  isSimulatorInstalled,
  getSimulator,
  detectRunningSimulators,
  isSimulatorRunning,
  clearCache,
  getCacheStats,
  refreshDetection,
};
