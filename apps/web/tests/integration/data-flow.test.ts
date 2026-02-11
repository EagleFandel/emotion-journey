import { beforeEach, describe, expect, it } from "vitest";
import { generateDailyReview } from "@emotion-journey/rule-engine";
import {
  createMoodEntry,
  getReview,
  listMoodEntriesByDate,
  resetStoreForTests,
  saveReview,
  setLexicon,
} from "@/lib/data-store";

describe("integration data flow", () => {
  const userId = "tester@example.com";
  const date = "2026-02-11";

  beforeEach(async () => {
    await resetStoreForTests();
  });

  it("creates entries and generates review", async () => {
    await createMoodEntry({
      userId,
      occurredAt: `${date}T09:00:00.000Z`,
      score: 2,
      note: "完成一个重要任务",
      source: "web",
    });

    await createMoodEntry({
      userId,
      occurredAt: `${date}T16:00:00.000Z`,
      score: -3,
      note: "加班导致压力较大",
      source: "web",
    });

    const entries = await listMoodEntriesByDate(userId, date);
    expect(entries.length).toBe(2);

    const result = generateDailyReview(userId, date, entries);
    await saveReview(result.review);

    const stored = await getReview(userId, date);
    expect(stored).not.toBeNull();
    expect(stored?.peakEntryId).not.toBeNull();
    expect(stored?.valleyEntryId).not.toBeNull();
  });

  it("applies updated lexicon", async () => {
    await setLexicon([
      {
        keyword: "晨跑",
        tags: ["开心"],
        triggerKey: "运动习惯",
        scoreBias: 2,
      },
    ]);

    const entry = await createMoodEntry({
      userId,
      occurredAt: `${date}T07:00:00.000Z`,
      score: 1,
      note: "今天晨跑30分钟",
      source: "web",
    });

    expect(entry.tags).toContain("开心");
    expect(entry.triggerKeys).toContain("运动习惯");
  });
});