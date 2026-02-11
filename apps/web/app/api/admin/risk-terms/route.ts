import { getCurrentUserId, isAdminUser } from "@/lib/auth";
import { getRiskTerms, setRiskTerms } from "@/lib/data-store";
import { fail, ok, unauthorized } from "@/lib/http";
import { riskTermsPutSchema } from "@/lib/validation";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  if (!isAdminUser(userId)) return fail("无后台权限", 403);

  const riskTerms = await getRiskTerms();
  return ok(riskTerms);
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  if (!isAdminUser(userId)) return fail("无后台权限", 403);

  const body = await request.json();
  const parsed = riskTermsPutSchema.safeParse(body);
  if (!parsed.success) return fail("风险词格式错误", 422);

  const updated = await setRiskTerms(parsed.data.riskTerms);
  return ok(updated);
}