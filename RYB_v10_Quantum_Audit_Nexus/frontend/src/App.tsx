import { Routes, Route } from 'react-router-dom';
import { useRYBStore } from '@/store/agentStore';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import UploadZone from '@/components/UploadZone';
import AgentSwarmPanel from '@/components/agents/AgentSwarmPanel';
import AuditReport from '@/components/audit/AuditReport';
import NLQueryInterface from '@/components/NLQueryInterface';
import CollabOverlay from '@/components/collab/CollabOverlay';
import PluginManager from '@/components/PluginManager';

function App() {
  const darkMode = useRYBStore((s) => s.darkMode);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadZone onUploadComplete={(id) => console.log(id)} />} />
            <Route path="/job/:jobId" element={<AgentSwarmPanel />} />
            <Route path="/report/:jobId" element={<AuditReport />} />
            <Route path="/query" element={<NLQueryInterface />} />
            <Route path="/plugins" element={<PluginManager />} />
          </Route>
        </Routes>
        <CollabOverlay />
      </div>
    </div>
  );
}

export default App;