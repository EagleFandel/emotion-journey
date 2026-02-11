"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@emotion-journey/domain";

export function TrendChart({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return <div className="paper-card p-4 text-sm text-stone-500">暂无趋势数据。</div>;
  }

  return (
    <div className="paper-card h-72 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6d3c8" />
          <XAxis dataKey="period" />
          <YAxis domain={[-5, 5]} />
          <Tooltip formatter={(value) => [`${value}`, "平均分"]} />
          <Area
            type="monotone"
            dataKey="avgScore"
            stroke="#7BC4F2"
            fill="rgba(123,196,242,0.35)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
