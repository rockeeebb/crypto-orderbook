import { useEffect, useRef, useState } from 'react';

const HISTORY_LIMIT = 600;

function defaultUrl() {
  if (typeof window === 'undefined') return 'ws://localhost:4000/ws';
  const { protocol, hostname, port, host } = window.location;
  // Vite dev mode: frontend on :5173, backend on :4000
  if (port === '5173') return `ws://${hostname}:4000/ws`;
  // Production / tunneled: ride the page's origin (wss over https)
  const wsProto = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProto}//${host}/ws`;
}

export function useOrderBookSocket(url) {
  const wsUrl = url || defaultUrl();
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('connecting');
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    let active = true;

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setStatus('connecting');

      ws.onopen = () => active && setStatus('connected');

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'history') {
            setHistory(Array.isArray(msg.data) ? msg.data : []);
          } else if (msg.type === 'update') {
            setHistory((prev) => {
              const next = prev.length >= HISTORY_LIMIT ? prev.slice(1) : prev.slice();
              next.push(msg.data);
              return next;
            });
          }
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (!active) return;
        setStatus('disconnected');
        reconnectTimerRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        try { ws.close(); } catch { /* noop */ }
      };
    }

    connect();
    return () => {
      active = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch { /* noop */ }
      }
    };
  }, [wsUrl]);

  return {
    history,
    status,
    latest: history.length > 0 ? history[history.length - 1] : null,
  };
}
