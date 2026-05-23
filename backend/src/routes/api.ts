import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

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
    fileId: crypto.randomUUID(),
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
    fileId: crypto.randomUUID(),
    summary: {
      totalHours,
      entries: entries || [],
      month,
      year,
    },
  });
});

// === AI-powered verification ===
router.post('/verify/payslip', authenticate, async (req, res) => {
  try {
    const { payslipData, hoursData, ccnl } = req.body;
    const aiRes = await fetch('http://localhost:3002/ai/payslip-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payslip: payslipData, hours: hoursData, ccnl }),
    });
    const aiResult = await aiRes.json();
    res.json(aiResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as apiRouter };
