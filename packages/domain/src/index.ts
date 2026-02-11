export type MoodScore = -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;

export type MoodTag =
  | "焦虑"
  | "成就感"
  | "空虚"
  | "紧绷"
  | "开心"
  | "平静"
  | "疲惫"
  | "沮丧";

export type EntrySource = "web" | "offline_queue" | "admin_seed";

export interface MoodEntry {
  id: string;
  userId: string;
  occurredAt: string;
  score: MoodScore;
  note: string;
  tags: MoodTag[];
  triggerKeys: string[];
  source: EntrySource;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: string;
  peakEntryId: string | null;
  valleyEntryId: string | null;
  dominantTags: MoodTag[];
  energyLoad: number;
  summaryText: string;
  hasRiskSignal: boolean;
  createdAt: string;
}

export interface TrendPoint {
  period: string;
  avgScore: number;
  volatility: number;
  entryCount: number;
}

export interface TriggerInsight {
  triggerKey: string;
  frequency: number;
  avgImpact: number;
  peakHour: number;
}

export interface LexiconItem {
  keyword: string;
  tags: MoodTag[];
  triggerKey: string;
  scoreBias?: number | undefined;
}

export interface ReviewGenerationResult {
  review: DailyReview;
  warnings: string[];
}

export interface AdminMetrics {
  totalUsers: number;
  totalEntries: number;
  todayEntries: number;
  reviewsGenerated: number;
  riskSignalsToday: number;
}

export const MOOD_SCORE_MIN = -5;
export const MOOD_SCORE_MAX = 5;

export function toMoodScore(value: number): MoodScore {
  const safe = Math.max(MOOD_SCORE_MIN, Math.min(MOOD_SCORE_MAX, Math.round(value)));
  return safe as MoodScore;
}

export function dayKey(isoDateTime: string): string {
  return isoDateTime.slice(0, 10);
}

export function hourOf(isoDateTime: string): number {
  return Number.parseInt(isoDateTime.slice(11, 13), 10);
}
