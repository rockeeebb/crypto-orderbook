import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString('en-US', { hour12: false });

const CHART_WINDOW = 600; // last 10 minutes at 1 Hz

export default function PriceChart({ history }) {
  const data = useMemo(
    () =>
      history.slice(-CHART_WINDOW).map((m) => ({
        t: m.timestamp,
        time: formatTime(m.timestamp),
        current: Number(m.currentPrice.toFixed(2)),
        predicted: Number(m.predictedPrice.toFixed(2)),
      })),
    [history],
  );

  const domain = useMemo(() => {
    if (data.length === 0) return ['auto', 'auto'];
    let min = Infinity;
    let max = -Infinity;
    for (const d of data) {
      if (d.current < min) min = d.current;
      if (d.predicted < min) min = d.predicted;
      if (d.current > max) max = d.current;
      if (d.predicted > max) max = d.predicted;
    }
    const pad = (max - min) * 0.1 || 1;
    return [min - pad, max + pad];
  }, [data]);

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-slate-200 font-semibold">Current vs Predicted · last 10 min</h3>
        <span className="text-xs text-slate-500">{data.length} pts</span>
      </div>
      <div className="h-72 md:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} minTickGap={50} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={domain}
              tickFormatter={(v) => v.toFixed(0)}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#cbd5e1' }}
              formatter={(v) => `$${Number(v).toLocaleString()}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="current"
              name="Current"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
