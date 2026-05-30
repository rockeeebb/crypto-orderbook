import React from 'react';

const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour12: false });
const fmt = (v, d = 4) =>
  v == null || Number.isNaN(v)
    ? '—'
    : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default function MetricsTable({ history }) {
  const rows = [...history].reverse(); // newest first, up to 1200 = 20 min
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-slate-200 font-semibold">Raw metrics · last 20 min</h3>
        <span className="text-xs text-slate-500">{rows.length} rows</span>
      </div>
      <div className="overflow-auto -mx-2 px-2 max-h-[28rem] md:max-h-[32rem]">
        <table className="w-full text-sm font-mono">
          <thead className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            <tr>
              <th className="py-2 px-2 text-left">Time</th>
              <th className="py-2 px-2 text-right">Current</th>
              <th className="py-2 px-2 text-right">Weight %</th>
              <th className="py-2 px-2 text-right">Value Δ</th>
              <th className="py-2 px-2 text-right">Predicted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.timestamp}
                className="border-b border-slate-800/50 hover:bg-slate-800/30"
              >
                <td className="py-1.5 px-2 text-slate-300 whitespace-nowrap">{fmtTime(r.timestamp)}</td>
                <td className="py-1.5 px-2 text-right text-white">${fmt(r.currentPrice, 2)}</td>
                <td
                  className={`py-1.5 px-2 text-right ${
                    r.imbalancePct >= 0 ? 'text-bull' : 'text-bear'
                  }`}
                >
                  {r.imbalancePct >= 0 ? '+' : ''}
                  {fmt(r.imbalancePct, 4)}%
                </td>
                <td
                  className={`py-1.5 px-2 text-right ${
                    r.valueChange >= 0 ? 'text-bull' : 'text-bear'
                  }`}
                >
                  {r.valueChange >= 0 ? '+' : ''}
                  {fmt(r.valueChange, 4)}
                </td>
                <td
                  className={`py-1.5 px-2 text-right ${
                    r.predictedPrice >= r.currentPrice ? 'text-bull' : 'text-bear'
                  }`}
                >
                  ${fmt(r.predictedPrice, 2)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">
                  Waiting for data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
