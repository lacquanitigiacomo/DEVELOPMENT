import { useEffect, useRef } from 'react';
import { useRYBStore } from '@/store/agentStore';
import { CollabWebSocket } from '@/services/websocket';

export default function CollabOverlay() {
  const cursors = useRYBStore((s) => s.cursors);
  const updateCursor = useRYBStore((s) => s.updateCursor);
  const removeCursor = useRYBStore((s) => s.removeCursor);
  const activeJob = useRYBStore((s) => s.activeJob);
  const wsRef = useRef<CollabWebSocket | null>(null);

  useEffect(() => {
    if (!activeJob) return;

    const ws = new CollabWebSocket(
      activeJob.id,
      updateCursor,
      (type, payload) => {
        if (type === 'user_left') {
          removeCursor((payload as { userId: string }).userId);
        }
      }
    );

    ws.connect();
    wsRef.current = ws;

    const handleMouseMove = (e: MouseEvent) => {
      ws.sendCursor(e.clientX, e.clientY, 'Utente', '#0ea5e9');
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ws.disconnect();
    };
  }, [activeJob, updateCursor, removeCursor]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-100"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" fill={cursor.color} stroke="white" strokeWidth="1"/>
          </svg>
          <span 
            className="absolute top-4 left-4 text-xs font-medium px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.userName}
          </span>
        </div>
      ))}
    </div>
  );
}