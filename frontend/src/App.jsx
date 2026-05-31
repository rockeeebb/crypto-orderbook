import React from 'react';
import PriceHeader from './components/PriceHeader.jsx';
import MetricsRow from './components/MetricsRow.jsx';
import PriceChart from './components/PriceChart.jsx';
import MetricsTable from './components/MetricsTable.jsx';
import { useOrderBookSocket } from './hooks/useOrderBookSocket.js';

export default function App() {
  const { history, status, latest } = useOrderBookSocket();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Orderbook <span className="text-amber-400">Pulse</span>
          </h1>
          <span className="text-xs text-slate-500">
            3-level weighted OBI · 1s tick · 20 min history
          </span>
        </header>

        <PriceHeader latest={latest} status={status} />
        <MetricsRow latest={latest} />
        <PriceChart history={history} />
        <MetricsTable history={history} />

        <footer className="text-center text-xs text-slate-600 py-4">
          Data via Binance public WebSocket · educational purposes only
        </footer>
      </div>
    </div>
  );
}
