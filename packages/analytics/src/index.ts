import { dayKey, hourOf, type MoodEntry, type TrendPoint, type TriggerInsight } from "@emotion-journey/domain";

function std(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, n) => sum + n, 0) / values.length;
  const variance = values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / values.length;
  return Number(Math.sqrt(variance).toFixed(2));
}

export function computeTrends(entries: MoodEntry[], range: "week" | "month"): TrendPoint[] {
  const grouped = new Map<string, MoodEntry[]>();

  for (const entry of entries) {
    const key = range === "week" ? dayKey(entry.occurredAt) : dayKey(entry.occurredAt).slice(0, 7);
    const list = grouped.get(key) ?? [];
    list.push(entry);
    grouped.set(key, list);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, list]) => {
      const scores = list.map((entry) => Number(entry.score));
      const avg = scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1);
      return {
        period,
        avgScore: Number(avg.toFixed(2)),
        volatility: std(scores),
        entryCount: list.length,
      };
    });
}

export function computeTriggerInsights(entries: MoodEntry[]): TriggerInsight[] {
  const summary = new Map<string, { count: number; impact: number; hours: number[] }>();

  for (const entry of entries) {
    for (const triggerKey of entry.triggerKeys) {
      const current = summary.get(triggerKey) ?? { count: 0, impact: 0, hours: [] };
      current.count += 1;
      current.impact += entry.score;
      current.hours.push(hourOf(entry.occurredAt));
      summary.set(triggerKey, current);
    }
  }

  return Array.from(summary.entries())
    .map(([triggerKey, value]) => {
      const hourBuckets = new Map<number, number>();
      for (const hour of value.hours) {
        hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1);
      }
      const peakHour = Array.from(hourBuckets.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
      return {
        triggerKey,
        frequency: value.count,
        avgImpact: Number((value.impact / value.count).toFixed(2)),
        peakHour,
      };
    })
    .sort((a, b) => b.frequency - a.frequency);
}

