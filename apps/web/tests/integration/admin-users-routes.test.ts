import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  isAdminUser: vi.fn(),
}));

const storeMock = vi.hoisted(() => ({
  listAdminUsers: vi.fn(),
  listMoodEntriesByDate: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUserId: authMock.getCurrentUserId,
  isAdminUser: authMock.isAdminUser,
}));

vi.mock("@/lib/data-store", () => ({
  listAdminUsers: storeMock.listAdminUsers,
  listMoodEntriesByDate: storeMock.listMoodEntriesByDate,
}));

import { GET as getAdminUsers } from "@/app/api/admin/users/route";
import { GET as getAdminUserMoodEntries } from "@/app/api/admin/users/[userId]/mood-entries/route";

describe("admin users routes", () => {
  beforeEach(() => {
    authMock.getCurrentUserId.mockReset();
    authMock.isAdminUser.mockReset();
    storeMock.listAdminUsers.mockReset();
    storeMock.listMoodEntriesByDate.mockReset();

    authMock.getCurrentUserId.mockResolvedValue("admin@example.com");
    authMock.isAdminUser.mockReturnValue(true);
  });

  it("returns admin user summaries", async () => {
    storeMock.listAdminUsers.mockResolvedValue([
      {
        id: "u1@example.com",
        email: "u1@example.com",
        createdAt: "2026-02-12T00:00:00.000Z",
        entryCount: 3,
        lastEntryAt: "2026-02-12T10:00:00.000Z",
      },
    ]);

    const response = await getAdminUsers();
    const payload = (await response.json()) as { data: Array<{ id: string }> };

    expect(response.status).toBe(200);
    expect(payload.data[0]?.id).toBe("u1@example.com");
    expect(storeMock.listAdminUsers).toHaveBeenCalledTimes(1);
  });

  it("returns selected user's daily mood entries", async () => {
    storeMock.listMoodEntriesByDate.mockResolvedValue([
      {
        id: "e1",
        userId: "u1@example.com",
        occurredAt: "2026-02-12T09:00:00.000Z",
        score: 1,
        note: "ok",
        tags: ["平静"],
        triggerKeys: ["工作任务"],
        source: "web",
        createdAt: "2026-02-12T09:00:00.000Z",
        updatedAt: "2026-02-12T09:00:00.000Z",
      },
    ]);

    const request = new NextRequest(
      "http://localhost:3000/api/admin/users/u1%40example.com/mood-entries?date=2026-02-12&tzOffsetMinutes=-480",
    );
    const response = await getAdminUserMoodEntries(request, {
      params: Promise.resolve({ userId: "u1@example.com" }),
    });

    expect(response.status).toBe(200);
    expect(storeMock.listMoodEntriesByDate).toHaveBeenCalledWith("u1@example.com", "2026-02-12", -480);
  });

  it("validates date query for admin user mood entries", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/admin/users/u1%40example.com/mood-entries?date=2026/02/12&tzOffsetMinutes=0",
    );
    const response = await getAdminUserMoodEntries(request, {
      params: Promise.resolve({ userId: "u1@example.com" }),
    });

    expect(response.status).toBe(422);
    expect(storeMock.listMoodEntriesByDate).not.toHaveBeenCalled();
  });
});
