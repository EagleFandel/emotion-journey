import { NextRequest } from "next/server";
import { computeTrends } from "@emotion-journey/analytics";
import { getCurrentUserId } from "@/lib/auth";
import { listMoodEntriesByRange } from "@/lib/data-store";
import { fail, ok, unauthorized } from "@/lib/http";
import { rangeQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const parsed = rangeQuerySchema.safeParse({
    range: request.nextUrl.searchParams.get("range") ?? "week",
  });
  if (!parsed.success) return fail("range 参数错误", 422);

  const entries = await listMoodEntriesByRange(userId, parsed.data.range);
  return ok(computeTrends(entries, parsed.data.range));
}