import type { CaptureRegionPreset, SimProfile } from './simProfile';

export interface ProfileValidationOptions {
  simId?: string;
}

export interface ProfileValidationResult {
  simId: string;
  errors: string[];
  warnings: string[];
}

export function validateSimProfile(
  profile: SimProfile,
  options: ProfileValidationOptions = {},
): ProfileValidationResult {
  const simId = options.simId ?? profile.id ?? 'unknown';
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile.id) {
    errors.push('Missing "id"');
  }
  if (!profile.windowTitle) {
    errors.push('Missing "windowTitle"');
  }
  validateResolution(profile.resolution, errors);
  validateRegionPresets(profile.capture?.regionPresets, profile.capture?.defaultRegion, errors);
  validateBookmarkHotkey(profile.bookmarkHotkey, errors);

  if (!profile.paths?.recordingsDir) {
    warnings.push('paths.recordingsDir not set; using default data/recordings');
  }
  if (!profile.paths?.capturesDir) {
    warnings.push('paths.capturesDir not set; using default data/captures');
  }
  if (!profile.taxonomy?.elements?.length) {
    warnings.push('taxonomy.elements empty; downstream labelers may show blanks');
  }

  const windowPatterns = profile.validation?.windowTitlePatterns ?? [];
  if (windowPatterns.length === 0) {
    warnings.push('validation.windowTitlePatterns empty; window detection fallback may fail');
  } else if (!windowPatterns.includes(profile.windowTitle)) {
    warnings.push('windowTitle not listed in validation.windowTitlePatterns');
  }

  return { simId, errors, warnings };
}

function validateResolution(resolution: [number, number] | undefined, errors: string[]) {
  if (!resolution || resolution.length !== 2) {
    errors.push('resolution must be a tuple [width, height]');
    return;
  }
  const [width, height] = resolution;
  if (width <= 0 || height <= 0) {
    errors.push(`resolution must be positive, got ${width}x${height}`);
  }
}

function validateRegionPresets(
  presets: Record<string, CaptureRegionPreset> | undefined,
  defaultRegion: string | undefined,
  errors: string[],
) {
  if (!presets || Object.keys(presets).length === 0) {
    errors.push('capture.regionPresets must define at least one region');
    return;
  }
  if (!defaultRegion) {
    errors.push('capture.defaultRegion is required');
  } else if (!presets[defaultRegion]) {
    errors.push(`capture.defaultRegion "${defaultRegion}" not found in regionPresets`);
  }

  for (const [name, region] of Object.entries(presets)) {
    if (!region?.crop || region.crop.length !== 4) {
      errors.push(`capture.regionPresets["${name}"].crop must be [x, y, width, height]`);
      continue;
    }
    const [x, y, width, height] = region.crop;
    if (width <= 0 || height <= 0) {
      errors.push(
        `capture.regionPresets["${name}"].crop width/height must be positive (current ${width}x${height})`,
      );
    }
    if (x < 0 || y < 0) {
      errors.push(`capture.regionPresets["${name}"].crop coordinates must be >= 0`);
    }
  }
}

function validateBookmarkHotkey(
  hotkey: SimProfile['bookmarkHotkey'] | undefined,
  errors: string[],
) {
  if (!hotkey) {
    errors.push('bookmarkHotkey missing');
    return;
  }
  if (!hotkey.key) {
    errors.push('bookmarkHotkey.key missing');
  }
}
