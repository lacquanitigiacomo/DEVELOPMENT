import { useRYBStore } from '@/store/agentStore';
import { Link } from 'react-router-dom';
import { Upload, FileText, Shield, Zap, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const jobs = useRYBStore((s) => s.jobs);
  const activeJob = useRYBStore((s) => s.activeJob);

  const stats = [
    { label: 'Analisi Completate', value: jobs.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Anomalie Trovate', value: jobs.reduce((sum, j) => sum + j.anomalies.length, 0), icon: Shield, color: 'bg-red-500' },
    { label: 'Dati Ricostruiti', value: jobs.reduce((sum, j) => sum + j.reconstructed.length, 0), icon: Zap, color: 'bg-amber-500' },
    { label: 'Collaboratori', value: 3, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Benvenuto in RYB v10.0 — Quantum Audit Nexus
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-ryb-600 text-white rounded-lg hover:bg-ryb-700 transition-colors font-medium"
        >
          <Upload className="w-4 h-4" />
          Nuova Analisi
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Job */}
      {activeJob && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Analisi in Corso</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-ryb-500 rounded-full transition-all duration-500"
                style={{ width: activeJob.status === 'completed' ? '100%' : '60%' }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {activeJob.status}
            </span>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Analisi Recenti</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {jobs.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
              Nessuna analisi ancora. Inizia caricando le tue buste paga.
            </div>
          ) : (
            jobs.slice(0, 5).map((job) => (
              <Link
                key={job.id}
                to={`/job/${job.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Job #{job.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {job.documents.length} documenti · {job.depth} · {job.anomalies.length} anomalie
                  </p>
                </div>
                <TrendingUp className={`w-5 h-5 ${
                  job.reliabilityScore > 80 ? 'text-green-500' : 'text-amber-500'
                }`} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}