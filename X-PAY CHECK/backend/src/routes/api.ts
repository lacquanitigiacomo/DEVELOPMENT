import { Router } from 'express';
import { authenticate, requirePro } from '../middleware/authenticate';
import { z } from 'zod';
import { runAudit } from '../services/auditEngine';
import { randomUUID } from 'crypto';

const cedolinoSchema = z.object({
  mese_riferimento: z.string(),
  tipo_documento: z.string(),
  dati_testuali: z.record(z.any()),
  dati_numerici: z.record(z.number()),
  assenze: z.record(z.number())
});

const router = Router();

const checkpoints: any[] = [];

const knowledgeManifest = {
  files: [
    { ccnl_id: 'COMMERCIO_2024', version: '3', hash: 'sha256-demo-comm-3', filename: 'COMMERCIO_2024_rev3.md' },
    { ccnl_id: 'METALMECCANICI_2025', version: '1', hash: 'sha256-demo-metal-1', filename: 'METALMECCANICI_2025_rev1.md' }
  ],
  releasedAt: new Date().toISOString()
};

router.get('/dashboard', authenticate, (req, res) => {
  res.json({
    message: 'Welcome to RYB Dashboard',
    stats: { totalAudits: 0, pending: 0, completed: 0, savings: 0 },
    features: ['AI Audit', 'Budget Tracker', 'Expense Scanner', 'Report Generator'],
  });
});

router.get('/user/profile', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

router.delete('/auth/account', authenticate, (_req, res) => {
  res.json({ success: true, message: 'Account deletion richiesta (mock GDPR flow)' });
});

router.get('/license/status', authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ tier: user?.tier || 'free', status: 'active', expiresAt: null });
});

router.post('/license/validate', authenticate, (req, res) => {
  const { platform, receipt } = req.body;
  if (!platform || !receipt) return res.status(400).json({ error: 'platform e receipt obbligatori' });
  res.json({ success: true, tier: 'pro', status: 'active', message: 'Receipt validata (mock server-side)' });
});

router.post('/license/restore', authenticate, (_req, res) => {
  res.json({ success: true, restored: true, tier: 'pro' });
});

router.get('/knowledge/manifest', (_req, res) => {
  res.json(knowledgeManifest);
});

router.get('/knowledge/download/:ccnl_id/:version', authenticate, (req, res) => {
  const { ccnl_id, version } = req.params;
  res.type('text/markdown').send(`---\nccnl_id: "${ccnl_id}"\nversion: "${version}"\n---\n\n# ${ccnl_id} rev ${version}\n\nContenuto knowledge di esempio.`);
});

router.get('/knowledge/diff', authenticate, (req, res) => {
  const etag = req.headers['if-none-match'];
  const currentTag = 'knowledge-manifest-v1';
  if (etag === currentTag) return res.status(304).send();
  res.setHeader('ETag', currentTag);
  res.json({ changed: knowledgeManifest.files });
});

router.post('/backup/checkpoint', authenticate, requirePro, (req, res) => {
  const item = { id: randomUUID(), userId: (req as any).user.userId, createdAt: new Date().toISOString(), ...req.body };
  checkpoints.push(item);
  res.status(201).json({ success: true, checkpoint: item });
});

router.get('/backup/checkpoint', authenticate, requirePro, (req, res) => {
  const userId = (req as any).user.userId;
  res.json({ items: checkpoints.filter(c => c.userId === userId) });
});

router.delete('/backup/checkpoint/:id', authenticate, requirePro, (req, res) => {
  const idx = checkpoints.findIndex(c => c.id === req.params.id && c.userId === (req as any).user.userId);
  if (idx < 0) return res.status(404).json({ error: 'Checkpoint non trovato' });
  checkpoints.splice(idx, 1);
  res.json({ success: true });
});

// === CCNL & Work Data ===
router.post('/user/work-profile', authenticate, (req, res) => {
  const { ccnl, hasPayslips, hasHours } = req.body;
  // In production: save to DB
  res.json({
    success: true,
    workProfile: {
      ccnl,
      hasPayslips,
      hasHours,
      onboardingComplete: !!(ccnl && hasPayslips !== undefined && hasHours !== undefined),
    },
  });
});

router.get('/user/work-profile', authenticate, (req, res) => {
  // Mock — in production fetch from DB
  res.json({
    ccnl: null,
    hasPayslips: false,
    hasHours: false,
    onboardingComplete: false,
  });
});

// === Upload endpoints ===
router.post('/upload/payslip', authenticate, (req, res) => {
  const { fileData, month, year } = req.body;
  res.json({
    success: true,
    message: 'Busta paga ricevuta',
    fileId: randomUUID(),
    extracted: {
      grossAmount: 1850.00,
      netAmount: 1350.00,
      hourlyRate: 9.50,
      month,
      year,
    },
  });
});

router.post('/upload/hours', authenticate, (req, res) => {
  const { fileData, month, year, entries } = req.body;
  const totalHours = entries?.reduce((s: number, e: any) => s + (e.hours || 0), 0) || 160;
  res.json({
    success: true,
    message: 'Orari ricevuti',
    fileId: randomUUID(),
    summary: {
      totalHours,
      entries: entries || [],
      month,
      year,
    },
  });
});

// === AI-powered verification ===
router.post('/audit/run', authenticate, (req, res) => {
  const parsed = cedolinoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Payload cedolino non valido', details: parsed.error.flatten() });
  const report = runAudit(parsed.data as any);
  res.json(report);
});

export { router as apiRouter };
