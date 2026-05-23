import { Router } from 'express';
const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    version: '10.0.0',
    name: 'RYB Quantum Audit Nexus',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRouter };
