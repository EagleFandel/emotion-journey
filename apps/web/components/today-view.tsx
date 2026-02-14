"use client";

import { useCallback, useEffect, useState } from "react";
import type { MoodEntry } from "@emotion-journey/domain";
import { AddMoodEntryForm } from "@/components/add-mood-entry-form";
import { EntryList } from "@/components/entry-list";
import { MoodCurveChart } from "@/components/mood-curve-chart";
import { fetchMoodEntries, getErrorMessage } from "@/lib/api-client";
import { getTodayKey } from "@/lib/date";

export function TodayView() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const date = getTodayKey();
      const data = await fetchMoodEntries(date);
      setEntries(data);
    } catch (err) {
      setEntries([]);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="page-container space-y-4">
      <section>
        <h1 className="section-title">今天</h1>
        {isLoading ? (
          <div className="paper-card h-80 animate-pulse" />
        ) : error ? (
          <div className="paper-card flex h-80 items-center justify-center text-sm text-red-700">{error}</div>
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
