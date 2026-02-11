import Link from "next/link";

const features = [
  "点一下 + 拉一下 + 一句话，15 秒完成记录",
  "当天自动生成平滑情绪曲线与波峰/波谷",
  "规则型 AI 输出克制、可解释的复盘反馈",
  "周/月趋势 + 高频触发器，看到长期轨迹",
];

export default function LandingPage() {
  return (
    <main className="page-container space-y-6">
      <section className="paper-card grid gap-6 p-6 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-sm text-stone-500">Web PWA 优先 · 档3全量版</p>
          <h1 className="text-3xl font-bold leading-tight">情绪记录不是填表，而是一次轻量觉察。</h1>
          <p className="text-stone-700">
            用最低操作成本记录情绪波动，并把当下体验转化为可理解的长期情绪地图。
          </p>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white">
              开始使用
            </Link>
            <Link href="/today" className="rounded-full border border-stone-400 px-5 py-2 text-sm font-medium">
              直接体验
            </Link>
          </div>
        </div>
        <div className="paper-card axis-grid h-72 p-4">
          <div className="flex h-full items-end justify-between text-xs text-stone-500">
            {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="paper-card p-6">
        <h2 className="section-title">为什么是 Emotion Journey</h2>
        <ul className="space-y-2 text-stone-700">
          {features.map((feature) => (
            <li key={feature}>? {feature}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
