import { getCurrentUserId, isAdminUser } from "@/lib/auth";
import { getAdminMetrics } from "@/lib/data-store";
import { fail, ok, unauthorized } from "@/lib/http";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  if (!isAdminUser(userId)) return fail("无后台权限", 403);

  const metrics = await getAdminMetrics();
  return ok(metrics);
}