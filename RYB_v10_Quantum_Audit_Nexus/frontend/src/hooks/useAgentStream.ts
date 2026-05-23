import { useEffect, useRef, useCallback } from 'react';
import { useRYBStore } from '@/store/agentStore';
import type { AgentMessage } from '@/types';

export function useAgentStream(jobId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const appendMessage = useRYBStore((s) => s.appendAgentMessage);
  const updateJob = useRYBStore((s) => s.updateJob);

  useEffect(() => {
    if (!jobId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;
    const ws = new WebSocket(`${wsUrl}/jobs/${jobId}/stream`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg: AgentMessage = JSON.parse(event.data);
      appendMessage(msg);

      if (msg.status === 'completed' && msg.agent === 'swarm') {
        updateJob(jobId, { status: 'completed', completedAt: new Date().toISOString() });
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      ws.close();
    };
  }, [jobId, appendMessage, updateJob]);

  const sendCommand = useCallback((command: string, payload?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command, payload }));
    }
  }, []);

  return { sendCommand };
}