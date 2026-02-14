"use client";

import { useEffect, useState } from "react";
import type { DailyReview, MoodEntry } from "@emotion-journey/domain";
import { ReviewCard } from "@/components/review-card";
import { fetchDailyReview, fetchMoodEntries, generateDailyReview, getErrorMessage } from "@/lib/api-client";
import { getTodayKey } from "@/lib/date";

export function ReviewView() {
  const date = getTodayKey();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [review, setReview] = useState<DailyReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [entryData, reviewData] = await Promise.all([
          fetchMoodEntries(date),
          fetchDailyReview(date),
        ]);
        setEntries(entryData);
        setReview(reviewData);
      } catch (err) {
        setEntries([]);
        setReview(null);
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [date]);

  async function handleGenerate() {
    try {
      const created = await generateDailyReview(date);
      setReview(created);
      setMessage("复盘已生成");
      setError(null);
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  }

  return (
    <main className="page-container space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="section-title">今日复盘</h1>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
        >
          生成复盘
        </button>
      </header>

      {isLoading ? (
        <div className="paper-card h-56 animate-pulse" />
      ) : error ? (
        <div className="paper-card p-4 text-sm text-red-700">{error}</div>
      ) : (
        <ReviewCard review={review} entries={entries} />
      )}

      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
    </main>
  );
}
