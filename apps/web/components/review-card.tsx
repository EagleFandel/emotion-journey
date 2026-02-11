import type { DailyReview, MoodEntry } from "@emotion-journey/domain";

interface ReviewCardProps {
  review: DailyReview | null;
  entries: MoodEntry[];
}

function findEntry(entries: MoodEntry[], id: string | null): MoodEntry | null {
  if (!id) return null;
  return entries.find((entry) => entry.id === id) ?? null;
}

export function ReviewCard({ review, entries }: ReviewCardProps) {
  if (!review) {
    return <div className="paper-card p-4 text-sm text-stone-500">今天还没有生成复盘。</div>;
  }

  const peak = findEntry(entries, review.peakEntryId);
  const valley = findEntry(entries, review.valleyEntryId);

  return (
    <section className="paper-card space-y-4 p-5">
      <h2 className="text-lg font-semibold">今日复盘</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white px-3 py-2">
          <p className="text-xs text-stone-500">波峰</p>
          <p className="text-sm font-medium">
            {peak ? `${peak.occurredAt.slice(11, 16)} · ${peak.score}` : "暂无"}
          </p>
          <p className="text-sm text-stone-700">{peak?.note || "-"}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white px-3 py-2">
          <p className="text-xs text-stone-500">波谷</p>
          <p className="text-sm font-medium">
            {valley ? `${valley.occurredAt.slice(11, 16)} · ${valley.score}` : "暂无"}
          </p>
          <p className="text-sm text-stone-700">{valley?.note || "-"}</p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-3">
        <p className="text-xs text-stone-500">情绪标签</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {review.dominantTags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-3">
        <p className="text-xs text-stone-500">AI 温和反馈</p>
        <p className="mt-1 text-sm text-stone-800">{review.summaryText}</p>
      </div>

      <p className="text-sm text-stone-600">能量消耗分：{review.energyLoad}</p>
    </section>
  );
}
