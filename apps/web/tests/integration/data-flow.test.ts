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
      note: "finished an important task",
      source: "web",
    });

    await createMoodEntry({
      userId,
      occurredAt: `${date}T16:00:00.000Z`,
      score: -3,
      note: "overtime caused pressure",
      source: "web",
    });

    const entries = await listMoodEntriesByDate(userId, date);
    expect(entries).toHaveLength(2);

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
        keyword: "running",
        tags: ["\u5F00\u5FC3"],
        triggerKey: "exercise",
        scoreBias: 2,
      },
    ]);

    const entry = await createMoodEntry({
      userId,
      occurredAt: `${date}T07:00:00.000Z`,
      score: 1,
      note: "morning running for 30 minutes",
      source: "web",
    });

    expect(entry.tags).toContain("\u5F00\u5FC3");
    expect(entry.triggerKeys).toContain("exercise");
  });

  it("filters daily entries by local timezone offset", async () => {
    const earlyUtc = await createMoodEntry({
      userId,
      occurredAt: "2026-02-10T23:30:00.000Z",
      score: 1,
      note: "late evening in UTC",
      source: "web",
    });

    await createMoodEntry({
      userId,
      occurredAt: "2026-02-11T23:30:00.000Z",
      score: -1,
      note: "next day in UTC+8 local time",
      source: "web",
    });

    const entries = await listMoodEntriesByDate(userId, date, -480);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.id).toBe(earlyUtc.id);
  });
});
