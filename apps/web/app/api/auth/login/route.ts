import { upsertUserByEmail } from "@/lib/data-store";
import { setUserCookie } from "@/lib/auth";
import { fail, mapApiError, ok } from "@/lib/http";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail("请输入有效邮箱", 422);
    }

    const user = await upsertUserByEmail(parsed.data.email);
    await setUserCookie(user.id);

    return ok({ userId: user.id });
  } catch (error) {
    return mapApiError(error);
  }
}
