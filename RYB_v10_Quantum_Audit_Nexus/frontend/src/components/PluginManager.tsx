import { useState, useEffect } from 'react';
import { pluginAPI } from '@/services/api';
import { useRYBStore } from '@/store/agentStore';
import { Puzzle, Download, CheckCircle, Trash2 } from 'lucide-react';
import type { PluginManifest } from '@/types';

export default function PluginManager() {
  const [available, setAvailable] = useState<Array<{ id: string; name: string }>>([]);
  const plugins = useRYBStore((s) => s.plugins);
  const registerPlugin = useRYBStore((s) => s.registerPlugin);

  useEffect(() => {
    pluginAPI.listPlugins().then(setAvailable);
  }, []);

  const loadPlugin = async (id: string) => {
    const data = await pluginAPI.loadPlugin(id);
    registerPlugin(data.manifest as PluginManifest);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plugin System</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Estendi RYB con moduli personalizzati. Architettura a plugin v10.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {available.map((plugin) => {
          const isInstalled = plugins.some((p) => p.id === plugin.id);
          return (
            <div key={plugin.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Puzzle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{plugin.name}</h3>
                    <p className="text-xs text-gray-500">ID: {plugin.id}</p>
                  </div>
                </div>
                {isInstalled ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Attivo
                  </span>
                ) : (
                  <button
                    onClick={() => loadPlugin(plugin.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {plugins.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Plugin Attivi</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {plugins.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-500">v{p.version} · {p.permissions.join(', ')}</p>
                </div>
                <button className="p-1 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}