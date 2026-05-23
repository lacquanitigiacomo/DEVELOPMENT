import { useParams } from 'react-router-dom';
import { useRYBStore } from '@/store/agentStore';
import { useAgentStream } from '@/hooks/useAgentStream';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, CheckCircle, AlertCircle, Loader2, 
  MessageSquare, Brain, Eye, Network 
} from 'lucide-react';
import type { AgentType, AgentStatus } from '@/types';

const agentConfig: Record<AgentType, { label: string; color: string; icon: React.ElementType }> = {
  extractor: { label: 'Estrattore Dati', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: Eye },
  accountant: { label: 'Studio Commercialista', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Brain },
  auditor: { label: 'Revisore Contabile', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle },
  swarm: { label: 'Swarm Orchestrator', color: 'text-violet-600 bg-violet-50 border-violet-200', icon: Network },
};

export default function AgentSwarmPanel() {
  const { jobId } = useParams<{ jobId: string }>();
  const activeJob = useRYBStore((s) => s.activeJob);
  const messages = activeJob?.agentMessages || [];

  useAgentStream(jobId || null);

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'consulting': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Bot className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Swarm Agentico</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Job #{jobId?.slice(0, 8)} · Livello: {activeJob?.depth || 'unknown'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ryb-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-ryb-500"></span>
          </span>
          <span className="text-sm font-medium text-ryb-600">Live</span>
        </div>
      </div>

      {/* Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(agentConfig) as AgentType[]).map((agent) => {
          const config = agentConfig[agent];
          const latestMsg = messages.filter(m => m.agent === agent).pop();

          return (
            <motion.div
              key={agent}
              layout
              className={`rounded-xl border p-4 ${config.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <config.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(latestMsg?.status || 'idle')}
                <span className="text-xs">
                  {latestMsg?.status || 'In attesa'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Message Stream */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Log Agenti</h2>
        </div>
        <div className="h-96 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                In attesa di messaggi dagli agenti...
              </div>
            ) : (
              messages.map((msg, i) => {
                const config = agentConfig[msg.agent];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-3 p-3 rounded-lg ${config.color} bg-opacity-30`}
                  >
                    <config.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase">{msg.agent}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString('it-IT')}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{msg.message}</p>
                      {msg.progress !== undefined && (
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-current rounded-full transition-all"
                            style={{ width: `${msg.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}