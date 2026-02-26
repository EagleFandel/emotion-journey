import { getCurrentUserId, isAdminUser } from "@/lib/auth";
import { listAdminUsers } from "@/lib/data-store";
import { fail, mapApiError, ok, unauthorized } from "@/lib/http";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();
    if (!isAdminUser(userId)) return fail("无后台权限", 403);

    const users = await listAdminUsers();
    return ok(users);
  } catch (error) {
    return mapApiError(error);
  }
}
