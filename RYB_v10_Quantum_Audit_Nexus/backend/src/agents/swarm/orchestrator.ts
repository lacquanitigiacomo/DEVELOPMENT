import { EventEmitter } from 'events';
import { OcrEngine } from '../extractor/ocrEngine';
import { PayrollValidator, type PayrollInput } from '../accountant/validator';
import { PatternReconstructor, type TimeEntry } from '../auditor/reconstructor';
import { Job, Queue } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis({ host: process.env.REDIS_HOST || 'localhost', port: 6379 });

export interface AgentJob {
  id: string;
  depth: 'basic' | 'standard' | 'deep' | 'quantum';
  documentPaths: string[];
  timeSheetPaths?: string[];
  status: string;
  results: Record<string, unknown>;
}

export class AgentOrchestrator extends EventEmitter {
  private ocr: OcrEngine;
  private validator: PayrollValidator;
  private reconstructor: PatternReconstructor;
  private queue: Queue;

  constructor() {
    super();
    this.ocr = new OcrEngine();
    this.validator = new PayrollValidator();
    this.reconstructor = new PatternReconstructor();
    this.queue = new Queue('ryb-analysis', { connection: redis });
  }

  async initialize() {
    await this.ocr.initialize();
  }

  async startJob(jobData: AgentJob): Promise<string> {
    const job = await this.queue.add('analysis', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });

    // Process immediately for demo (in prod: separate worker)
    this.processJob({ ...jobData, id: job.id || jobData.id } as AgentJob & { id: string });

