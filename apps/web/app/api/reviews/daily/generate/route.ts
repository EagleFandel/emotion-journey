import { NextRequest } from "next/server";
import { generateDailyReview } from "@emotion-journey/rule-engine";
import { getCurrentUserId } from "@/lib/auth";
import { fail, ok, unauthorized } from "@/lib/http";
import { listMoodEntriesByDate, saveReview } from "@/lib/data-store";
import { dailyDateQuerySchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await request.json();
  const parsed = dailyDateQuerySchema.safeParse({ date: body?.date });
  if (!parsed.success) {
    return fail("date 参数格式错误，应为 YYYY-MM-DD", 422);
  }

  const entries = await listMoodEntriesByDate(userId, parsed.data.date);
  const result = generateDailyReview(userId, parsed.data.date, entries);
  const review = await saveReview(result.review);

  return ok({
    ...review,
    warnings: result.warnings,
  });
}