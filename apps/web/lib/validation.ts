import { z } from "zod";

const moodTagEnum = z.enum([
  "焦虑",
  "成就感",
  "空虚",
  "紧绷",
  "开心",
  "平静",
  "疲惫",
  "沮丧",
]);

export const moodEntryCreateSchema = z.object({
  occurredAt: z.string().datetime(),
  score: z.number().int().min(-5).max(5),
  note: z.string().max(280).default(""),
  source: z.enum(["web", "offline_queue"]).default("web"),
});

export const moodEntryUpdateSchema = z.object({
  occurredAt: z.string().datetime().optional(),
  score: z.number().int().min(-5).max(5).optional(),
  note: z.string().max(280).optional(),
});

export const dailyDateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const dailyDateWithTimezoneSchema = dailyDateQuerySchema.extend({
  tzOffsetMinutes: z.coerce.number().int().min(-840).max(840).default(0),
});

export const rangeQuerySchema = z.object({
  range: z.enum(["week", "month"]).default("week"),
});

export const lexiconPutSchema = z.object({
  lexicon: z.array(
    z.object({
      keyword: z.string().min(1),
      tags: z.array(moodTagEnum).min(1),
      triggerKey: z.string().min(1),
      scoreBias: z.number().int().min(-5).max(5).optional(),
    }),
  ),
});

export const riskTermsPutSchema = z.object({
  riskTerms: z.array(z.string().min(1)).min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
});
