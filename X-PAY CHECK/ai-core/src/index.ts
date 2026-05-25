import express from 'express';

// ═══════════════════════════════════════════════════════════════
// ZERO-STRESS ENV: importa l'engine prima di TUTTO
// ═══════════════════════════════════════════════════════════════
import { loadEnv, applyEnv, getEnv } from '../../shared/env-engine';

const envConfig = loadEnv();
applyEnv(envConfig);
// ═══════════════════════════════════════════════════════════════

import { adaptiveRouter } from './agents/adaptive';
import { detectHardware, getStrategyDescription } from './adapters/hardware';

const app = express();
app.use(express.json({ limit: '20mb' }));
const PORT = parseInt(getEnv('AI_PORT', '3002'));

// Health + Hardware detection
app.get('/health', (_req, res) => {
  const hw = detectHardware();
  res.json({
    status: 'ok',
    service: 'ryb-ai-core',
    version: '20.0.0',
    hardware: hw,
    strategy: getStrategyDescription(hw.recommendedStrategy),
    configSource: envConfig.source,
  });
});

// Universal AI endpoint
app.post('/ai/process', async (req, res) => {
  try {
    const { type, payload, priority } = req.body;
    const result = await adaptiveRouter.process({ type, payload, priority });
    res.json(result);
  } catch (err: any) {
    res.json({
      strategy: 'emergency-fallback',
      result: { error: err.message, fallback: true },
      latencyMs: 0,
      offline: true,
      confidence: 0.5,
    });
  }
});

app.listen(PORT, () => {
  const hw = detectHardware();
  console.log(`🤖 RYB AI Core v20.0 running on http://localhost:${PORT}`);
  console.log(`   Hardware score: ${hw.score}/100 → ${hw.recommendedStrategy}`);
  console.log(`   ${getStrategyDescription(hw.recommendedStrategy)}`);
  console.log(`   Config source: ${envConfig.source}`);
});
