/**
 * RYB Hardware Adaptive Engine
 * Detects device capabilities and picks the best AI strategy.
 * Goal: NEVER break. If GPU/CPU is weak, fall back gracefully.
 */

export interface HardwareProfile {
  platform: 'mac' | 'win' | 'linux' | 'ios' | 'android' | 'unknown';
  cpuCores: number;
  totalRAM_GB: number;
  hasGPU: boolean;
  isAppleSilicon: boolean;
  isMobile: boolean;
  score: number; // 0-100 composite score
  recommendedStrategy: 'local-llm' | 'local-small' | 'hybrid' | 'cloud-free' | 'rule-only';
}

function estimateRAM(): number {
  try {
    // Node.js
    if (typeof process !== 'undefined' && process.memoryUsage) {
      // External signal or env var
      const envRam = process.env.RYB_DEVICE_RAM_GB;
      if (envRam) return parseFloat(envRam);
    }
  } catch { /* not Node */ }

  // Browser / PWA fallback
  try {
    const nav = (globalThis as any).navigator;
    if (nav?.deviceMemory) return nav.deviceMemory; // Chrome: 0.25, 0.5, 1, 2, 4, 8
  } catch { /* no navigator */ }

  return 4; // conservative default
}

function detectPlatform(): HardwareProfile['platform'] {
  try {
    const platform = process.platform;
    if (platform === 'darwin') return 'mac';
    if (platform === 'win32') return 'win';
    if (platform === 'linux') return 'linux';
  } catch { /* browser */ }

  try {
    const ua = (globalThis as any).navigator?.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Mac/.test(ua)) return 'mac';
    if (/Windows/.test(ua)) return 'win';
    if (/Linux/.test(ua)) return 'linux';
  } catch { /* nothing */ }

  return 'unknown';
}

function detectCores(): number {
  try {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      return navigator.hardwareConcurrency;
    }
  } catch { /* no navigator */ }

  try {
    const os = require('os');
    return os.cpus().length;
  } catch { /* no os */ }

  return 2; // safe fallback
}

function isAppleSilicon(platform: string): boolean {
  if (platform !== 'mac') return false;
  try {
    const os = require('os');
    const arch = os.arch();
    return arch === 'arm64';
  } catch { /* browser */ }
  try {
    const ua = (globalThis as any).navigator?.userAgent || '';
    return /Mac.*Apple/.test(ua) && !/Intel/.test(ua);
  } catch { return false; }
}

function hasGPU(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch { return false; }
}

export function detectHardware(): HardwareProfile {
  const platform = detectPlatform();
  const cpuCores = detectCores();
  const totalRAM_GB = estimateRAM();
  const isMobile = platform === 'ios' || platform === 'android';
  const appleSilicon = isAppleSilicon(platform);
  const gpu = hasGPU();

  // Composite score: RAM (40%) + Cores (30%) + GPU (20%) + Apple Silicon bonus (10%)
  let score = 0;
  score += Math.min(totalRAM_GB / 16, 1) * 40;
  score += Math.min(cpuCores / 8, 1) * 30;
  score += (gpu ? 20 : 0);
  score += (appleSilicon ? 10 : 0);
  score = Math.round(score);

  let strategy: HardwareProfile['recommendedStrategy'];
  if (score >= 70 && !isMobile) {
    strategy = 'local-llm'; // Ollama 7B models
  } else if (score >= 50 && !isMobile) {
    strategy = 'local-small'; // Ollama 3B / tiny models
  } else if (score >= 30) {
    strategy = 'hybrid'; // Local rules + cloud free tier
  } else if (score >= 15) {
    strategy = 'cloud-free'; // HuggingFace / Groq free tier
  } else {
    strategy = 'rule-only'; // Pure rule-based, zero external calls
  }

  return {
    platform,
    cpuCores,
    totalRAM_GB,
    hasGPU: gpu,
    isAppleSilicon: appleSilicon,
    isMobile,
    score,
    recommendedStrategy: strategy,
  };
}

export function getStrategyDescription(strategy: HardwareProfile['recommendedStrategy']): string {
  const map = {
    'local-llm': 'AI locale potente (Ollama 7B+) — analisi approfondita offline',
    'local-small': 'AI locale leggera (Ollama 3B) — buon bilancio velocità/qualità',
    'hybrid': 'Regole locali + AI cloud gratuita — adattivo e affidabile',
    'cloud-free': 'AI cloud gratuita — nessun carico locale',
    'rule-only': 'Analisi rule-based — zero dipendenze esterne, istantaneo',
  };
  return map[strategy];
}
