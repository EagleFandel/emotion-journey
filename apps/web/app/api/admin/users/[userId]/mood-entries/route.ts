import { NextRequest } from "next/server";
import { getCurrentUserId, isAdminUser } from "@/lib/auth";
import { listMoodEntriesByDate } from "@/lib/data-store";
import { fail, mapApiError, ok, unauthorized } from "@/lib/http";
import { dailyDateWithTimezoneSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const adminId = await getCurrentUserId();
    if (!adminId) return unauthorized();
    if (!isAdminUser(adminId)) return fail("无后台权限", 403);

    const { userId } = await context.params;
    if (!userId) {
      return fail("userId 不能为空", 422);
    }

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
  } catch (error) {
    return mapApiError(error);
  }
}
