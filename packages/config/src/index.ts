import type { LexiconItem, MoodTag } from "@emotion-journey/domain";

export const THEME_COLORS = {
  background: "#F6F3EA",
  foreground: "#1F2937",
  accent: "#7BC4F2",
  positive: "#F6C94A",
  negative: "#9AB0A6",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

export const APP_NAME = "Emotion Journey";

export const DEFAULT_MOOD_TAGS: MoodTag[] = [
  "焦虑",
  "成就感",
  "空虚",
  "紧绷",
  "开心",
  "平静",
  "疲惫",
  "沮丧",
];

export const DEFAULT_LEXICON: LexiconItem[] = [
  { keyword: "汇报", tags: ["紧绷", "成就感"], triggerKey: "工作任务", scoreBias: 1 },
  { keyword: "加班", tags: ["疲惫", "焦虑"], triggerKey: "工作任务", scoreBias: -2 },
  { keyword: "考试", tags: ["焦虑", "紧绷"], triggerKey: "学业压力", scoreBias: -2 },
  { keyword: "运动", tags: ["平静", "开心"], triggerKey: "身体活动", scoreBias: 2 },
  { keyword: "朋友", tags: ["开心"], triggerKey: "社交互动", scoreBias: 1 },
  { keyword: "争吵", tags: ["沮丧", "焦虑"], triggerKey: "人际冲突", scoreBias: -3 },
  { keyword: "失眠", tags: ["疲惫", "空虚"], triggerKey: "睡眠问题", scoreBias: -2 },
  { keyword: "完成", tags: ["成就感", "开心"], triggerKey: "任务完成", scoreBias: 2 },
  { keyword: "拖延", tags: ["空虚", "焦虑"], triggerKey: "时间管理", scoreBias: -2 },
  { keyword: "通勤", tags: ["疲惫"], triggerKey: "出行", scoreBias: -1 },
];

export const DEFAULT_RISK_TERMS = [
  "不想活",
  "伤害自己",
  "绝望",
  "撑不住",
  "自残",
  "轻生",
];

export const SAFETY_HINT =
  "你值得被认真对待。如果你正在经历强烈痛苦，请优先联系可信的人或当地专业支持热线。";

export const SUMMARY_TEMPLATES = {
  stable: "今天整体波动较平稳，说明你在多数时段保持了可控节奏。",
  highLoad: "你今天不是情绪差，而是消耗偏高，建议今晚优先恢复能量。",
  positive: "你在关键事件后有明显回升，说明你具备良好的调节能力。",
  risk: "检测到高风险表达。请先照顾安全，并考虑联系专业支持。",
};
