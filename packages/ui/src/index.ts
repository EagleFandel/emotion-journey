import { clsx } from "clsx";

export function cn(...inputs: Array<string | number | false | null | undefined>) {
  return clsx(inputs);
}

export interface ScoreMeta {
  score: number;
  label: string;
  description: string;
  tone: "positive" | "neutral" | "negative";
}

const SCORE_META_TABLE: Record<number, Omit<ScoreMeta, "score">> = {
  5: {
    label: "高峰愉悦",
    description: "情绪非常高，通常伴随强烈满足感与能量感。",
    tone: "positive",
  },
  4: {
    label: "非常开心",
    description: "明显积极，整体状态饱满且有行动动力。",
    tone: "positive",
  },
  3: {
    label: "开心",
    description: "心情良好，能稳定推进日常任务。",
    tone: "positive",
  },
  2: {
    label: "轻松积极",
    description: "情绪偏正向，压力可控，恢复速度较快。",
    tone: "positive",
  },
  1: {
    label: "略有愉悦",
    description: "比平时稍好，存在积极趋势但不强烈。",
    tone: "positive",
  },
  0: {
    label: "平稳中性",
    description: "情绪基线状态，无明显起伏。",
    tone: "neutral",
  },
  [-1]: {
    label: "轻微低落",
    description: "出现轻度不适或烦闷，通常可通过短暂休整缓解。",
    tone: "negative",
  },
  [-2]: {
    label: "低落紧绷",
    description: "负面感受开始影响注意力与效率。",
    tone: "negative",
  },
  [-3]: {
    label: "明显难受",
    description: "情绪负荷较高，建议尽快识别触发因素。",
    tone: "negative",
  },
  [-4]: {
    label: "强烈痛苦",
    description: "持续受挫或压迫感明显，需要优先做稳定化处理。",
    tone: "negative",
  },
  [-5]: {
    label: "极度痛苦",
    description: "处于高风险低谷，建议立即寻求支持与保护。",
    tone: "negative",
  },
};

const DEFAULT_SCORE_META: Omit<ScoreMeta, "score"> = {
  label: "平稳中性",
  description: "情绪基线状态，无明显起伏。",
  tone: "neutral",
};

function normalizeScore(score: number): number {
  return Math.max(-5, Math.min(5, Math.round(score)));
}

export function scoreMeta(score: number): ScoreMeta {
  const normalized = normalizeScore(score);
  const meta = SCORE_META_TABLE[normalized] ?? DEFAULT_SCORE_META;
  return {
    score: normalized,
    ...meta,
  };
}

export function scoreLabel(score: number): string {
  return scoreMeta(score).label;
}

export function scoreDescription(score: number): string {
  return scoreMeta(score).description;
}

export function hourLabel(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}
