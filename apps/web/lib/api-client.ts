import type { DailyReview, MoodEntry, TrendPoint, TriggerInsight } from "@emotion-journey/domain";
import { getTimezoneOffsetMinutes } from "@/lib/date";

async function toData<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "请求失败");
  }
  return payload.data as T;
}

export async function fetchMoodEntries(date: string): Promise<MoodEntry[]> {
  const params = new URLSearchParams({
    date,
    tzOffsetMinutes: String(getTimezoneOffsetMinutes()),
  });
  const response = await fetch(`/api/mood-entries?${params.toString()}`);
  return toData<MoodEntry[]>(response);
}

export async function generateDailyReview(date: string): Promise<DailyReview> {
  const response = await fetch("/api/reviews/daily/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date,
      tzOffsetMinutes: getTimezoneOffsetMinutes(),
    }),
  });
  return toData<DailyReview>(response);
}

export async function fetchDailyReview(date: string): Promise<DailyReview | null> {
  const response = await fetch(`/api/reviews/daily?date=${date}`);
  return toData<DailyReview | null>(response);
}

export async function fetchTrend(range: "week" | "month"): Promise<TrendPoint[]> {
  const response = await fetch(`/api/insights/trends?range=${range}`);
  return toData<TrendPoint[]>(response);
}

export async function fetchTriggers(range: "week" | "month"): Promise<TriggerInsight[]> {
  const response = await fetch(`/api/insights/triggers?range=${range}`);
  return toData<TriggerInsight[]>(response);
}
