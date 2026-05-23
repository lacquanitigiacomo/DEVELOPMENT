import { Request, Response } from 'express';
import { generateLegalBrief } from '../services/legalBrief';
import { notarizeReport } from '../services/blockchainNotary';

export async function generateBrief(req: Request, res: Response) {
  try {
    const jobId = req.params.id;
    const brief = await generateLegalBrief(jobId);
    res.json({ brief: brief.substring(0, 500) + '...', pdfUrl: `/uploads/brief_${jobId}.pdf` });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function notarize(req: Request, res: Response) {
  try {
    const jobId = req.params.id;
    const txHash = await notarizeReport(jobId);
    res.json({ txHash, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}