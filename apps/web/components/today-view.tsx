"use client";

import { useCallback, useEffect, useState } from "react";
import type { MoodEntry } from "@emotion-journey/domain";
import { AddMoodEntryForm } from "@/components/add-mood-entry-form";
import { EntryList } from "@/components/entry-list";
import { MoodCurveChart } from "@/components/mood-curve-chart";
import { fetchMoodEntries } from "@/lib/api-client";
import { getTodayKey } from "@/lib/date";

export function TodayView() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const date = getTodayKey();
    const data = await fetchMoodEntries(date);
    setEntries(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        const date = getTodayKey();
        const data = await fetchMoodEntries(date);
        if (!cancelled) {
          setEntries(data);
          setIsLoading(false);
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <main className="page-container space-y-4">
      <section>
        <h1 className="section-title">今天</h1>
        {isLoading ? (
          <div className="paper-card h-80 animate-pulse" />
        ) : (
          <MoodCurveChart entries={entries} />
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <AddMoodEntryForm onCreated={load} />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">最近3条记录</h2>
          <EntryList entries={entries} onChanged={load} />
        </div>
      </section>
    </main>
  );
}