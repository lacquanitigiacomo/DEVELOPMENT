export interface HardwareProfile {
  hasGPU: boolean;
  ramGB: number;
  cpuCores: number;
  platform: 'darwin' | 'linux' | 'win32' | 'browser';
  supportsWebGPU: boolean;
  supportsWebGL: boolean;
  tier: 'high' | 'medium' | 'low' | 'minimal';
}

export async function detectHardware(): Promise<HardwareProfile> {
  // Server-side detection
  const os = await import('os');
  const totalRAM = Math.round(os.totalmem() / 1024 / 1024 / 1024);
  const cores = os.cpus().length;
  const platform = os.platform() as any;

  let tier: HardwareProfile['tier'] = 'minimal';
  if (totalRAM >= 16 && cores >= 8) tier = 'high';
  else if (totalRAM >= 8 && cores >= 4) tier = 'medium';
  else if (totalRAM >= 4 && cores >= 2) tier = 'low';

  return {
    hasGPU: false, // Server usually no GPU
    ramGB: totalRAM,
    cpuCores: cores,
    platform,
    supportsWebGPU: false,
    supportsWebGL: false,
    tier,
  };
}

// Client-side detection (for browser/mobile)
export function detectClientHardware(): HardwareProfile {
  const nav = navigator as any;
  const memory = nav.deviceMemory || 4;
  const cores = nav.hardwareConcurrency || 2;
  const platform = /Mac/.test(navigator.platform) ? 'darwin' : 
                   /Win/.test(navigator.platform) ? 'win32' : 'linux';

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const supportsWebGL = !!gl;
  const supportsWebGPU = 'gpu' in nav;

  let tier: HardwareProfile['tier'] = 'minimal';
  if (memory >= 8 && cores >= 6 && supportsWebGPU) tier = 'high';
  else if (memory >= 4 && cores >= 4 && supportsWebGL) tier = 'medium';
  else if (memory >= 2 && cores >= 2) tier = 'low';

  return {
    hasGPU: supportsWebGL || supportsWebGPU,
    ramGB: memory,
    cpuCores: cores,
    platform,
    supportsWebGPU,
    supportsWebGL,
    tier,
  };
}
