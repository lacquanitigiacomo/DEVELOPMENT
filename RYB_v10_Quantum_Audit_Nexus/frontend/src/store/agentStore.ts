import { create } from 'zustand';
import type { AnalysisJob, AgentMessage, User, CollabCursor, PluginManifest } from '@/types';

interface RYBState {
  // Auth & User
  user: User | null;
  setUser: (user: User | null) => void;

  // Active Job
  activeJob: AnalysisJob | null;
  setActiveJob: (job: AnalysisJob | null) => void;
  updateJobStatus: (status: AnalysisJob['status']) => void;
  appendAgentMessage: (msg: AgentMessage) => void;

  // Job History
  jobs: AnalysisJob[];
  addJob: (job: AnalysisJob) => void;
  updateJob: (id: string, updates: Partial<AnalysisJob>) => void;

  // Collaboration
  cursors: CollabCursor[];
  updateCursor: (cursor: CollabCursor) => void;
  removeCursor: (userId: string) => void;

  // Plugins
  plugins: PluginManifest[];
  registerPlugin: (plugin: PluginManifest) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useRYBStore = create<RYBState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  activeJob: null,
  setActiveJob: (job) => set({ activeJob: job }),
  updateJobStatus: (status) => set((state) => ({
    activeJob: state.activeJob ? { ...state.activeJob, status } : null
  })),
  appendAgentMessage: (msg) => set((state) => ({
    activeJob: state.activeJob ? {
      ...state.activeJob,
      agentMessages: [...state.activeJob.agentMessages, msg]
    } : null
  })),

  jobs: [],
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) => set((state) => ({
    jobs: state.jobs.map(j => j.id === id ? { ...j, ...updates } : j)
  })),

  cursors: [],
  updateCursor: (cursor) => set((state) => ({
    cursors: [
      ...state.cursors.filter(c => c.userId !== cursor.userId),
      cursor
    ]
  })),
  removeCursor: (userId) => set((state) => ({
    cursors: state.cursors.filter(c => c.userId !== userId)
  })),

  plugins: [],
  registerPlugin: (plugin) => set((state) => ({
    plugins: [...state.plugins.filter(p => p.id !== plugin.id), plugin]
  })),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));