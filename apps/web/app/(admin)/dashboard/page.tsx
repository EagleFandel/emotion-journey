"use client";

import { useEffect, useState } from "react";
import type { AdminMetrics, LexiconItem } from "@emotion-journey/domain";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [lexiconText, setLexiconText] = useState("");
  const [riskText, setRiskText] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    const [metricsResponse, lexiconResponse, riskResponse] = await Promise.all([
      fetch("/api/admin/metrics"),
      fetch("/api/admin/lexicon"),
      fetch("/api/admin/risk-terms"),
    ]);

    if (!metricsResponse.ok) {
      setStatus("你没有后台权限，请将账号加入 ADMIN_USERS 环境变量。");
      return;
    }

    const metricsPayload = (await metricsResponse.json()) as { data: AdminMetrics };
    const lexiconPayload = (await lexiconResponse.json()) as { data: LexiconItem[] };
    const riskPayload = (await riskResponse.json()) as { data: string[] };

    setMetrics(metricsPayload.data);
    setLexiconText(JSON.stringify({ lexicon: lexiconPayload.data }, null, 2));
    setRiskText(JSON.stringify({ riskTerms: riskPayload.data }, null, 2));
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        if (cancelled) return;
        await load();
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  async function saveLexicon() {
    const response = await fetch("/api/admin/lexicon", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: lexiconText,
    });
    setStatus(response.ok ? "词典已更新" : "词典更新失败");
  }

  async function saveRiskTerms() {
    const response = await fetch("/api/admin/risk-terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: riskText,
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="paper-card space-y-2 p-4">
          <h2 className="text-lg font-semibold">词典配置</h2>
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