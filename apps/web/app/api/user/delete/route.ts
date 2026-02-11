import { clearUserCookie, getCurrentUserId } from "@/lib/auth";
import { deleteUserCompletely } from "@/lib/data-store";
import { ok, unauthorized } from "@/lib/http";

export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  await deleteUserCompletely(userId);
  await clearUserCookie();
  return ok({ deleted: true });
}