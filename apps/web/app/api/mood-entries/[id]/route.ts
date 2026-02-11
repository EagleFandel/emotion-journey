import { NextRequest } from "next/server";
import { toMoodScore } from "@emotion-journey/domain";
import { getCurrentUserId } from "@/lib/auth";
import { fail, ok, unauthorized } from "@/lib/http";
import { removeMoodEntry, updateMoodEntry } from "@/lib/data-store";
import { moodEntryUpdateSchema } from "@/lib/validation";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const body = await request.json();
  const parsed = moodEntryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return fail("请求参数不合法", 422);
  }

  const patch: {
    occurredAt?: string;
    score?: ReturnType<typeof toMoodScore>;
    note?: string;
  } = {};

  if (parsed.data.occurredAt !== undefined) {
    patch.occurredAt = parsed.data.occurredAt;
  }
  if (parsed.data.score !== undefined) {
    patch.score = toMoodScore(parsed.data.score);
  }
  if (parsed.data.note !== undefined) {
    patch.note = parsed.data.note;
  }

  const updated = await updateMoodEntry(userId, id, patch);

  if (!updated) {
    return fail("记录不存在", 404);
  }

  return ok(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const deleted = await removeMoodEntry(userId, id);
  if (!deleted) {
    return fail("记录不存在", 404);
  }

  return ok({ deleted: true });
}