"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminMetrics, AdminUserSummary, LexiconItem, MoodEntry } from "@emotion-journey/domain";
import { scoreLabel } from "@emotion-journey/ui";
import { MoodCurveChart } from "@/components/mood-curve-chart";
import { getTodayKey, getTimezoneOffsetMinutes } from "@/lib/date";
import { getErrorMessage } from "@/lib/api-client";

function formatLocalDateTime(isoDateTime: string | null): string {
  if (!isoDateTime) return "暂无";
  return new Date(isoDateTime).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatLocalTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function parseListCount(text: string, key: string): number | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const value = parsed[key];
    return Array.isArray(value) ? value.length : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [lexiconText, setLexiconText] = useState("");
  const [riskText, setRiskText] = useState("");
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [journeyEntries, setJourneyEntries] = useState<MoodEntry[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [journeyStatus, setJourneyStatus] = useState<string | null>(null);
  const lexiconCount = parseListCount(lexiconText, "lexicon");
  const riskTermCount = parseListCount(riskText, "riskTerms");

  async function load() {
    const metricsParams = new URLSearchParams({
      date: getTodayKey(),
      tzOffsetMinutes: String(getTimezoneOffsetMinutes()),
    });

    const [metricsResponse, lexiconResponse, riskResponse, usersResponse] = await Promise.all([
      fetch(`/api/admin/metrics?${metricsParams.toString()}`),
      fetch("/api/admin/lexicon"),
      fetch("/api/admin/risk-terms"),
      fetch("/api/admin/users"),
    ]);

    if (!metricsResponse.ok) {
      const payload = (await metricsResponse.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "你没有后台权限，请将账号加入 ADMIN_USERS 环境变量。");
      setMetrics(null);
      return;
    }

    if (!lexiconResponse.ok || !riskResponse.ok || !usersResponse.ok) {
      setStatus("后台配置加载失败，请稍后重试。");
      setMetrics(null);
      return;
    }

    const metricsPayload = (await metricsResponse.json()) as { data: AdminMetrics };
    const lexiconPayload = (await lexiconResponse.json()) as { data: LexiconItem[] };
    const riskPayload = (await riskResponse.json()) as { data: string[] };
    const usersPayload = (await usersResponse.json()) as { data: AdminUserSummary[] };

    setMetrics(metricsPayload.data);
    setLexiconText(JSON.stringify({ lexicon: lexiconPayload.data }, null, 2));
    setRiskText(JSON.stringify({ riskTerms: riskPayload.data }, null, 2));
    setUsers(usersPayload.data);
    setSelectedUserId((current) => {
      if (current && usersPayload.data.some((user) => user.id === current)) {
        return current;
      }
      return usersPayload.data[0]?.id ?? "";
    });
  }

  const loadJourneyEntries = useCallback(async (userId: string, date: string) => {
    setJourneyLoading(true);
    setJourneyStatus(null);

    try {
      const params = new URLSearchParams({
        date,
        tzOffsetMinutes: String(getTimezoneOffsetMinutes()),
      });
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/mood-entries?${params.toString()}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setJourneyEntries([]);
        setJourneyStatus(payload?.error ?? "用户情绪旅程数据加载失败。");
        return;
      }

      const payload = (await response.json()) as { data: MoodEntry[] };
      setJourneyEntries(payload.data);
    } catch (error) {
      setJourneyEntries([]);
      setJourneyStatus(getErrorMessage(error));
    } finally {
      setJourneyLoading(false);
    }
  }, []);

  async function refreshJourney() {
    if (!selectedUserId) return;
    await loadJourneyEntries(selectedUserId, selectedDate);
  }

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (err) {
        setStatus(getErrorMessage(err));
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setJourneyEntries([]);
      setJourneyStatus(null);
      return;
    }
    void loadJourneyEntries(selectedUserId, selectedDate);
  }, [selectedUserId, selectedDate, loadJourneyEntries]);

  async function saveLexicon() {
    let payload: unknown;
    try {
      payload = JSON.parse(lexiconText);
    } catch {
      setStatus("词典 JSON 解析失败，请检查格式是否为 {\"lexicon\": [...]}。");
      return;
    }
    if (!payload || !Array.isArray((payload as { lexicon?: unknown }).lexicon)) {
      setStatus("词典格式错误，必须包含 lexicon 数组。");
      return;
    }

    const response = await fetch("/api/admin/lexicon", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(response.ok ? "词典已更新" : "词典更新失败");
  }

  async function saveRiskTerms() {
    let payload: unknown;
    try {
      payload = JSON.parse(riskText);
    } catch {
      setStatus("风险词 JSON 解析失败，请检查格式是否为 {\"riskTerms\": [...]}。");
      return;
    }
    if (!payload || !Array.isArray((payload as { riskTerms?: unknown }).riskTerms)) {
      setStatus("风险词格式错误，必须包含 riskTerms 数组。");
      return;
    }

    const response = await fetch("/api/admin/risk-terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(response.ok ? "风险词已更新" : "风险词更新失败");
  }

  return (
    <main className="page-container space-y-4">
      <h1 className="section-title">轻量后台</h1>

      {metrics ? (
        <section className="grid gap-3 md:grid-cols-5">
          <MetricCard label="总用户" value={metrics.totalUsers} />
          <MetricCard label="总记录" value={metrics.totalEntries} />
          <MetricCard label="今日记录" value={metrics.todayEntries} />
          <MetricCard label="复盘总数" value={metrics.reviewsGenerated} />
          <MetricCard label="今日风险信号" value={metrics.riskSignalsToday} />
        </section>
      ) : (
        <div className="paper-card p-4 text-sm text-stone-600">加载后台数据中...</div>
      )}

      <section className="paper-card space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">用户日情绪旅程图</h2>
          <p className="text-xs text-stone-500">按用户与日期查看情绪曲线、标签与触发词。</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-stone-700">用户</span>
            <select
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              {users.length === 0 ? <option value="">暂无用户</option> : null}
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}（{user.entryCount} 条）
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-stone-700">日期</span>
            <input
              type="date"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => void refreshJourney()}
              disabled={!selectedUserId || journeyLoading}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {journeyLoading ? "查询中..." : "刷新查询"}
            </button>
          </div>
        </div>

        {selectedUserId ? (
          <>
            {journeyLoading ? (
              <div className="paper-card h-80 animate-pulse" />
            ) : (
              <MoodCurveChart entries={journeyEntries} emptyText="该用户当天暂无情绪记录" />
            )}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
              <p>
                当前用户：{selectedUserId}，当日记录 {journeyEntries.length} 条，最近一次记录：
                {formatLocalDateTime(
                  journeyEntries.length > 0 ? journeyEntries[journeyEntries.length - 1]?.occurredAt ?? null : null,
                )}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">当日记录明细</h3>
              {journeyEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 p-3 text-sm text-stone-500">
                  该用户当天暂无记录。
                </div>
              ) : (
                <ul className="max-h-56 space-y-2 overflow-auto">
                  {journeyEntries.map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
                      <p className="text-stone-700">
                        {formatLocalTime(entry.occurredAt)} · {entry.score}（{scoreLabel(entry.score)}）
                      </p>
                      <p className="text-stone-800">{entry.note || "（无备注）"}</p>
                      <p className="text-xs text-stone-500">
                        标签：{entry.tags.join("、") || "无"} ｜触发词：{entry.triggerKeys.join("、") || "无"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 p-3 text-sm text-stone-500">
            暂无可查询用户。请先让用户登录并产生情绪记录。
          </div>
        )}

        {journeyStatus ? <p className="text-sm text-stone-700">{journeyStatus}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="paper-card space-y-2 p-4">
          <h2 className="text-lg font-semibold">词典配置</h2>
          <p className="text-xs text-stone-500">
            当前词典条目：{lexiconCount ?? "JSON 格式错误"}，格式要求：{"{"}"lexicon": [ ... ]{"}"}
          </p>
          <textarea
            className="min-h-64 w-full rounded-xl border border-stone-300 bg-white p-3 text-sm"
            value={lexiconText}
            onChange={(event) => setLexiconText(event.target.value)}
          />
          <button
            type="button"
            onClick={() => void saveLexicon()}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
          >
            保存词典
          </button>
        </div>

        <div className="paper-card space-y-2 p-4">
          <h2 className="text-lg font-semibold">风险词配置</h2>
          <p className="text-xs text-stone-500">
            当前风险词条目：{riskTermCount ?? "JSON 格式错误"}，格式要求：{"{"}"riskTerms": [ ... ]{"}"}
          </p>
          <textarea
            className="min-h-64 w-full rounded-xl border border-stone-300 bg-white p-3 text-sm"
            value={riskText}
            onChange={(event) => setRiskText(event.target.value)}
          />
          <button
            type="button"
            onClick={() => void saveRiskTerms()}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
          >
            保存风险词
          </button>
        </div>
      </section>

      {status ? <p className="text-sm text-stone-700">{status}</p> : null}
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="paper-card p-4 text-center">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </article>
  );
}
