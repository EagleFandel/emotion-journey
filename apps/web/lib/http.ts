import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, init);
}

export function fail(message: string, status = 400): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized(): NextResponse<{ error: string }> {
  return fail("未登录或会话已过期", 401);
}
