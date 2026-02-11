import type { TriggerInsight } from "@emotion-journey/domain";

export function TriggerList({ insights }: { insights: TriggerInsight[] }) {
  if (insights.length === 0) {
    return <div className="paper-card p-4 text-sm text-stone-500">暂无触发器数据。</div>;
  }

  return (
    <ul className="space-y-2">
      {insights.map((insight) => (
        <li key={insight.triggerKey} className="paper-card flex items-center justify-between p-3">
          <div>
            <p className="font-medium">{insight.triggerKey}</p>
            <p className="text-xs text-stone-600">高发时段 {insight.peakHour}:00</p>
          </div>
          <div className="text-right text-sm">
            <p>出现 {insight.frequency} 次</p>
            <p className={insight.avgImpact >= 0 ? "text-green-700" : "text-red-700"}>
              平均影响 {insight.avgImpact}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
