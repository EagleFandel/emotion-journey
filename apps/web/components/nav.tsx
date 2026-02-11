"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@emotion-journey/ui";

const navItems = [
  { href: "/landing", label: "首页" },
  { href: "/today", label: "今天" },
  { href: "/review", label: "复盘" },
  { href: "/insights", label: "洞察" },
  { href: "/settings", label: "设置" },
  { href: "/dashboard", label: "后台" },
];

export function MainNav({ userId }: { userId: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-stone-200 bg-[rgba(255,253,248,0.95)] backdrop-blur">
      <div className="page-container flex items-center justify-between gap-4 py-3">
        <Link href="/landing" className="font-bold tracking-wide">
          AI时光合伙人 · 情绪旅程图
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition hover:bg-stone-100",
                pathname.startsWith(item.href) ? "bg-stone-900 text-stone-50" : "text-stone-700",
              )}
            >
              {item.label}
            </Link>
          ))}
          {userId ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100"
            >
              退出 {userId}
            </button>
          ) : (
            <Link href="/login" className="rounded-full border border-stone-300 px-3 py-1 text-sm">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
