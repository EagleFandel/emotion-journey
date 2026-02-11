"use client";

import { useState } from "react";
import type { MoodEntry } from "@emotion-journey/domain";

interface EntryListProps {
  entries: MoodEntry[];
  onChanged: () => Promise<void> | void;
}

export function EntryList({ entries, onChanged }: EntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");

  async function handleDelete(id: string) {
    await fetch(`/api/mood-entries/${id}`, { method: "DELETE" });
    await onChanged();
  }

  async function handleSave(id: string) {
    await fetch(`/api/mood-entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: draftNote }),
    });
    setEditingId(null);
    setDraftNote("");
    await onChanged();
  }

  if (entries.length === 0) {
    return (
      <div className="paper-card p-4 text-sm text-stone-500">暂无记录，先创建第一条。</div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.slice(-3).reverse().map((entry) => (
        <li key={entry.id} className="paper-card p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm text-stone-700">
                {entry.occurredAt.slice(11, 16)} · 分值 {entry.score}
              </div>
              {editingId === entry.id ? (
                <textarea
                  className="min-h-16 w-full rounded-lg border border-stone-300 px-2 py-1 text-sm"
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                />
              ) : (
                <p className="text-sm text-stone-800">{entry.note || "（无备注）"}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingId === entry.id ? (
                <>
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-2 py-1 text-xs"
                    onClick={() => void handleSave(entry.id)}
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-2 py-1 text-xs"
                    onClick={() => setEditingId(null)}
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="rounded-full border border-stone-300 px-2 py-1 text-xs"
                  onClick={() => {
                    setEditingId(entry.id);
                    setDraftNote(entry.note);
                  }}
                >
                  编辑
                </button>
              )}
              <button
                type="button"
                className="rounded-full border border-red-300 px-2 py-1 text-xs text-red-700"
                onClick={() => void handleDelete(entry.id)}
              >
                删除
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
