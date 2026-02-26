import { describe, expect, it } from "vitest";
import { parseEmotion, generateDailyReview } from "../src/index";
import type { MoodEntry } from "@emotion-journey/domain";

describe("rule-engine", () => {
  it("extracts tags and triggers from note", () => {
    const parsed = parseEmotion("今天加班到很晚，回家后失眠", -2);
    expect(parsed.tags).toContain("疲惫");
    expect(parsed.triggerKeys).toContain("工作任务");
    expect(parsed.triggerKeys).toContain("睡眠问题");
  });

  it("generates review with peak and valley", () => {
    const entries: MoodEntry[] = [
      {
        id: "1",
        userId: "u1",
        occurredAt: "2026-02-11T09:00:00.000Z",
        score: 3,
        note: "完成晨会",
        tags: ["成就感"],
        triggerKeys: ["工作任务"],
        source: "web",
        createdAt: "2026-02-11T09:00:00.000Z",
        updatedAt: "2026-02-11T09:00:00.000Z",
      },
      {
        id: "2",
        userId: "u1",
        occurredAt: "2026-02-11T17:00:00.000Z",
        score: -3,
        note: "争吵",
        tags: ["沮丧"],
        triggerKeys: ["人际冲突"],
        source: "web",
        createdAt: "2026-02-11T17:00:00.000Z",
        updatedAt: "2026-02-11T17:00:00.000Z",
      },
    ];

    const result = generateDailyReview("u1", "2026-02-11", entries);
    expect(result.review.peakEntryId).toBe("1");
    expect(result.review.valleyEntryId).toBe("2");
    expect(result.review.energyLoad).toBeGreaterThan(0);
  });

  it("supports case-insensitive lexicon and risk term matching", () => {
    const parsed = parseEmotion("I got an OFFER but still feel want to DIE", 0, {
      lexicon: [{ keyword: "offer", tags: ["开心"], triggerKey: "求职压力", scoreBias: 2 }],
      riskTerms: ["want to die"],
    });

    expect(parsed.triggerKeys).toContain("求职压力");
    expect(parsed.tags).toContain("开心");
    expect(parsed.hasRiskSignal).toBe(true);
  });

  it("limits score bias impact to avoid over-adjustment", () => {
    const parsed = parseEmotion("a b c d e", 0, {
      lexicon: [
        { keyword: "a", tags: ["开心"], triggerKey: "x", scoreBias: 2 },
        { keyword: "b", tags: ["开心"], triggerKey: "x", scoreBias: 2 },
        { keyword: "c", tags: ["开心"], triggerKey: "x", scoreBias: 2 },
        { keyword: "d", tags: ["开心"], triggerKey: "x", scoreBias: 2 },
        { keyword: "e", tags: ["开心"], triggerKey: "x", scoreBias: 2 },
      ],
      riskTerms: [],
    });

    expect(parsed.tags).toContain("开心");
    expect(parsed.tags).not.toContain("成就感");
  });
});
