import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// ═══════════════════════════════════════════════════════════════
// ZERO-STRESS: Rileva ambiente e configura API URL automaticamente
// ═══════════════════════════════════════════════════════════════
function detectApiUrl(): string {
  // Codespaces: usa l'URL pubblico della porta 3001
  if (window.location.hostname.includes('github.dev')) {
    const codespaceUrl = window.location.origin.replace('-5173', '-3001');
    return codespaceUrl + '/api/v1';
  }
  // Localhost / Docker
  return 'http://localhost:3001/api/v1';
}

// Esponi globalmente per axios
(window as any).RYB_API_URL = detectApiUrl();
console.log('🔗 RYB API URL:', (window as any).RYB_API_URL);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
