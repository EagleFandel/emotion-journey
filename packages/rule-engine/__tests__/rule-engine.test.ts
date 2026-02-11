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
});
