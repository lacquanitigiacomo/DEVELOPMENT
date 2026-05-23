import { useState } from 'react';
import { analysisAPI } from '@/services/api';
import { useRYBStore } from '@/store/agentStore';
import { Send, Bot, User, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NLQueryResult } from '@/types';

export default function NLQueryInterface() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<Array<{ q: string; r: NLQueryResult }>>([]);
  const [loading, setLoading] = useState(false);
  const jobs = useRYBStore((s) => s.jobs);
  const latestJob = jobs[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !latestJob) return;

    setLoading(true);
    try {
      const result = await analysisAPI.queryNL(latestJob.id, query);
      setHistory((prev) => [...prev, { q: query, r: result }]);
      setQuery('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Query Naturale AI</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Chiedi qualsiasi cosa sulle tue buste paga. Es: "Perché a marzo ho pagato più IRPEF?"
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Inizia a chiedere. Sono connesso all'audit engine.</p>
            </div>
          )}

          <AnimatePresence>
            {history.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* User */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-ryb-100 dark:bg-ryb-900/30 rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-ryb-900 dark:text-ryb-300">{item.q}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {/* AI */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.r.answer}</p>
                    <div className="flex gap-2 mt-2">
                      {item.r.sources.map((s, idx) => (
                        <span key={idx} className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>
                    {item.r.generatedBrief && (
                      <button className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700">
                        <FileText className="w-3 h-3" />
                        Brief allegato
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-500">Analizzo i dati...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chiedi alla AI..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ryb-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-ryb-600 text-white rounded-lg hover:bg-ryb-700 disabled:bg-gray-300 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}