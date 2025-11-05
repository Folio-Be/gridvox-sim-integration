/**
 * Core types for racing simulator detection
 */

export type SimSource = 'steam' | 'epic' | 'ea' | 'origin' | 'manual' | 'unknown';

export type Platform = 'win32' | 'darwin' | 'linux';

/**
 * Detected racing simulator information
 */
export interface DetectedSim {
  /** Standardized simulator ID (e.g., 'iracing', 'assetto-corsa') */
  id: string;

  /** Display name */
  name: string;

  /** Installation path */
  installPath: string;

  /** Main executable filename */
  executable: string;

  /** Detection source */
  source: SimSource;

  /** Steam AppID if applicable */
  steamAppId?: string;

  /** Epic App Name if applicable */
  epicAppName?: string;

  /** Game version if detectable */
  version?: string;

  /** Additional metadata */
  metadata?: {
    /** User data/save directory */
    userDataPath?: string;

    /** Last played timestamp */
    lastPlayed?: Date;

    /** Install size in bytes */
    sizeOnDisk?: number;
  };
}

/**
 * Simulator definition metadata
 */
export interface SimulatorDefinition {
  id: string;
  name: string;
  executable: string;
  steamAppId?: string;
  epicAppName?: string;

  /** Known installation subdirectories */
  knownPaths?: string[];

  /** User data path relative to Documents */
  userDataPath?: string;

  /** Alternative executables for different versions */
  alternativeExecutables?: string[];
}

/**
 * Steam library folder information
 */
export interface SteamLibrary {
  path: string;
  label?: string;
  contentid?: string;
  totalsize?: string;
}

/**
 * Steam app manifest data
 */
export interface SteamAppManifest {
  appid: string;
  name: string;
  installdir: string;
  StateFlags?: string;
  LastUpdated?: string;
  SizeOnDisk?: string;
  buildid?: string;
}

/**
 * Epic Games manifest data
 */
export interface EpicManifest {
  FormatVersion: number;
  bIsIncompleteInstall: boolean;
  AppName: string;
  DisplayName: string;
  InstallLocation: string;
  InstallSize: number;
  AppVersionString?: string;
  LaunchExecutable?: string;
}

/**
 * Detection options
 */
export interface DetectionOptions {
  /** Enable Steam detection */
  enableSteam?: boolean;

  /** Enable Epic Games Store detection */
  enableEpic?: boolean;

  /** Enable EA/Origin detection */
  enableEA?: boolean;

  /** Enable manual filesystem scanning */
  enableManualScan?: boolean;

  /** Additional custom paths to scan */
  customPaths?: string[];

  /** Use cached results if available */
  useCache?: boolean;

  /** Cache TTL in milliseconds */
  cacheTTL?: number;
}

/**
 * Detection result
 */
export interface DetectionResult {
  simulators: DetectedSim[];
  detectionTime: number; // milliseconds
  errors?: Array<{
    detector: string;
    error: string;
  }>;
}
