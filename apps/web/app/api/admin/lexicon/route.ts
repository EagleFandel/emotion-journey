import { getCurrentUserId, isAdminUser } from "@/lib/auth";
import { getLexicon, setLexicon } from "@/lib/data-store";
import { fail, mapApiError, ok, unauthorized } from "@/lib/http";
import { lexiconPutSchema } from "@/lib/validation";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();
    if (!isAdminUser(userId)) return fail("无后台权限", 403);

    const lexicon = await getLexicon();
    return ok(lexicon);
  } catch (error) {
    return mapApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();
    if (!isAdminUser(userId)) return fail("无后台权限", 403);

    const body = await request.json();
    const parsed = lexiconPutSchema.safeParse(body);
    if (!parsed.success) return fail("词典格式错误", 422);

    const updated = await setLexicon(parsed.data.lexicon);
    return ok(updated);
  } catch (error) {
    return mapApiError(error);
  }
}
