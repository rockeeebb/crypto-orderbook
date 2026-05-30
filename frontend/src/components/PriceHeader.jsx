import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const fmt = (v, d = 2) =>
  v == null || Number.isNaN(v)
    ? '—'
    : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default function PriceHeader({ latest, status }) {
  const current = latest?.currentPrice;
  const predicted = latest?.predictedPrice;
  const imbalance = latest?.imbalancePct ?? 0;
  const bullish = imbalance >= 0;
  const color = bullish ? 'text-bull' : 'text-bear';
  const Icon = bullish ? TrendingUp : TrendingDown;

  const dotClass =
    status === 'connected' ? 'bg-bull animate-pulse' : status === 'connecting' ? 'bg-amber-400' : 'bg-bear';

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 md:p-8 backdrop-blur shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span className="text-slate-200 font-semibold tracking-wide">BTC / USDT · Binance</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full ${dotClass}`} />
          <span className="text-slate-400 uppercase tracking-wider">{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-slate-400 text-sm mb-1">Current Price</div>
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            ${fmt(current)}
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-sm mb-1 flex items-center gap-2">
            Predicted Price
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className={`font-mono text-3xl sm:text-4xl md:text-5xl tracking-tight ${color}`}>
            ${fmt(predicted)}
          </div>
        </div>
      </div>
    </div>
  );
}
