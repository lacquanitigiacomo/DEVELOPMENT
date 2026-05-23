import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Lista CCNL conosciuti
router.get('/ccnl', (_req, res) => {
  res.json({
    ccnl: [
      { code: 'CCNL-PULIZIE', name: 'CCNL Pulizie e Multiservizi', sector: 'Servizi di pulizia' },
      { code: 'CCNL-COMMERCIO', name: 'CCNL Commercio Terziario', sector: 'Commercio' },
      { code: 'CCNL-EDILIZIA', name: 'CCNL Edilizia Industria', sector: 'Edilizia' },
      { code: 'CCNL-TRASPORTO', name: 'CCNL Trasporto e Logistica', sector: 'Trasporti' },
      { code: 'CCNL-METALMECCANICO', name: 'CCNL Metalmeccanici', sector: 'Industria' },
      { code: 'CCNL-TURISMO', name: 'CCNL Turismo', sector: 'Turismo e ristorazione' },
      { code: 'CCNL-SANITA', name: 'CCNL Sanità Privata', sector: 'Sanità' },
      { code: 'CCNL-BANCARIO', name: 'CCNL Bancari', sector: 'Banche e assicurazioni' },
    ],
  });
});

// Salva profilo lavoratore
router.post('/profile/work', authenticate, (req, res) => {
  const { ccnlCode, hasPayslips, hasSchedule, startDate } = req.body;
  const user = (req as any).user;

  // In dev: salva in memoria, in prod: DB
  const profile = {
    userId: user.userId,
    ccnlCode,
    hasPayslips: !!hasPayslips,
    hasSchedule: !!hasSchedule,
    startDate,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({
    message: 'Profilo lavoratore salvato',
    profile,
    nextSteps: [
      hasPayslips ? 'Carica le tue buste paga per l'analisi' : 'Richiedi le buste paga all'HR',
      hasSchedule ? 'Carica gli orari comunicati per il confronto' : 'Chiedi gli orari firmati al datore di lavoro',
      'Avvia l'AI Audit per verificare la conformità CCNL',
    ],
  });
});

// Analizza busta paga (proxy verso AI Core)
router.post('/payslip/analyze', authenticate, async (req, res) => {
  try {
    const { payslipData } = req.body;
    const aiRes = await fetch('http://localhost:3002/ai/payslip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payslipData),
    });
    const result = await aiRes.json();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Confronta orari
router.post('/hours/compare', authenticate, async (req, res) => {
  try {
    const { schedule, payslipHours } = req.body;
    const aiRes = await fetch('http://localhost:3002/ai/hours-compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule, payslipHours }),
    });
    const result = await aiRes.json();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as payrollRouter };
