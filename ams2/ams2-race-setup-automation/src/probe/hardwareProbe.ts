import si from 'systeminformation';

export interface GpuProfile {
  vendor: string;
  model: string;
  vramGb: number;
}

export interface HardwareProfile {
  cpuModel: string;
  cpuThreads: number;
  ramGb: number;
  gpus: GpuProfile[];
  storageSsd: boolean;
}

export async function probeHardware(): Promise<HardwareProfile> {
  const [cpu, mem, graphics, disk] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.graphics(),
    si.diskLayout(),
  ]);

  const gpus: GpuProfile[] = graphics.controllers.map((controller) => ({
    vendor: controller.vendor ?? 'unknown',
    model: controller.model ?? 'unknown',
    vramGb: controller.vram ? round(controller.vram / 1024) : 0,
  }));

  const storageSsd = disk.some((d) => d.type?.toLowerCase().includes('ssd'));

  return {
    cpuModel: cpu.brand,
    cpuThreads: cpu.cores * (cpu.processors > 0 ? cpu.processors : 1),
    ramGb: round(mem.total / (1024 ** 3)),
    gpus,
    storageSsd,
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
