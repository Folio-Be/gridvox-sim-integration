import { MODEL_PRESETS, ModelDescriptor, TierPreset } from '../config/modelPresets';
import { HardwareProfile } from '../probe/hardwareProbe';

export interface ModelPlan {
  tier: TierPreset['tier'];
  presetLabel: string;
  selectedModels: ModelDescriptor[];
  limitingFactor: string;
}

export function planModels(hardware: HardwareProfile): ModelPlan {
  const discreteGpu = pickDiscreteGpu(hardware);
  const availableVram = discreteGpu?.vramGb ?? 0;
  const availableRam = hardware.ramGb;
  const threads = hardware.cpuThreads;

  const preset =
    MODEL_PRESETS.find(
      (p) =>
        availableVram >= p.minVramGb &&
        availableRam >= p.minRamGb &&
        threads >= p.minCpuThreads,
    ) ?? MODEL_PRESETS[MODEL_PRESETS.length - 1];

  if (!preset) {
    throw new Error('MODEL_PRESETS is empty; cannot compute model plan.');
  }

  const limitingFactor = !discreteGpu
    ? 'no-discrete-gpu'
    : availableVram < preset.minVramGb
      ? 'vram'
      : availableRam < preset.minRamGb
        ? 'ram'
        : threads < preset.minCpuThreads
          ? 'cpu'
          : 'none';

  return {
    tier: preset.tier,
    presetLabel: preset.label,
    selectedModels: preset.defaultModels,
    limitingFactor,
  };
}

function pickDiscreteGpu(profile: HardwareProfile) {
  const preferredVendors = ['nvidia', 'amd', 'intel'];
  return profile.gpus
    .filter((gpu) =>
      preferredVendors.some((vendor) =>
        gpu.vendor.toLowerCase().includes(vendor),
      ),
    )
    .sort((a, b) => b.vramGb - a.vramGb)[0];
}
