import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PersistenceUnavailableError } from "@/lib/db/client";

const authMock = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  isAdminUser: vi.fn(),
}));

const storeMock = vi.hoisted(() => ({
  getAdminMetrics: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUserId: authMock.getCurrentUserId,
  isAdminUser: authMock.isAdminUser,
}));

vi.mock("@/lib/data-store", () => ({
  getAdminMetrics: storeMock.getAdminMetrics,
}));

import { GET } from "@/app/api/admin/metrics/route";

describe("admin metrics route", () => {
  beforeEach(() => {
    authMock.getCurrentUserId.mockReset();
    authMock.isAdminUser.mockReset();
    storeMock.getAdminMetrics.mockReset();

    authMock.getCurrentUserId.mockResolvedValue("admin@example.com");
    authMock.isAdminUser.mockReturnValue(true);
    storeMock.getAdminMetrics.mockResolvedValue({
      totalUsers: 1,
      totalEntries: 2,
      todayEntries: 1,
      reviewsGenerated: 0,
      riskSignalsToday: 0,
    });
  });

  it("accepts date and timezone query parameters", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/admin/metrics?date=2026-02-12&tzOffsetMinutes=-480",
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(storeMock.getAdminMetrics).toHaveBeenCalledWith("2026-02-12", -480);
  });

  it("returns 503 with code when persistence is unavailable", async () => {
    storeMock.getAdminMetrics.mockRejectedValue(new PersistenceUnavailableError());
    const request = new NextRequest(
      "http://localhost:3000/api/admin/metrics?date=2026-02-12&tzOffsetMinutes=-480",
    );

    const response = await GET(request);
    const payload = (await response.json()) as { error: string; code?: string };

    expect(response.status).toBe(503);
    expect(payload.code).toBe("PERSISTENCE_UNAVAILABLE");
  });
});
