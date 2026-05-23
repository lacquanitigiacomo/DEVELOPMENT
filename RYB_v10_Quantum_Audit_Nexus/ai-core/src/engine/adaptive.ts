import { HardwareProfile } from './hardware';

export type AIProvider = 'ollama' | 'huggingface' | 'webgpu' | 'rulebased';

export interface AIConfig {
  provider: AIProvider;
  model?: string;
  endpoint?: string;
  timeout: number;
  maxRetries: number;
}

export function selectProvider(hardware: HardwareProfile, preferLocal: boolean = true): AIConfig {
  // Priority chain based on hardware capability
  if (hardware.tier === 'high' && preferLocal) {
    return {
      provider: 'ollama',
      model: 'mistral:7b',
      endpoint: 'http://localhost:11434',
      timeout: 30000,
      maxRetries: 2,
    };
  }

  if (hardware.tier === 'medium' && hardware.supportsWebGPU) {
    return {
      provider: 'webgpu',
      model: 'phi-3-mini',
      timeout: 15000,
      maxRetries: 2,
    };
  }

  if (process.env.HUGGINGFACE_API_TOKEN) {
    return {
      provider: 'huggingface',
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      timeout: 20000,
      maxRetries: 3,
    };
  }

  // Ultimate fallback — always works, zero resources
  return {
    provider: 'rulebased',
    timeout: 5000,
    maxRetries: 0,
  };
}

export async function runWithFallback<T>(
  hardware: HardwareProfile,
  operations: Record<AIProvider, () => Promise<T>>
): Promise<{ result: T; provider: AIProvider }> {
  const config = selectProvider(hardware);
  const chain: AIProvider[] = [config.provider];

  // Build fallback chain
  if (config.provider === 'ollama') chain.push('huggingface', 'rulebased');
  else if (config.provider === 'webgpu') chain.push('huggingface', 'rulebased');
  else if (config.provider === 'huggingface') chain.push('rulebased');

  for (const provider of chain) {
    try {
      const result = await Promise.race([
        operations[provider](),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), config.timeout)
        ),
      ]);
      return { result, provider };
    } catch (err) {
      console.warn(`⚠️ AI provider ${provider} failed:`, (err as Error).message);
      continue;
    }
  }

  throw new Error('All AI providers failed');
}
