import { NextRequest } from "next/server";
import { toMoodScore } from "@emotion-journey/domain";
import { createMoodEntry, listMoodEntriesByDate } from "@/lib/data-store";
import { fail, ok, unauthorized } from "@/lib/http";
import { getCurrentUserId } from "@/lib/auth";
import { dailyDateWithTimezoneSchema, moodEntryCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const date = request.nextUrl.searchParams.get("date") ?? "";
  const tzOffsetMinutes = request.nextUrl.searchParams.get("tzOffsetMinutes") ?? "0";
  const parsed = dailyDateWithTimezoneSchema.safeParse({ date, tzOffsetMinutes });
  if (!parsed.success) {
    return fail("date 参数格式错误，应为 YYYY-MM-DD", 422);
  }

  const entries = await listMoodEntriesByDate(
    userId,
    parsed.data.date,
    parsed.data.tzOffsetMinutes,
  );
  return ok(entries);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await request.json();
  const parsed = moodEntryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return fail("请求参数不合法", 422);
  }

  const entry = await createMoodEntry({
    userId,
    occurredAt: parsed.data.occurredAt,
    score: toMoodScore(parsed.data.score),
    note: parsed.data.note,
    source: parsed.data.source,
  });

  return ok(entry, { status: 201 });
}
