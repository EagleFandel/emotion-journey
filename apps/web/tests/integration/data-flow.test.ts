import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateDailyReview } from "@emotion-journey/rule-engine";
import {
  createMoodEntry,
  exportUserPayload,
  getAdminMetrics,
  getReview,
  listMoodEntriesByDate,
  resetStoreForTests,
  saveReview,
  setLexicon,
} from "@/lib/data-store";
import { PersistenceUnavailableError } from "@/lib/db/client";

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

  it("keeps in-memory flow for test env without database", async () => {
    await createMoodEntry({
      userId,
      occurredAt: `${date}T12:00:00.000Z`,
      score: 1,
      note: "lunch break",
      source: "web",
    });

    const entries = await listMoodEntriesByDate(userId, date);
    const payload = await exportUserPayload(userId);

    expect(entries).toHaveLength(1);
    expect(payload.entries).toHaveLength(1);
  });

  it("blocks persistence in production when DATABASE_URL is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");

    try {
      await expect(
        createMoodEntry({
          userId,
          occurredAt: `${date}T12:00:00.000Z`,
          score: 1,
          note: "should fail in production without db",
          source: "web",
        }),
      ).rejects.toBeInstanceOf(PersistenceUnavailableError);

      await expect(getAdminMetrics(date, 0)).rejects.toBeInstanceOf(PersistenceUnavailableError);
      await expect(exportUserPayload(userId)).rejects.toBeInstanceOf(PersistenceUnavailableError);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("computes admin today metrics with local timezone boundary", async () => {
    await createMoodEntry({
      userId,
      occurredAt: "2026-02-11T16:30:00.000Z",
      score: 1,
      note: "in local day window start",
      source: "web",
    });

    await createMoodEntry({
      userId,
      occurredAt: "2026-02-12T15:30:00.000Z",
      score: -1,
      note: "in local day window end",
      source: "web",
    });

    await createMoodEntry({
      userId,
      occurredAt: "2026-02-12T16:30:00.000Z",
      score: 0,
      note: "outside local day window",
      source: "web",
    });

    const metrics = await getAdminMetrics("2026-02-12", -480);
    expect(metrics.totalEntries).toBe(3);
    expect(metrics.todayEntries).toBe(2);
  });
});
