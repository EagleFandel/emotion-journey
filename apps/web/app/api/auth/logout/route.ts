import { clearUserCookie } from "@/lib/auth";
import { ok } from "@/lib/http";

export async function POST() {
  await clearUserCookie();
  return ok({ loggedOut: true });
}
