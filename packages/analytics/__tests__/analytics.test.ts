import { describe, expect, it } from "vitest";
import { computeTrends, computeTriggerInsights } from "../src/index";
import type { MoodEntry } from "@emotion-journey/domain";

const baseEntries: MoodEntry[] = [
  {
    id: "1",
    userId: "u1",
    occurredAt: "2026-02-10T08:00:00.000Z",
    score: -1,
    note: "通勤",
    tags: ["疲惫"],
    triggerKeys: ["出行"],
    source: "web",
    createdAt: "2026-02-10T08:00:00.000Z",
    updatedAt: "2026-02-10T08:00:00.000Z",
  },
  {
    id: "2",
    userId: "u1",
    occurredAt: "2026-02-10T20:00:00.000Z",
    score: 2,
    note: "运动",
    tags: ["开心"],
    triggerKeys: ["身体活动"],
    source: "web",
    createdAt: "2026-02-10T20:00:00.000Z",
    updatedAt: "2026-02-10T20:00:00.000Z",
  },
  {
    id: "3",
    userId: "u1",
    occurredAt: "2026-02-11T09:00:00.000Z",
    score: -2,
    note: "加班",
    tags: ["焦虑"],
    triggerKeys: ["工作任务"],
    source: "web",
    createdAt: "2026-02-11T09:00:00.000Z",
    updatedAt: "2026-02-11T09:00:00.000Z",
  },
];

describe("analytics", () => {
  it("aggregates daily trend points", () => {
    const trends = computeTrends(baseEntries, "week");
    expect(trends.length).toBe(2);
    expect(trends[0]?.period).toBe("2026-02-10");
  });

  it("computes trigger insight ranking", () => {
    const insights = computeTriggerInsights(baseEntries);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0]?.frequency).toBeGreaterThanOrEqual(1);
  });
});
