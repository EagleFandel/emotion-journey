import {
  and,
  eq,
  gte,
  sql,
} from "drizzle-orm";
import {
  type AdminMetrics,
  type DailyReview,
  type LexiconItem,
  type MoodEntry,
  type MoodScore,
} from "@emotion-journey/domain";
import { DEFAULT_LEXICON, DEFAULT_RISK_TERMS } from "@emotion-journey/config";
import { parseEmotion } from "@emotion-journey/rule-engine";
import { hasDatabaseUrl } from "./db/client";
import { appConfig, dailyReviews, moodEntries, users } from "./db/schema";
import { getDb } from "./db/client";

interface UserAccount {
  id: string;
  email: string;
  createdAt: string;
}

interface CreateEntryInput {
  userId: string;
  occurredAt: string;
  score: MoodScore;
  note: string;
  source: MoodEntry["source"];
}

interface UpdateEntryInput {
  occurredAt?: string;
  score?: MoodScore;
  note?: string;
}

interface StoreState {
  users: Map<string, UserAccount>;
  entries: Map<string, MoodEntry>;
  reviews: Map<string, DailyReview>;
  lexicon: LexiconItem[];
  riskTerms: string[];
}

const storeKey = "__emotion_journey_store__";

function buildInitialState(): StoreState {
  return {
    users: new Map<string, UserAccount>(),
    entries: new Map<string, MoodEntry>(),
    reviews: new Map<string, DailyReview>(),
    lexicon: structuredClone(DEFAULT_LEXICON),
    riskTerms: [...DEFAULT_RISK_TERMS],
  };
}

function getStore(): StoreState {
  const target = globalThis as typeof globalThis & { [storeKey]?: StoreState };
  if (!target[storeKey]) {
    target[storeKey] = buildInitialState();
  }
  return target[storeKey];
}

function reviewKey(userId: string, date: string): string {
  return `${userId}::${date}`;
}

function parseDate(value: string): Date {
  return new Date(value);
}

function inLastDays(isoDateTime: string, dayCount: number): boolean {
  const now = Date.now();
  const target = parseDate(isoDateTime).getTime();
  const windowMs = dayCount * 24 * 60 * 60 * 1000;
  return now - target <= windowMs;
}

