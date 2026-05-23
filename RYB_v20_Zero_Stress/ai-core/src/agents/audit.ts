import { z } from 'zod';
import { detectHardware } from '../engine/hardware';
import { runWithFallback } from '../engine/adaptive';

const expenseSchema = z.object({
  category: z.string(),
  amount: z.number().positive(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
});

export const auditAgent = {
  async analyze(expenses: any[], income: number) {
    const hardware = await detectHardware();
    const valid = expenses.map(e => expenseSchema.parse(e));
    const total = valid.reduce((sum, e) => sum + e.amount, 0);
    const ratio = total / income;

    const { result, provider } = await runWithFallback(hardware, {
      ollama: () => analyzeWithOllama(valid, income, ratio),
      huggingface: () => analyzeWithHuggingFace(valid, income, ratio),
      webgpu: () => analyzeWithWebGPU(valid, income, ratio),
      rulebased: () => analyzeRuleBased(valid, income, ratio),
    });

    return { ...result, provider, timestamp: new Date().toISOString() };
  },
};

// Rule-based — zero resources, always works
function analyzeRuleBased(valid: any[], income: number, ratio: number) {
  const findings: any[] = [];
  const recommendations: string[] = [];

  if (ratio > 0.8) {
    findings.push({ severity: 'high', text: 'Spese superiori al 80% del reddito' });
    recommendations.push('Riduci spese fisse o cerca fonti di reddito aggiuntive');
  }

  const food = valid.filter(e => e.category.toLowerCase().includes('cibo'));
  const foodTotal = food.reduce((s, e) => s + e.amount, 0);
  if (foodTotal > income * 0.3) {
    findings.push({ severity: 'medium', text: 'Spese alimentari sopra il 30%' });
    recommendations.push('Cucina a casa più spesso, usa liste della spesa');
  }

  const subs = valid.filter(e => e.category.toLowerCase().includes('abbonamento'));
  if (subs.length > 3) {
    findings.push({ severity: 'low', text: `Trovati ${subs.length} abbonamenti attivi` });
    recommendations.push('Verifica se tutti gli abbonamenti sono utilizzati');
  }

  // CCNL-aware analysis
  const transport = valid.filter(e => e.category.toLowerCase().includes('trasporto'));
  if (transport.length === 0) {
    recommendations.push('Verifica se il tuo CCNL prevede rimborso trasporti');
  }

  return { totalExpenses: total, income, ratio: Math.round(ratio * 100), findings, recommendations, aiInsight: null };
}

// Ollama — local, needs good hardware
async function analyzeWithOllama(valid: any[], income: number, ratio: number) {
  const prompt = `Analizza spese: ${JSON.stringify(valid)}. Reddito: ${income}. Ratio: ${ratio}. Suggerisci risparmi.`;
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'mistral:7b', prompt, stream: false }),
  });
  if (!res.ok) throw new Error('Ollama failed');
  const data = await res.json();
  return { totalExpenses: 0, income, ratio: Math.round(ratio * 100), findings: [], recommendations: [], aiInsight: data.response };
}

// HuggingFace — cloud free tier
async function analyzeWithHuggingFace(valid: any[], income: number, ratio: number) {
  const prompt = `Analizza spese: ${JSON.stringify(valid)}. Reddito: ${income}. Suggerisci 3 risparmi.`;
  const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 200 } }),
  });
  if (!res.ok) throw new Error('HF failed');
  const data = await res.json();
  return { totalExpenses: 0, income, ratio: Math.round(ratio * 100), findings: [], recommendations: [], aiInsight: data[0]?.generated_text };
}

// WebGPU — browser-based, medium hardware
async function analyzeWithWebGPU(valid: any[], income: number, ratio: number) {
  // Placeholder — would use transformers.js with WebGPU backend
  return analyzeRuleBased(valid, income, ratio);
}
