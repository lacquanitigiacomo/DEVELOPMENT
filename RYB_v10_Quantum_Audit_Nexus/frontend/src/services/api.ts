import axios from 'axios';
import type { AnalysisDepth, AnalysisJob, NLQueryResult, UploadedDocument } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// Interceptor per quantum-resistant headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ryb_session');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-RYB-Version'] = '10.0.0';
  config.headers['X-Quantum-Ready'] = '1';
  return config;
});

export const uploadAPI = {
  async uploadDocuments(files: File[], depth: AnalysisDepth, timeSheets?: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append('documents', f));
    if (timeSheets) timeSheets.forEach((f) => formData.append('timeSheets', f));
    formData.append('depth', depth);

    const res = await api.post<{ jobId: string; documents: UploadedDocument[] }>(
      '/analysis/start',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },
};

export const analysisAPI = {
  async getJob(id: string) {
    const res = await api.get<AnalysisJob>(`/analysis/${id}`);
    return res.data;
  },

  async queryNL(jobId: string, query: string) {
    const res = await api.post<NLQueryResult>(`/analysis/${jobId}/query`, { query });
    return res.data;
  },

  async generateBrief(jobId: string) {
    const res = await api.post<{ brief: string; pdfUrl: string }>(`/report/${jobId}/brief`);
    return res.data;
  },

  async notarize(jobId: string) {
    const res = await api.post<{ txHash: string; timestamp: string }>(`/report/${jobId}/notarize`);
    return res.data;
  },
};

export const collabAPI = {
  async joinSession(jobId: string) {
    const res = await api.post<{ sessionToken: string; peers: string[] }>(`/collab/${jobId}/join`);
    return res.data;
  },
};

export const pluginAPI = {
  async listPlugins() {
    const res = await api.get<{ plugins: Array<{ id: string; name: string }> }>('/plugins');
    return res.data.plugins;
  },

  async loadPlugin(id: string) {
    const res = await api.get<{ manifest: unknown; code: string }>(`/plugins/${id}`);
    return res.data;
  },
};

export default api;