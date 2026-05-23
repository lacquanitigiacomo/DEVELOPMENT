import { useParams } from 'react-router-dom';
import { useRYBStore } from '@/store/agentStore';
import { analysisAPI } from '@/services/api';
import { useState } from 'react';
import { 
  FileText, Shield, AlertTriangle, CheckCircle, 
  Download, Stamp, TrendingUp, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AuditReport() {
  const { jobId } = useParams<{ jobId: string }>();
  const jobs = useRYBStore((s) => s.jobs);
  const job = jobs.find((j) => j.id === jobId);
  const [notarizing, setNotarizing] = useState(false);

  if (!job) {
    return (
      <div className="text-center py-12 text-gray-500">
        Report non trovato.
      </div>
    );
  }

  const criticalCount = job.anomalies.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = job.anomalies.filter(a => a.severity === 'WARNING').length;
  const infoCount = job.anomalies.filter(a => a.severity === 'INFO').length;

  const handleNotarize = async () => {
    if (!jobId) return;
    setNotarizing(true);
    try {
      const result = await analysisAPI.notarize(jobId);
      toast.success(`Notarizzato! TX: ${result.txHash.slice(0, 16)}...`);
    } catch {
      toast.error('Errore notarizzazione');
    } finally {
      setNotarizing(false);
    }
  };

  const handleBrief = async () => {
    if (!jobId) return;
    try {
      const result = await analysisAPI.generateBrief(jobId);
      toast.success('Brief legale generato');
      window.open(result.pdfUrl, '_blank');
    } catch {
      toast.error('Errore generazione brief');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report di Revisione</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Job #{jobId?.slice(0, 8)} · Generato il {new Date(job.completedAt || job.startedAt).toLocaleDateString('it-IT')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBrief}
            className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Brief Legale
          </button>
          <button
            onClick={handleNotarize}
            disabled={notarizing}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
          >
            <Stamp className="w-4 h-4" />
            {notarizing ? 'Notarizzo...' : 'Notarizza'}
          </button>
        </div>
      </div>

      {/* Reliability Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Affidabilità Analisi</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            job.reliabilityScore > 80 ? 'bg-green-100 text-green-700' :
            job.reliabilityScore > 50 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {job.reliabilityScore}%
          </div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${job.reliabilityScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              job.reliabilityScore > 80 ? 'bg-green-500' :
              job.reliabilityScore > 50 ? 'bg-amber-500' :
              'bg-red-500'
            }`}
          />
        </div>
        <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {job.documents.length} documenti
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            {job.reconstructed.length} ricostruzioni
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            {job.depth} mode
          </span>
        </div>
      </div>

      {/* Anomalies */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Anomalie Rilevate
          </h2>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
              {criticalCount} Critiche
            </span>
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
              {warningCount} Warning
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {infoCount} Info
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {job.anomalies.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500">
              Nessuna anomalia rilevata. Ottimo lavoro!
            </div>
          ) : (
            job.anomalies.map((anomaly) => (
              <div key={anomaly.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-3">
                  {anomaly.severity === 'CRITICAL' && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  {anomaly.severity === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                  {anomaly.severity === 'INFO' && <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        anomaly.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        anomaly.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {anomaly.severity}
                      </span>
                      <span className="text-xs text-gray-400">{anomaly.agent}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{anomaly.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Atteso: {anomaly.expected}</span>
                      <span>Effettivo: {anomaly.actual}</span>
                    </div>
                    {anomaly.legalReference && (
                      <p className="text-xs text-gray-400 mt-1 italic">Ref: {anomaly.legalReference}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reconstructed Data */}
      {job.reconstructed.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Dati Ricostruiti</h2>
          </div>
          <div className="p-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ⚠️ I dati seguenti sono stati ricostruiti dall'agente revisore tramite pattern analysis.
                Sono indicativi e devono essere verificati.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {job.reconstructed.map((rec) => (
                <div key={rec.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date(rec.date).toLocaleDateString('it-IT')}
                    </span>
                    <span className="text-xs text-gray-400">{rec.confidence.toFixed(0)}% conf.</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {rec.hours}h · {rec.patternUsed}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}