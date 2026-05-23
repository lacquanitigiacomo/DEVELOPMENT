import express from 'express';
import dotenv from 'dotenv';
import { adaptiveRouter } from './agents/adaptive';
import { detectHardware, getStrategyDescription } from './adapters/hardware';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));
const PORT = process.env.AI_PORT || 3002;

// Health + Hardware detection
app.get('/health', (_req, res) => {
  const hw = detectHardware();
  res.json({
    status: 'ok',
    service: 'ryb-ai-core',
    version: '10.0.0',
    hardware: hw,
    strategy: getStrategyDescription(hw.recommendedStrategy),
  });
});

// Universal AI endpoint — adapts automatically
app.post('/ai/process', async (req, res) => {
  try {
    const { type, payload, priority } = req.body;
    const result = await adaptiveRouter.process({ type, payload, priority });
    res.json(result);
  } catch (err: any) {
    // Ultimate fallback: never crash, return rule-based
    res.json({
      strategy: 'emergency-fallback',
      result: { error: err.message, fallback: true },
      latencyMs: 0,
      offline: true,
      confidence: 0.5,
    });
  }
});

// Specific endpoints for convenience
app.post('/ai/audit', async (req, res) => {
  const result = await adaptiveRouter.process({ type: 'audit', payload: req.body });
  res.json(result);
});

app.post('/ai/receipt', async (req, res) => {
  const result = await adaptiveRouter.process({ type: 'receipt', payload: req.body });
  res.json(result);
});

app.post('/ai/budget', async (req, res) => {
  const result = await adaptiveRouter.process({ type: 'budget', payload: req.body });
  res.json(result);
});

// NEW: CCNL & Payslip endpoints
app.post('/ai/ccnl-check', async (req, res) => {
  const result = await adaptiveRouter.process({ type: 'ccnl-check', payload: req.body });
  res.json(result);
});

app.post('/ai/payslip-verify', async (req, res) => {
  const result = await adaptiveRouter.process({ type: 'payslip-verify', payload: req.body });
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🤖 RYB AI Core (Adaptive) running on http://localhost:${PORT}`);
  const hw = detectHardware();
  console.log(`   Hardware score: ${hw.score}/100 → ${hw.recommendedStrategy}`);
  console.log(`   ${getStrategyDescription(hw.recommendedStrategy)}`);
});
