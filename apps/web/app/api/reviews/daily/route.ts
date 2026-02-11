import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getReview } from "@/lib/data-store";
import { dailyDateQuerySchema } from "@/lib/validation";
import { fail, ok, unauthorized } from "@/lib/http";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const date = request.nextUrl.searchParams.get("date") ?? "";
  const parsed = dailyDateQuerySchema.safeParse({ date });
  if (!parsed.success) {
    return fail("date 参数格式错误，应为 YYYY-MM-DD", 422);
  }

  const review = await getReview(userId, parsed.data.date);
  return ok(review);
}