import { Router } from 'express';
import { upload, startAnalysis } from '../controllers/upload';
import { getJob, queryNL } from '../controllers/analysis';
import { generateBrief, notarize } from '../controllers/report';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { encryptionMiddleware } from '../middleware/encryption';

export function setupRoutes(app: Router) {
  // Upload & Analysis
  app.post('/api/analysis/start', upload.fields([
    { name: 'documents', maxCount: 50 },
    { name: 'timeSheets', maxCount: 20 }
  ]), startAnalysis);

  app.get('/api/analysis/:id', getJob);
  app.post('/api/analysis/:id/query', queryNL);

  // Reports
  app.post('/api/report/:id/brief', authMiddleware, roleMiddleware(['auditor', 'legal', 'admin']), generateBrief);
  app.post('/api/report/:id/notarize', authMiddleware, notarize);

  // Plugins
  app.get('/api/plugins', (req, res) => {
    res.json({ plugins: [
      { id: 'ccnl-extended', name: 'CCNL Extended Pack' },
      { id: 'legal-pro', name: 'Legal Pro Brief Generator' },
      { id: 'predictive-2026', name: 'Predictive Audit 2026' }
    ]});
  });

  app.get('/api/plugins/:id', (req, res) => {
    res.json({ manifest: { id: req.params.id, version: '1.0.0' }, code: '// plugin code' });
  });

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '10.0.0', quantum: true });
  });

  // Apply encryption to all API routes
  app.use('/api', encryptionMiddleware);
}