function rowToMoodEntry(row: typeof moodEntries.$inferSelect): MoodEntry {
  return {
    id: row.id,
    userId: row.userId,
    occurredAt: row.occurredAt.toISOString(),
    score: row.score as MoodScore,
    note: row.note,
    tags: row.tags as MoodEntry["tags"],
    triggerKeys: row.triggerKeys as string[],
    source: row.source as MoodEntry["source"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function rowToDailyReview(row: typeof dailyReviews.$inferSelect): DailyReview {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date,
    peakEntryId: row.peakEntryId,
    valleyEntryId: row.valleyEntryId,
    dominantTags: row.dominantTags as DailyReview["dominantTags"],
    energyLoad: row.energyLoad,
    summaryText: row.summaryText,
    hasRiskSignal: row.hasRiskSignal,
    createdAt: row.createdAt.toISOString(),
  };
}

async function dbGetLexicon(): Promise<LexiconItem[]> {
  const db = getDb();
  const rows = await db.select().from(appConfig).where(eq(appConfig.key, "lexicon")).limit(1);
  const value = rows[0]?.value as { lexicon?: LexiconItem[] } | undefined;
  return value?.lexicon ?? structuredClone(DEFAULT_LEXICON);
}

async function dbGetRiskTerms(): Promise<string[]> {
  const db = getDb();
  const rows = await db.select().from(appConfig).where(eq(appConfig.key, "risk_terms")).limit(1);
  const value = rows[0]?.value as { riskTerms?: string[] } | undefined;
  return value?.riskTerms ?? [...DEFAULT_RISK_TERMS];
}

export async function upsertUserByEmail(email: string): Promise<UserAccount> {
  const normalized = email.trim().toLowerCase();

  if (!hasDatabaseUrl()) {
    const store = getStore();
    const existing = store.users.get(normalized);
    if (existing) {
      return existing;
    }
    const created: UserAccount = {
      id: normalized,
      email: normalized,
      createdAt: new Date().toISOString(),
    };
    store.users.set(created.id, created);
    return created;
  }

  const db = getDb();
  const existingRows = await db.select().from(users).where(eq(users.id, normalized)).limit(1);
  if (existingRows[0]) {
    return {
      id: existingRows[0].id,
      email: existingRows[0].email,
      createdAt: existingRows[0].createdAt.toISOString(),
    };
  }

  const inserted = await db
    .insert(users)
    .values({
      id: normalized,
      email: normalized,
    })
    .returning();

  const row = inserted[0]!;
  return {
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getUser(userId: string): Promise<UserAccount | null> {
  if (!hasDatabaseUrl()) {
    return getStore().users.get(userId) ?? null;
  }

  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createMoodEntry(input: CreateEntryInput): Promise<MoodEntry> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    const now = new Date().toISOString();
    const parsed = parseEmotion(input.note, input.score, {
      lexicon: store.lexicon,
      riskTerms: store.riskTerms,
    });
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      userId: input.userId,
      occurredAt: input.occurredAt,
      score: input.score,
      note: input.note,
      tags: parsed.tags,
      triggerKeys: parsed.triggerKeys,
      source: input.source,
      createdAt: now,
      updatedAt: now,
    };
    store.entries.set(entry.id, entry);
    return entry;
  }

  const db = getDb();
  const [lexicon, riskTerms] = await Promise.all([dbGetLexicon(), dbGetRiskTerms()]);
  const parsed = parseEmotion(input.note, input.score, { lexicon, riskTerms });

  const rows = await db
    .insert(moodEntries)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      occurredAt: new Date(input.occurredAt),
      score: input.score,
      note: input.note,
      tags: parsed.tags,
      triggerKeys: parsed.triggerKeys,
      source: input.source,
      updatedAt: new Date(),
    })
    .returning();

  return rowToMoodEntry(rows[0]!);
}

