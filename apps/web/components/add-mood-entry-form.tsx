"use client";

import { useMemo, useState } from "react";
import { useOfflineQueue } from "@/lib/offline";
import { scoreLabel } from "@emotion-journey/ui";

interface AddMoodEntryFormProps {
  onCreated: () => Promise<void> | void;
}

export function AddMoodEntryForm({ onCreated }: AddMoodEntryFormProps) {
  const now = useMemo(() => new Date(), []);
  const defaultHour = now.getHours();
  const [hour, setHour] = useState(defaultHour);
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const queue = useOfflineQueue();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const occurredAt = new Date();
    occurredAt.setHours(hour, 0, 0, 0);

    const payload = {
      occurredAt: occurredAt.toISOString(),
      score,
      note,
      source: "web",
    };

    try {
      const response = await fetch("/api/mood-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("save_failed");
      }

      setNote("");
      setMessage("已记录");
      if (navigator.vibrate) navigator.vibrate(30);
      await onCreated();
    } catch {
      queue.enqueue({
        occurredAt: payload.occurredAt,
        score,
        note,
        source: "offline_queue",
      });
      setMessage("离线暂存，联网后自动补写");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="paper-card space-y-4 p-4" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold">+ 打点</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">时间：{hour}:00</label>
        <input
          className="w-full accent-[var(--accent)]"
          type="range"
          min={0}
          max={24}
          step={1}
          value={hour}
          onChange={(event) => setHour(Number(event.target.value))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">心情：{score}（{scoreLabel(score)}）</label>
        <input
          className="w-full accent-[var(--accent)]"
          type="range"
          min={-5}
          max={5}
          step={1}
          value={score}
          onChange={(event) => setScore(Number(event.target.value))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="note">
          事件备注（一句话）
        </label>
        <textarea
          id="note"
          className="min-h-20 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
          maxLength={280}
          placeholder="例如：下午汇报前很紧张，结束后松了一口气"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "保存中..." : "保存记录"}
        </button>
        <span className="text-sm text-stone-600">
          待同步 {queue.count} 条
          <button
            type="button"
            className="ml-2 rounded-full border border-stone-300 px-2 py-1 text-xs"
            onClick={() => void queue.flush().then(() => onCreated())}
          >
            立即同步
          </button>
        </span>
      </div>

      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
    </form>
  );
}
