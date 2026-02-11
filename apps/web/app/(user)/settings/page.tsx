"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function handleExport() {
    const response = await fetch("/api/user/export");
    if (!response.ok) {
      setStatus("导出失败");
      return;
    }
    const text = await response.text();
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "emotion-journey-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("已导出数据");
  }

  async function handleDelete() {
    const confirmed = window.confirm("确认删除账号与全部数据？此操作不可撤销。");
    if (!confirmed) return;

    const response = await fetch("/api/user/delete", { method: "DELETE" });
    if (!response.ok) {
      setStatus("删除失败");
      return;
    }

    setStatus("账号已删除");
    router.push("/landing");
    router.refresh();
  }

  return (
    <main className="page-container space-y-4">
      <h1 className="section-title">设置与隐私</h1>

      <section className="paper-card space-y-3 p-4">
        <h2 className="text-lg font-semibold">隐私能力</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            className="rounded-full border border-stone-400 px-4 py-2 text-sm"
          >
            导出我的数据
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-full border border-red-400 px-4 py-2 text-sm text-red-700"
          >
            删除账号与数据
          </button>
        </div>
      </section>

      <section className="paper-card space-y-3 p-4 text-sm text-stone-700">
        <h2 className="text-lg font-semibold">隐私说明（首版）</h2>
        <ul className="space-y-1">
          <li>? 仅收集提供服务所需的最小数据（账号、情绪记录、复盘结果）。</li>
          <li>? 所有接口默认鉴权，用户数据按用户ID隔离。</li>
          <li>? 支持数据导出和账号删除，满足基础合规要求。</li>
          <li>? 本产品不提供医疗诊断建议，如遇危机请优先寻求专业帮助。</li>
        </ul>
      </section>

      {status ? <p className="text-sm text-stone-600">{status}</p> : null}
    </main>
  );
}
