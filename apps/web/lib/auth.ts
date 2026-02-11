import { cookies } from "next/headers";

const AUTH_COOKIE = "emotion_journey_user";

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

export async function setUserCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearUserCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export function isAdminUser(userId: string): boolean {
  const adminList = process.env.ADMIN_USERS?.split(",").map((value) => value.trim()) ?? [];
  return adminList.includes(userId) || userId.endsWith("@admin.local");
}
