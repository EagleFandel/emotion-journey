import {
  dayKey,
  toMoodScore,
  type DailyReview,
  type LexiconItem,
  type MoodEntry,
  type MoodTag,
  type ReviewGenerationResult,
} from "@emotion-journey/domain";
import {
  DEFAULT_LEXICON,
  DEFAULT_RISK_TERMS,
  SAFETY_HINT,
  SUMMARY_TEMPLATES,
} from "@emotion-journey/config";

export interface RuleEngineOptions {
  lexicon?: LexiconItem[];
  riskTerms?: string[];
}

export interface ParsedEmotion {
  tags: MoodTag[];
  triggerKeys: string[];
  hasRiskSignal: boolean;
}

const NEGATIVE_TAGS: MoodTag[] = ["焦虑", "空虚", "紧绷", "疲惫", "沮丧"];

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function parseEmotion(note: string, score: number, options?: RuleEngineOptions): ParsedEmotion {
  const lexicon = options?.lexicon ?? DEFAULT_LEXICON;
  const riskTerms = options?.riskTerms ?? DEFAULT_RISK_TERMS;
  const text = note.trim();

  const tags: MoodTag[] = [];
  const triggerKeys: string[] = [];
  let adjustedScore = score;

  for (const item of lexicon) {
    if (text.includes(item.keyword)) {
      tags.push(...item.tags);
      triggerKeys.push(item.triggerKey);
      adjustedScore += item.scoreBias ?? 0;
    }
  }

  const normalizedScore = toMoodScore(adjustedScore);
  if (normalizedScore >= 3) tags.push("开心");
  if (normalizedScore <= -3) tags.push("沮丧");
  if (normalizedScore <= -1 && !tags.some((tag) => NEGATIVE_TAGS.includes(tag))) tags.push("焦虑");
  if (normalizedScore >= -1 && normalizedScore <= 1 && tags.length === 0) tags.push("平静");

  const hasRiskSignal = riskTerms.some((term) => text.includes(term));

  return {
    tags: unique(tags),
    triggerKeys: unique(triggerKeys),
    hasRiskSignal,
  };
}

function dominantTags(entries: MoodEntry[]): MoodTag[] {
  const count = new Map<MoodTag, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      count.set(tag, (count.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(count.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

function energyLoad(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const baseline = entries.reduce((sum, entry) => sum + Math.abs(entry.score), 0) / entries.length;
  const penalties = entries.filter((entry) => entry.score <= -2).length * 0.5;
  return Number((baseline + penalties).toFixed(2));
}

export function generateReviewSummary(entries: MoodEntry[], hasRiskSignal: boolean): string {
  if (hasRiskSignal) {
    return `${SUMMARY_TEMPLATES.risk} ${SAFETY_HINT}`;
  }

  if (entries.length === 0) {
    return "今天还没有记录，先完成一次打点再来复盘。";
  }

  const scores = entries.map((entry) => Number(entry.score));
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  if (max - min <= 2) {
    return SUMMARY_TEMPLATES.stable;
  }

  if (avg < 0) {
    return SUMMARY_TEMPLATES.highLoad;
  }

  return SUMMARY_TEMPLATES.positive;
}

export function generateDailyReview(
  userId: string,
  date: string,
  entries: MoodEntry[],
): ReviewGenerationResult {
  const sorted = [...entries].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const peak = sorted.reduce<MoodEntry | null>(
    (best, current) => (!best || current.score > best.score ? current : best),
    null,
  );
  const valley = sorted.reduce<MoodEntry | null>(
    (worst, current) => (!worst || current.score < worst.score ? current : worst),
    null,
  );

  const hasRiskSignal = sorted.some((entry) => {
    const parsed = parseEmotion(entry.note, entry.score);
    return parsed.hasRiskSignal;
  });

  const review: DailyReview = {
    id: `review_${userId}_${date}`,
    userId,
    date,
    peakEntryId: peak?.id ?? null,
    valleyEntryId: valley?.id ?? null,
    dominantTags: dominantTags(sorted),
    energyLoad: energyLoad(sorted),
    summaryText: generateReviewSummary(sorted, hasRiskSignal),
    hasRiskSignal,
    createdAt: new Date().toISOString(),
  };

  const warnings: string[] = [];
  if (hasRiskSignal) {
    warnings.push("检测到高风险语义，建议展示安全提示和热线资源。");
  }

  return {
    review,
    warnings,
  };
}

export function applyRulesToEntry(entry: Omit<MoodEntry, "tags" | "triggerKeys">): MoodEntry {
  const parsed = parseEmotion(entry.note, entry.score);
  return {
    ...entry,
    tags: parsed.tags,
    triggerKeys: parsed.triggerKeys,
  };
}

export function filterEntriesByDate(entries: MoodEntry[], date: string): MoodEntry[] {
  return entries.filter((entry) => dayKey(entry.occurredAt) === date);
}

export function summarizeTagHint(tags: MoodTag[]): string {
  if (tags.length === 0) return "今天整体偏平稳。";
  if (tags.includes("焦虑") || tags.includes("紧绷")) {
    return "你今天出现了明显紧绷时段，晚间建议减少信息输入。";
  }
  if (tags.includes("成就感") || tags.includes("开心")) {
    return "你在关键节点获得了积极反馈，记得保留成功节奏。";
  }
  return "今天情绪有波动，但你已经在主动觉察。";
}