export async function listMoodEntriesByDate(userId: string, date: string): Promise<MoodEntry[]> {
  if (!hasDatabaseUrl()) {
    return Array.from(getStore().entries.values())
      .filter((entry) => entry.userId === userId && entry.occurredAt.startsWith(date))
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  const db = getDb();
  const from = new Date(`${date}T00:00:00.000Z`);
  const to = new Date(`${date}T23:59:59.999Z`);

  const rows = await db
    .select()
    .from(moodEntries)
    .where(and(eq(moodEntries.userId, userId), gte(moodEntries.occurredAt, from), sql`${moodEntries.occurredAt} <= ${to}`))
    .orderBy(moodEntries.occurredAt);

  return rows.map(rowToMoodEntry);
}

export async function listAllMoodEntries(userId: string): Promise<MoodEntry[]> {
  if (!hasDatabaseUrl()) {
    return Array.from(getStore().entries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.userId, userId))
    .orderBy(moodEntries.occurredAt);

  return rows.map(rowToMoodEntry);
}

export async function listMoodEntriesByRange(userId: string, range: "week" | "month"): Promise<MoodEntry[]> {
  if (!hasDatabaseUrl()) {
    const days = range === "week" ? 7 : 30;
    return Array.from(getStore().entries.values())
      .filter((entry) => entry.userId === userId && inLastDays(entry.occurredAt, days))
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  const db = getDb();
  const days = range === "week" ? 7 : 30;
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select()
    .from(moodEntries)
    .where(and(eq(moodEntries.userId, userId), gte(moodEntries.occurredAt, threshold)))
    .orderBy(moodEntries.occurredAt);

  return rows.map(rowToMoodEntry);
}

export async function updateMoodEntry(
  userId: string,
  entryId: string,
  patch: UpdateEntryInput,
): Promise<MoodEntry | null> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    const entry = store.entries.get(entryId);
    if (!entry || entry.userId !== userId) return null;

    const nextScore = patch.score ?? entry.score;
    const nextNote = patch.note ?? entry.note;
    const parsed = parseEmotion(nextNote, nextScore, {
      lexicon: store.lexicon,
      riskTerms: store.riskTerms,
    });

    const updated: MoodEntry = {
      ...entry,
      occurredAt: patch.occurredAt ?? entry.occurredAt,
      score: nextScore,
      note: nextNote,
      tags: parsed.tags,
      triggerKeys: parsed.triggerKeys,
      updatedAt: new Date().toISOString(),
    };

    store.entries.set(entryId, updated);
    return updated;
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(moodEntries)
    .where(and(eq(moodEntries.id, entryId), eq(moodEntries.userId, userId)))
    .limit(1);
  const existing = rows[0];
  if (!existing) return null;

  const [lexicon, riskTerms] = await Promise.all([dbGetLexicon(), dbGetRiskTerms()]);
  const nextScore = patch.score ?? (existing.score as MoodScore);
  const nextNote = patch.note ?? existing.note;
  const parsed = parseEmotion(nextNote, nextScore, { lexicon, riskTerms });

  const updatedRows = await db
    .update(moodEntries)
    .set({
      occurredAt: patch.occurredAt ? new Date(patch.occurredAt) : existing.occurredAt,
      score: nextScore,
      note: nextNote,
      tags: parsed.tags,
      triggerKeys: parsed.triggerKeys,
      updatedAt: new Date(),
    })
    .where(and(eq(moodEntries.id, entryId), eq(moodEntries.userId, userId)))
    .returning();

  const updated = updatedRows[0];
  return updated ? rowToMoodEntry(updated) : null;
}

export async function removeMoodEntry(userId: string, entryId: string): Promise<boolean> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    const entry = store.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      return false;
    }
    return store.entries.delete(entryId);
  }

  const db = getDb();
  const rows = await db
    .delete(moodEntries)
    .where(and(eq(moodEntries.id, entryId), eq(moodEntries.userId, userId)))
    .returning({ id: moodEntries.id });

  return rows.length > 0;
}

export async function saveReview(review: DailyReview): Promise<DailyReview> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    store.reviews.set(reviewKey(review.userId, review.date), review);
    return review;
  }

  const db = getDb();
  const rows = await db
    .insert(dailyReviews)
    .values({
      id: review.id,
      userId: review.userId,
      date: review.date,
      peakEntryId: review.peakEntryId,
      valleyEntryId: review.valleyEntryId,
      dominantTags: review.dominantTags,
      energyLoad: review.energyLoad,
      summaryText: review.summaryText,
      hasRiskSignal: review.hasRiskSignal,
    })
    .onConflictDoUpdate({
      target: [dailyReviews.userId, dailyReviews.date],
      set: {
        peakEntryId: review.peakEntryId,
        valleyEntryId: review.valleyEntryId,
        dominantTags: review.dominantTags,
        energyLoad: review.energyLoad,
        summaryText: review.summaryText,
        hasRiskSignal: review.hasRiskSignal,
        createdAt: new Date(),
      },
    })
    .returning();

  return rowToDailyReview(rows[0]!);
}

export async function getReview(userId: string, date: string): Promise<DailyReview | null> {
  if (!hasDatabaseUrl()) {
    return getStore().reviews.get(reviewKey(userId, date)) ?? null;
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(dailyReviews)
    .where(and(eq(dailyReviews.userId, userId), eq(dailyReviews.date, date)))
    .limit(1);

  return rows[0] ? rowToDailyReview(rows[0]) : null;
}

export async function getLexicon(): Promise<LexiconItem[]> {
  if (!hasDatabaseUrl()) {
    return structuredClone(getStore().lexicon);
  }
  return dbGetLexicon();
}

export async function setLexicon(lexicon: LexiconItem[]): Promise<LexiconItem[]> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    store.lexicon = structuredClone(lexicon);
    return structuredClone(store.lexicon);
  }

  const db = getDb();
  await db
    .insert(appConfig)
    .values({
      key: "lexicon",
      value: { lexicon },
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appConfig.key,
      set: {
        value: { lexicon },
        updatedAt: new Date(),
      },
    });

  return lexicon;
}

