import { getCurrentUserId } from "@/lib/auth";
import { exportUserPayload } from "@/lib/data-store";
import { unauthorized } from "@/lib/http";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const payload = await exportUserPayload(userId);
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename=emotion-journey-export-${userId}.json`,
    },
  });
}