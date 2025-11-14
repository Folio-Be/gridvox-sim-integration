import {
  loadSimProfile,
  SimProfile,
  SimProfileError,
} from '../src/config/simProfile';

export function getSimProfileOrExit(sim: string): SimProfile {
  try {
    return loadSimProfile(sim);
  } catch (err) {
    if (err instanceof SimProfileError) {
      console.error(`[sim-profile] ${err.message}`);
      for (const detail of err.details ?? []) {
        console.error(`  - ${detail}`);
      }
      process.exit(1);
    }
    throw err;
  }
}

export function resolveCaptureRegionOrExit(
  profile: SimProfile,
  regionName?: string,
) {
  const presets = profile.capture?.regionPresets ?? {};
  const name = regionName ?? profile.capture?.defaultRegion;
  if (!name || !presets[name]) {
    console.error(
      `[sim-profile] Capture region "${regionName ?? 'default'}" not found for ${
        profile.id
      }. Available: ${Object.keys(presets).join(', ') || 'none'}`,
    );
    process.exit(1);
  }
  return { name, preset: presets[name] };
}