export async function getRiskTerms(): Promise<string[]> {
  if (!hasDatabaseUrl()) {
    return [...getStore().riskTerms];
  }
  return dbGetRiskTerms();
}

export async function setRiskTerms(riskTerms: string[]): Promise<string[]> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    store.riskTerms = [...riskTerms];
    return [...store.riskTerms];
  }

  const db = getDb();
  await db
    .insert(appConfig)
    .values({
      key: "risk_terms",
      value: { riskTerms },
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appConfig.key,
      set: {
        value: { riskTerms },
        updatedAt: new Date(),
      },
    });

  return riskTerms;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = Array.from(store.entries.values()).filter((entry) =>
      entry.occurredAt.startsWith(today),
    );
    const riskSignalsToday = todayEntries.filter((entry) =>
      parseEmotion(entry.note, entry.score, {
        lexicon: store.lexicon,
        riskTerms: store.riskTerms,
      }).hasRiskSignal,
    ).length;

    return {
      totalUsers: store.users.size,
      totalEntries: store.entries.size,
      todayEntries: todayEntries.length,
      reviewsGenerated: store.reviews.size,
      riskSignalsToday,
    };
  }

  const db = getDb();
  const [userRows, entryRows, reviewRows, todayRows] = await Promise.all([
    db.select().from(users),
    db.select().from(moodEntries),
    db.select().from(dailyReviews),
    db
      .select()
      .from(moodEntries)
      .where(gte(moodEntries.occurredAt, new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"))),
  ]);

  const [lexicon, riskTerms] = await Promise.all([dbGetLexicon(), dbGetRiskTerms()]);
  const riskSignalsToday = todayRows.filter((row) =>
    parseEmotion(row.note, row.score as MoodScore, { lexicon, riskTerms }).hasRiskSignal,
  ).length;

  return {
    totalUsers: userRows.length,
    totalEntries: entryRows.length,
    todayEntries: todayRows.length,
    reviewsGenerated: reviewRows.length,
    riskSignalsToday,
  };
}

export async function exportUserPayload(userId: string) {
  const user = await getUser(userId);
  const entries = await listAllMoodEntries(userId);

  if (!hasDatabaseUrl()) {
    const reviews = Array.from(getStore().reviews.values()).filter((review) => review.userId === userId);
    return {
      user,
      entries,
      reviews,
      exportedAt: new Date().toISOString(),
    };
  }

  const db = getDb();
  const rows = await db.select().from(dailyReviews).where(eq(dailyReviews.userId, userId));

  return {
    user,
    entries,
    reviews: rows.map(rowToDailyReview),
    exportedAt: new Date().toISOString(),
  };
}

export async function deleteUserCompletely(userId: string): Promise<void> {
  if (!hasDatabaseUrl()) {
    const store = getStore();
    store.users.delete(userId);
    for (const [id, entry] of store.entries.entries()) {
      if (entry.userId === userId) {
        store.entries.delete(id);
      }
    }
    for (const [id, review] of store.reviews.entries()) {
      if (review.userId === userId) {
        store.reviews.delete(id);
      }
    }
    return;
  }

  const db = getDb();
  await db.delete(users).where(eq(users.id, userId));
}

export async function resetStoreForTests(): Promise<void> {
  if (hasDatabaseUrl()) {
    const db = getDb();
    await db.delete(appConfig);
    await db.delete(dailyReviews);
    await db.delete(moodEntries);
    await db.delete(users);
    return;
  }

  const target = globalThis as typeof globalThis & { [storeKey]?: StoreState };
  target[storeKey] = buildInitialState();
}