import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUserId } from "@/lib/auth";
import { MainNav } from "@/components/nav";
import { RegisterServiceWorker } from "@/components/register-sw";

export const metadata: Metadata = {
  title: "AI时光合伙人｜情绪旅程图",
  description: "轻记录 + 强可视化 + 规则 AI 复盘",
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCurrentUserId();

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <RegisterServiceWorker />
        <MainNav userId={userId} />
        {children}
      </body>
    </html>
  );
}