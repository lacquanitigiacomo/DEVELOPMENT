import { Request, Response } from 'express';
import { getOrchestrator } from '../agents/swarm/orchestrator';

const jobStore = new Map<string, any>();

export function getJob(req: Request, res: Response) {
  const job = jobStore.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
}

export function queryNL(req: Request, res: Response) {
  const { query } = req.body;
  const jobId = req.params.id;

  // v10: RAG-based query sui dati del job
  const mockResponse = {
    query,
    answer: `Analisi della query "${query}" sui dati del job ${jobId}. In v10, questo utilizza un LLM locale con RAG sui documenti estratti.`,
    sources: ['busta_paga_1', 'orari_marzo'],
    confidence: 92,
    generatedBrief: null
  };

  res.json(mockResponse);
}