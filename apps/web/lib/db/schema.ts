import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { LexiconItem, MoodTag } from "@emotion-journey/domain";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const moodEntries = pgTable(
  "mood_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    score: integer("score").notNull(),
    note: text("note").notNull().default(""),
    tags: jsonb("tags").$type<MoodTag[]>().notNull().default([]),
    triggerKeys: jsonb("trigger_keys").$type<string[]>().notNull().default([]),
    source: text("source").notNull().default("web"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("mood_entries_user_idx").on(table.userId),
    index("mood_entries_occurred_idx").on(table.occurredAt),
  ],
);

export const dailyReviews = pgTable(
  "daily_reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    peakEntryId: text("peak_entry_id"),
    valleyEntryId: text("valley_entry_id"),
    dominantTags: jsonb("dominant_tags").$type<MoodTag[]>().notNull().default([]),
    energyLoad: real("energy_load").notNull().default(0),
    summaryText: text("summary_text").notNull(),
    hasRiskSignal: boolean("has_risk_signal").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("daily_reviews_user_date_unique").on(table.userId, table.date)],
);

export const appConfig = pgTable("app_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LexiconConfigRow = { lexicon: LexiconItem[] };
export type RiskTermsConfigRow = { riskTerms: string[] };