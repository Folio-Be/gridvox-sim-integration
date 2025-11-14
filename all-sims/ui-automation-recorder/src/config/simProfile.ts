import fs from 'fs';
import path from 'path';
import { validateSimProfile } from './profileValidation';

export interface CaptureRegionPreset {
  crop: [number, number, number, number];
  description?: string;
  tag?: string;
}

export interface SimProfilePaths {
  recordingsDir?: string;
  capturesDir?: string;
}

export interface SimProfileTaxonomy {
  elements: string[];
}

export interface SimProfileExtraction {
  fps?: number;
  sceneThreshold?: number;
  ffmpegPath?: string;
}

export interface SimProfileValidationRules {
  requiredProcesses?: string[];
  windowTitlePatterns?: string[];
  resolutionWhitelist?: [number, number][];
}

export interface SimProfile {
  id: string;
  windowTitle: string;
  resolution: [number, number];
  framerate: number;
  capture: {
    defaultRegion: string;
    regionPresets: Record<string, CaptureRegionPreset>;
    cursorPollHz?: number;
  };
  bookmarkHotkey: {
    ctrl: boolean;
    shift: boolean;
    key: string;
    noteMode?: 'none' | 'stdin';
  };
  paths: SimProfilePaths;
  taxonomy: SimProfileTaxonomy;
  extraction?: SimProfileExtraction;
  validation?: SimProfileValidationRules;
}

export class SimProfileError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'SimProfileError';
  }
}

export function loadSimProfile(sim: string): SimProfile {
  const profilePath = path.resolve('config', 'sim-profiles', `${sim}.json`);
  if (!fs.existsSync(profilePath)) {
    throw new SimProfileError(`Sim profile "${sim}" not found`, [
      `File missing: ${profilePath}`,
    ]);
  }

  let rawData: string;
  try {
    rawData = fs.readFileSync(profilePath, 'utf-8');
  } catch (err) {
    throw new SimProfileError(`Failed reading sim profile "${sim}"`, [
      (err as Error).message,
    ]);
  }

  let profile: SimProfile;
  try {
    profile = JSON.parse(rawData);
  } catch (err) {
    throw new SimProfileError(`Invalid JSON in profile "${sim}"`, [
      (err as Error).message,
    ]);
  }

  const result = validateSimProfile(profile, { simId: sim });
  if (result.errors.length > 0) {
    throw new SimProfileError(
      `Sim profile "${sim}" failed validation`,
      result.errors,
    );
  }

  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.warn(`[sim-profile:${sim}] ${warning}`);
    }
  }

  return profile;
}