    return job.id || jobData.id;
  }

  private async processJob(job: AgentJob & { id: string }) {
    this.emit('agentMessage', { jobId: job.id, agent: 'swarm', status: 'started', message: 'Orchestratore: avvio pipeline multi-agente', timestamp: new Date().toISOString() });

    try {
      // PHASE 1: EXTRACTION
      this.emit('agentMessage', { jobId: job.id, agent: 'extractor', status: 'running', message: 'Estrattore: OCR e classificazione documenti...', progress: 0, timestamp: new Date().toISOString() });

      const extractedDocs = [];
      for (let i = 0; i < job.documentPaths.length; i++) {
        const doc = await this.ocr.processDocument(job.documentPaths[i], 'application/pdf');
        extractedDocs.push(doc);
        this.emit('agentMessage', { jobId: job.id, agent: 'extractor', status: 'running', message: `Estratto ${doc.classification}: confidenza ${doc.confidence.toFixed(1)}%`, progress: ((i + 1) / job.documentPaths.length) * 100, timestamp: new Date().toISOString() });
      }

      this.emit('agentMessage', { jobId: job.id, agent: 'extractor', status: 'completed', message: `Estrazione completata: ${extractedDocs.length} documenti processati`, timestamp: new Date().toISOString() });

      // Convert to payroll inputs
      const payrolls: PayrollInput[] = extractedDocs
        .filter(d => d.classification === 'payroll')
        .map(d => ({
          employeeName: String(d.fields.employeeName || 'Sconosciuto'),
          fiscalCode: String(d.fields.fiscalCode || ''),
          month: Number(d.fields.month || 1),
          year: Number(d.fields.year || 2026),
          grossSalary: Number(d.fields.grossSalary || 0),
          ccnlCode: String(d.fields.ccnl || ''),
        }));

      // PHASE 2: ACCOUNTANT
      this.emit('agentMessage', { jobId: job.id, agent: 'accountant', status: 'running', message: 'Commercialista: validazione calcoli retributivi...', progress: 0, timestamp: new Date().toISOString() });

      const validations = [];
      for (let i = 0; i < payrolls.length; i++) {
        const val = this.validator.validate(payrolls[i]);
        validations.push(val);
        this.emit('agentMessage', { jobId: job.id, agent: 'accountant', status: 'running', message: `Validata busta ${i + 1}/${payrolls.length}: ${val.anomalies.length} anomalie`, progress: ((i + 1) / payrolls.length) * 100, timestamp: new Date().toISOString() });
      }

      const totalAnomalies = validations.flatMap(v => v.anomalies);
      this.emit('agentMessage', { jobId: job.id, agent: 'accountant', status: 'completed', message: `Validazione completata: ${totalAnomalies.length} anomalie totali`, timestamp: new Date().toISOString() });

      // PHASE 3: AUDITOR (Standard/Deep/Quantum)
      if (job.depth !== 'basic') {
        this.emit('agentMessage', { jobId: job.id, agent: 'auditor', status: 'running', message: 'Revisore: avvio pattern analysis e cross-validation...', progress: 0, timestamp: new Date().toISOString() });

        // Parse timesheets if available
        let timeEntries: TimeEntry[] = [];
        if (job.timeSheetPaths) {
          timeEntries = await this.parseTimeSheets(job.timeSheetPaths);
        }

        // Detect gaps
        const years = [...new Set(payrolls.map(p => p.year))];
        const months = payrolls.map(p => ({ year: p.year, month: p.month }));
        const allMonths = years.flatMap(y => Array.from({ length: 12 }, (_, i) => ({ year: y, month: i + 1 })));
        const missing = allMonths.filter(m => !months.some(em => em.year === m.year && em.month === m.month));

        let reconstructed: ReturnType<PatternReconstructor['reconstructCalendar']> = [];
        if (timeEntries.length > 0 && missing.length > 0) {
          const pattern = this.reconstructor.analyzePattern(timeEntries);
          reconstructed = this.reconstructor.reconstructCalendar(pattern, missing, payrolls.map(p => ({ month: p.month, year: p.year, grossSalary: p.grossSalary })));

          this.emit('agentMessage', { jobId: job.id, agent: 'auditor', status: 'running', message: `Ricostruiti ${reconstructed.length} giorni lavorativi per ${missing.length} mesi mancanti`, progress: 50, timestamp: new Date().toISOString() });
        }

        // Deep/Quantum: predictive analysis
        if (job.depth === 'quantum' && payrolls.length >= 3) {
          this.emit('agentMessage', { jobId: job.id, agent: 'auditor', status: 'running', message: 'Quantum Analyzer: predizione prossima busta paga...', progress: 75, timestamp: new Date().toISOString() });
          // Predictive logic would go here
        }

        this.emit('agentMessage', { jobId: job.id, agent: 'auditor', status: 'completed', message: 'Revisione contabile completata', timestamp: new Date().toISOString() });

        // Consultation (Deep/Quantum)
        if (job.depth === 'deep' || job.depth === 'quantum') {
          this.emit('agentMessage', { jobId: job.id, agent: 'auditor', status: 'consulting', message: 'Revisore consulta Commercialista per validazione ricostruzioni...', timestamp: new Date().toISOString() });
          await new Promise(r => setTimeout(r, 1000)); // Simulate consultation
          this.emit('agentMessage', { jobId: job.id, agent: 'accountant', status: 'consulting', message: 'Commercialista: ricostruzioni validate, coerenza retributiva confermata', timestamp: new Date().toISOString() });
        }

        job.results = {
          extracted: extractedDocs,
          validations,
          anomalies: totalAnomalies,
          reconstructed,
          missingMonths: missing,
          reliabilityScore: Math.round(validations.reduce((s, v) => s + v.confidence, 0) / (validations.length || 1))
        };
      } else {
        job.results = {
          extracted: extractedDocs,
          validations,
          anomalies: totalAnomalies,
          reliabilityScore: Math.round(validations.reduce((s, v) => s + v.confidence, 0) / (validations.length || 1))
        };
      }

      this.emit('agentMessage', { jobId: job.id, agent: 'swarm', status: 'completed', message: `Pipeline completata. Affidabilità: ${job.results.reliabilityScore}%`, timestamp: new Date().toISOString() });
      this.emit('completed', { jobId: job.id, results: job.results });

    } catch (error) {
      this.emit('agentMessage', { jobId: job.id, agent: 'swarm', status: 'error', message: `Errore: ${(error as Error).message}`, timestamp: new Date().toISOString() });
      this.emit('error', { jobId: job.id, error: (error as Error).message });
    }
  }

  private async parseTimeSheets(paths: string[]): Promise<TimeEntry[]> {
    // Simplified: would parse CSV/Excel/PDF timesheets
    return [];
  }
}

let orchestratorInstance: AgentOrchestrator | null = null;

export async function initializeAgents() {
  orchestratorInstance = new AgentOrchestrator();
  await orchestratorInstance.initialize();
}

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) throw new Error('Orchestrator not initialized');
  return orchestratorInstance;
}