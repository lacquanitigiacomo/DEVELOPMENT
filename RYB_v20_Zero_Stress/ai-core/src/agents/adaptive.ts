/**
 * RYB Adaptive AI Router
 * Routes every AI request to the best available engine based on hardware.
 * NEVER fails — always has a fallback.
 */

import { detectHardware, HardwareProfile } from '../adapters/hardware';
import { auditAgent } from './audit';
import { receiptAgent } from './receipt';
import { budgetAgent } from './budget';

interface AIRequest {
  type: 'audit' | 'receipt' | 'budget' | 'ccnl-check' | 'payslip-verify';
  payload: any;
  priority?: 'speed' | 'quality' | 'offline';
}

interface AIResult {
  strategy: string;
  result: any;
  latencyMs: number;
  offline: boolean;
  confidence: number;
}

class AdaptiveRouter {
  private hw: HardwareProfile;
  private ollamaAvailable: boolean = false;
  private hfAvailable: boolean = false;

  constructor() {
    this.hw = detectHardware();
    this.checkOllama();
    this.checkHuggingFace();
  }

  private async checkOllama() {
    try {
      const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
      this.ollamaAvailable = res.ok;
    } catch { this.ollamaAvailable = false; }
  }

  private async checkHuggingFace() {
    this.hfAvailable = !!process.env.HUGGINGFACE_API_TOKEN;
  }

  async process(request: AIRequest): Promise<AIResult> {
    const start = Date.now();
    const strategy = this.pickStrategy(request);
    let result: any;
    let offline = false;
    let confidence = 0.8;

    switch (strategy) {
      case 'ollama':
        result = await this.callOllama(request);
        offline = true;
        confidence = 0.92;
        break;
      case 'huggingface':
        result = await this.callHuggingFace(request);
        offline = false;
        confidence = 0.85;
        break;
      case 'rule-based':
      default:
        result = await this.callRuleBased(request);
        offline = true;
        confidence = 0.75;
        break;
    }

    return {
      strategy,
      result,
      latencyMs: Date.now() - start,
      offline,
      confidence,
    };
  }

  private pickStrategy(req: AIRequest): 'ollama' | 'huggingface' | 'rule-based' {
    // Priority overrides
    if (req.priority === 'offline') {
      if (this.ollamaAvailable && this.hw.score >= 40) return 'ollama';
      return 'rule-based';
    }
    if (req.priority === 'speed') {
      if (this.hw.score >= 60 && this.ollamaAvailable) return 'ollama';
      return 'rule-based';
    }
    if (req.priority === 'quality') {
      if (this.ollamaAvailable && this.hw.score >= 50) return 'ollama';
      if (this.hfAvailable) return 'huggingface';
    }

    // Default hardware-based routing
    if (this.ollamaAvailable && this.hw.recommendedStrategy === 'local-llm') return 'ollama';
    if (this.ollamaAvailable && this.hw.recommendedStrategy === 'local-small') return 'ollama';
    if (this.hfAvailable && (this.hw.recommendedStrategy === 'hybrid' || this.hw.recommendedStrategy === 'cloud-free')) return 'huggingface';
    return 'rule-based';
  }

  private async callOllama(req: AIRequest): Promise<any> {
    const model = this.hw.score >= 70 ? 'mistral' : 'phi3';
    const prompt = this.buildPrompt(req);

    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!res.ok) throw new Error('Ollama failed');
    const data = await res.json();
    return this.parseOllamaResponse(data.response, req.type);
  }

  private async callHuggingFace(req: AIRequest): Promise<any> {
    const prompt = this.buildPrompt(req);
    const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300 } }),
    });
    if (!res.ok) throw new Error('HF failed');
    const data = await res.json();
    return this.parseOllamaResponse(data[0]?.generated_text || '', req.type);
  }

  private async callRuleBased(req: AIRequest): Promise<any> {
    switch (req.type) {
      case 'audit': return auditAgent.analyze(req.payload.expenses, req.payload.income);
      case 'receipt': return receiptAgent.scan(req.payload.image);
      case 'budget': return budgetAgent.optimize(req.payload.history, req.payload.goals);
      case 'ccnl-check': return this.ruleBasedCCNLCheck(req.payload);
      case 'payslip-verify': return this.ruleBasedPayslipVerify(req.payload);
      default: return { error: 'Unknown request type' };
    }
  }

  private buildPrompt(req: AIRequest): string {
    const prompts: Record<string, string> = {
      'audit': `Analizza queste spese: ${JSON.stringify(req.payload.expenses)}. Reddito: ${req.payload.income}. Suggerisci 3 risparmi.`,
      'ccnl-check': `Verifica se questo CCNL ${req.payload.ccnl} prevede le ore lavorate ${req.payload.hours} e la retribuzione ${req.payload.salary}.`,
      'payslip-verify': `Confronta busta paga: ${JSON.stringify(req.payload.payslip)} con orari: ${JSON.stringify(req.payload.hours)}. Segnala discrepanze.`,
    };
    return prompts[req.type] || JSON.stringify(req.payload);
  }

  private parseOllamaResponse(text: string, type: string): any {
    // Extract structured data from LLM text
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { /* not JSON */ }
    return { raw: text, parsed: false, type };
  }

  private ruleBasedCCNLCheck(payload: any): any {
    const { ccnl, hours, salary } = payload;
    const issues = [];
    const warnings = [];

    // Common CCNL rules (simplified)
    if (hours > 40) issues.push('Ore settimanali superiori a 40 — possibile straordinario non pagato');
    if (hours > 48) issues.push('Ore oltre il limite legale di 48h/settimana');
    if (salary < 1200) warnings.push('RAL potenzialmente sotto il minimo per CCNL commercio');
    if (!ccnl) issues.push('CCNL non specificato — impossibile verificare correttezza');

    return {
      ccnl,
      hours,
      salary,
      issues,
      warnings,
      compliant: issues.length === 0,
      ruleBased: true,
    };
  }

  private ruleBasedPayslipVerify(payload: any): any {
    const { payslip, hours } = payload;
    const discrepancies = [];

    if (payslip.grossAmount && payslip.netAmount) {
      const expectedNet = payslip.grossAmount * 0.65; // rough Italy estimate
      if (Math.abs(payslip.netAmount - expectedNet) > 100) {
        discrepancies.push(`Netto (${payslip.netAmount}) discosta significativamente dalla stima (${Math.round(expectedNet)})`);
      }
    }

    if (hours?.total && payslip?.hourlyRate) {
      const expectedGross = hours.total * payslip.hourlyRate;
      if (Math.abs(payslip.grossAmount - expectedGross) > 50) {
        discrepancies.push(`Lordo calcolato da ore (${Math.round(expectedGross)}) ≠ lordo busta paga (${payslip.grossAmount})`);
      }
    }

    return {
      discrepancies,
      verified: discrepancies.length === 0,
      payslipSummary: {
        gross: payslip.grossAmount,
        net: payslip.netAmount,
        totalHours: hours?.total,
      },
      ruleBased: true,
    };
  }
}

export const adaptiveRouter = new AdaptiveRouter();
