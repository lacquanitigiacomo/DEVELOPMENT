import type { CollabCursor } from '@/types';

export class CollabWebSocket {
  private ws: WebSocket | null = null;
  private jobId: string;
  private onCursorUpdate: (cursor: CollabCursor) => void;
  private onMessage: (type: string, payload: unknown) => void;

  constructor(
    jobId: string,
    onCursorUpdate: (cursor: CollabCursor) => void,
    onMessage: (type: string, payload: unknown) => void
  ) {
    this.jobId = jobId;
    this.onCursorUpdate = onCursorUpdate;
    this.onMessage = onMessage;
  }

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;
    this.ws = new WebSocket(`${wsUrl}/collab/${this.jobId}`);

    this.ws.onopen = () => {
      this.send('join', { jobId: this.jobId });
    };

    this.ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type === 'cursor') {
        this.onCursorUpdate(payload as CollabCursor);
      } else {
        this.onMessage(type, payload);
      }
    };
  }

  sendCursor(x: number, y: number, userName: string, color: string) {
    this.send('cursor', { x, y, userName, color });
  }

  sendAnnotation(targetId: string, note: string) {
    this.send('annotation', { targetId, note, timestamp: Date.now() });
  }

  private send(type: string, payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}