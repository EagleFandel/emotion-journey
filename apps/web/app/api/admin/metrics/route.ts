import { NextRequest } from "next/server";
import { getCurrentUserId, isAdminUser } from "@/lib/auth";
import { getAdminMetrics } from "@/lib/data-store";
import { fail, mapApiError, ok, unauthorized } from "@/lib/http";
import { adminMetricsQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();
    if (!isAdminUser(userId)) return fail("无后台权限", 403);

    const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const tzOffsetMinutes = request.nextUrl.searchParams.get("tzOffsetMinutes") ?? "0";
    const parsed = adminMetricsQuerySchema.safeParse({
      date,
      tzOffsetMinutes,
    });
    if (!parsed.success || !parsed.data.date) {
      return fail("date 参数格式错误，应为 YYYY-MM-DD", 422);
    }

    const metrics = await getAdminMetrics(parsed.data.date, parsed.data.tzOffsetMinutes);
    return ok(metrics);
  } catch (error) {
    return mapApiError(error);
  }
}
