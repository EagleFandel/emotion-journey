"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { hourLabel } from "@emotion-journey/ui";
import type { MoodEntry } from "@emotion-journey/domain";

function toChartData(entries: MoodEntry[]) {
  return entries
    .map((entry) => {
      const hour = Number.parseInt(entry.occurredAt.slice(11, 13), 10);
      return {
        time: hour,
        score: entry.score,
        note: entry.note,
      };
    })
    .sort((a, b) => a.time - b.time);
}

export function MoodCurveChart({ entries }: { entries: MoodEntry[] }) {
  const data = toChartData(entries);

  if (data.length === 0) {
    return (
      <div className="paper-card axis-grid flex h-80 items-center justify-center text-stone-500">
        先点一下今天第一个情绪点
      </div>
    );
  }

  return (
    <div className="paper-card axis-grid h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 12, left: 8 }}>
          <XAxis
            dataKey="time"
            ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]}
            tickFormatter={(value) => hourLabel(Number(value))}
            stroke="#1f2937"
          />
          <YAxis domain={[-5, 5]} ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]} stroke="#1f2937" />
          <Tooltip
            formatter={(value) => [value, "情绪分值"]}
            labelFormatter={(value) => `时间 ${hourLabel(Number(value))}`}
            contentStyle={{ borderRadius: 12, border: "1px solid #e8e1d0" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#7BC4F2"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 1, stroke: "#1f2937", fill: "#F6C94A" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
