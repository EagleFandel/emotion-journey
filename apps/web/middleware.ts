import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PAGE_PREFIXES = ["/today", "/review", "/insights", "/settings", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = request.cookies.get("emotion_journey_user")?.value;

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtectedPage && !user) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/today/:path*", "/review/:path*", "/insights/:path*", "/settings/:path*", "/dashboard/:path*"],
};
