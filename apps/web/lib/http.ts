import { NextResponse } from "next/server";
import { PersistenceUnavailableError } from "@/lib/db/client";

export interface ErrorResponseBody {
  error: string;
  code?: string;
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, init);
}

export function fail(message: string, status = 400, code?: string): NextResponse<ErrorResponseBody> {
  return NextResponse.json(code ? { error: message, code } : { error: message }, { status });
}

export function unauthorized(): NextResponse<ErrorResponseBody> {
  return fail("未登录或会话已过期", 401);
}

export function mapApiError(error: unknown): NextResponse<ErrorResponseBody> {
  if (error instanceof PersistenceUnavailableError) {
    return fail("数据库不可用，请检查部署配置。", 503, error.code);
  }

  console.error(error);
  return fail("服务器内部错误", 500);
}
