import type { DailyReview, MoodEntry, TrendPoint, TriggerInsight } from "@emotion-journey/domain";
import { getTimezoneOffsetMinutes } from "@/lib/date";

interface ApiErrorPayload {
  error?: string;
  code?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function shouldRetryStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function toNetworkError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError("请求超时，请稍后重试。", 0);
  }
  return new ApiError("网络连接异常，请稍后重试。", 0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function request(
  input: string,
  init?: RequestInit,
  options?: { timeoutMs?: number; retries?: number },
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 8000;
  const retries = options?.retries ?? 1;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      if (response.ok || attempt === retries || !shouldRetryStatus(response.status)) {
        return response;
      }
    } catch (error) {
      if (attempt === retries) {
        throw toNetworkError(error);
      }
    } finally {
      clearTimeout(timer);
    }

    await sleep(250 * (attempt + 1));
  }

  throw new ApiError("请求失败", 0);
}

async function toData<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { data?: T } & ApiErrorPayload | null;
  if (!response.ok) {
    throw new ApiError(payload?.error ?? "请求失败", response.status, payload?.code);
  }
  return payload?.data as T;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败";
}

export async function fetchMoodEntries(date: string): Promise<MoodEntry[]> {
  const params = new URLSearchParams({
    date,
    tzOffsetMinutes: String(getTimezoneOffsetMinutes()),
  });
  const response = await request(`/api/mood-entries?${params.toString()}`);
  return toData<MoodEntry[]>(response);
}

export async function generateDailyReview(date: string): Promise<DailyReview> {
  const response = await request("/api/reviews/daily/generate", {
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
  const response = await request(`/api/reviews/daily?date=${date}`);
  return toData<DailyReview | null>(response);
}

export async function fetchTrend(range: "week" | "month"): Promise<TrendPoint[]> {
  const response = await request(`/api/insights/trends?range=${range}`, undefined, {
    timeoutMs: 4000,
    retries: 1,
  });
  return toData<TrendPoint[]>(response);
}

export async function fetchTriggers(range: "week" | "month"): Promise<TriggerInsight[]> {
  const response = await request(`/api/insights/triggers?range=${range}`, undefined, {
    timeoutMs: 4000,
    retries: 1,
  });
  return toData<TriggerInsight[]>(response);
}
