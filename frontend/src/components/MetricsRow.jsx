import React from 'react';
import { Scale, Coins } from 'lucide-react';

const fmt = (v, d = 4) =>
  v == null || Number.isNaN(v)
    ? '—'
    : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default function MetricsRow({ latest }) {
  const imbalance = latest?.imbalancePct ?? 0;
  const valueChange = latest?.valueChange ?? 0;
  const imbColor = imbalance >= 0 ? 'text-bull' : 'text-bear';
  const vcColor = valueChange >= 0 ? 'text-bull' : 'text-bear';
  // visualize |imbalance| scaled — 10% imbalance fills the bar
  const imbBar = Math.min(100, Math.abs(imbalance) * 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
          <Scale className="w-4 h-4" />
          Weight Change % (Imbalance OBI · top 60)
        </div>
        <div className={`font-mono text-2xl md:text-3xl ${imbColor}`}>
          {imbalance >= 0 ? '+' : ''}
          {fmt(imbalance, 4)}%
        </div>
        <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${imbalance >= 0 ? 'bg-bull' : 'bg-bear'}`}
            style={{ width: `${imbBar}%`, transition: 'width 300ms ease' }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
          <Coins className="w-4 h-4" />
          Value Change (USDT)
        </div>
        <div className={`font-mono text-2xl md:text-3xl ${vcColor}`}>
          {valueChange >= 0 ? '+' : ''}
          {fmt(valueChange, 4)}
        </div>
        <div className="mt-3 text-xs text-slate-500">
          (ask₆₀ − bid₆₀) × OBI
        </div>
      </div>
    </div>
  );
}
