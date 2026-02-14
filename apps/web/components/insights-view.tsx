"use client";

import { useEffect, useRef, useState } from "react";
import type { TrendPoint, TriggerInsight } from "@emotion-journey/domain";
import { fetchTrend, fetchTriggers, getErrorMessage } from "@/lib/api-client";
import { TrendChart } from "@/components/trend-chart";
import { TriggerList } from "@/components/trigger-list";

export function InsightsView() {
  const [range, setRange] = useState<"week" | "month">("week");
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [triggers, setTriggers] = useState<TriggerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Record<"week" | "month", { trends: TrendPoint[]; triggers: TriggerInsight[] } | null>>({
    week: null,
    month: null,
  });

  useEffect(() => {
    void (async () => {
      const cached = cacheRef.current[range];
      if (cached) {
        setTrends(cached.trends);
        setTriggers(cached.triggers);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [trendData, triggerData] = await Promise.all([fetchTrend(range), fetchTriggers(range)]);
        cacheRef.current[range] = { trends: trendData, triggers: triggerData };
        setTrends(trendData);
        setTriggers(triggerData);
      } catch (err) {
        setTrends([]);
        setTriggers([]);
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [range]);

  return (
    <main className="page-container space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="section-title">长期情绪地图</h1>
        <div className="rounded-full border border-stone-300 p-1 text-sm">
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${range === "week" ? "bg-stone-900 text-white" : ""}`}
            onClick={() => {
              setRange("week");
            }}
          >
            周
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${range === "month" ? "bg-stone-900 text-white" : ""}`}
            onClick={() => {
              setRange("month");
            }}
          >
            月
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="paper-card h-72 animate-pulse" />
      ) : error ? (
        <div className="paper-card p-4 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <TrendChart points={trends} />
          <section>
            <h2 className="mb-2 text-lg font-semibold">高频情绪触发器</h2>
            <TriggerList insights={triggers} />
          </section>
        </>
      )}
    </main>
  );
}
