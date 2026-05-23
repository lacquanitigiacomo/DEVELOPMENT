import { WebSocketServer, WebSocket } from 'ws';
import { getOrchestrator } from '../agents/swarm/orchestrator';

const clients = new Map<string, Set<WebSocket>>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws, req) => {
    const url = req.url || '';
    const match = url.match(/\/ws\/(jobs|collab)\/([^/]+)/);

    if (match) {
      const [, type, id] = match;

      if (!clients.has(id)) clients.set(id, new Set());
      clients.get(id)!.add(ws);

      if (type === 'jobs') {
        setupJobStream(ws, id);
      }
    }

    ws.on('close', () => {
      for (const [id, set] of clients.entries()) {
        set.delete(ws);
        if (set.size === 0) clients.delete(id);
      }
    });
  });
}

function setupJobStream(ws: WebSocket, jobId: string) {
  const orchestrator = getOrchestrator();

  const onMessage = (data: any) => {
    if (data.jobId === jobId) {
      ws.send(JSON.stringify(data));
    }
  };

  orchestrator.on('agentMessage', onMessage);
  orchestrator.on('completed', onMessage);
  orchestrator.on('error', onMessage);

  ws.on('close', () => {
    orchestrator.off('agentMessage', onMessage);
    orchestrator.off('completed', onMessage);
    orchestrator.off('error', onMessage);
  });
}