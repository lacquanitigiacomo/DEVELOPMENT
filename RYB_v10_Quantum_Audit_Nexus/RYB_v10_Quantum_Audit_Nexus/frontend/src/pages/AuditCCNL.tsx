import { useState } from 'react';
import { Gavel, Search, AlertTriangle, Check, ArrowRight } from 'lucide-react';

export default function AuditCCNL() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runAudit = () => {
    setRunning(true);
    setTimeout(() => {
      setResult({
        provider: 'rulebased',
        totalExpenses: 1720,
        income: 1850,
        ratio: 93,
        findings: [
          { severity: 'high', text: 'Spese superiori al 93% del reddito' },
          { severity: 'medium', text: 'Nessun rimborso trasporti rilevato' },
        ],
        recommendations: [
          'Verifica se il CCNL Pulizie prevede rimborso trasporti (art. 14)',
          'Controlla se hai diritto alla mensa aziendale',
          'Richiedi la verifica straordinari non pagati',
        ],
        ccnlChecks: [
          { check: 'Minimo salariale CCNL Pulizie', passed: true, expected: 1100, actual: 1420 },
          { check: 'Ore massime mensili', passed: true, expected: 173, actual: 173 },
          { check: 'Straordinari pagati', passed: false, note: 'Verifica manuale richiesta' },
        ],
      });
      setRunning(false);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Gavel size={24} className="text-ryb-500" /> Audit CCNL
      </h1>
      <p className="text-gray-400 mb-6">Verifica che il tuo contratto di lavoro rispetti il CCNL applicato.</p>

      <button
        onClick={runAudit}
        disabled={running}
        className="w-full py-4 bg-ryb-600 hover:bg-ryb-700 rounded-xl text-white font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analisi in corso...
          </>
        ) : (
          <><Search size={20} /> Avvia Audit CCNL</>
        )}
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          {/* Summary */}
          <div className={`p-6 rounded-2xl border ${result.ratio > 80 ? 'bg-red-900/20 border-red-800' : 'bg-ryb-900/20 border-ryb-800'}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.ratio > 80 ? <AlertTriangle className="text-red-500" /> : <Check className="text-ryb-500" />}
              <span className="font-bold text-lg">
                {result.ratio > 80 ? '⚠️ Attenzione richiesta' : '✅ Tutto conforme'}
              </span>
            </div>
            <p className="text-gray-400">
              Spese: <strong>€{result.totalExpenses}</strong> / Reddito: <strong>€{result.income}</strong> — Ratio: <strong>{result.ratio}%</strong>
            </p>
            <p className="text-sm text-gray-500 mt-1">Provider AI: {result.provider} (adaptive)</p>
          </div>

          {/* CCNL Checks */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Verifiche CCNL</h3>
            <div className="space-y-3">
              {result.ccnlChecks.map((c: any, i: number) => (
                <div key={i} className="flex items-start justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{c.check}</div>
                    {c.note && <div className="text-xs text-gray-500">{c.note}</div>}
                  </div>
                  <div className={`text-sm font-semibold ${c.passed ? 'text-ryb-500' : 'text-amber-500'}`}>
                    {c.passed ? '✅ OK' : '⚠️ Verifica'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Azioni Consigliate</h3>
            <div className="space-y-3">
              {result.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <ArrowRight size={16} className="text-ryb-500 mt-0.5" />
                  <span className="text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
