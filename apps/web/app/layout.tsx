import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { getCurrentUserId } from "@/lib/auth";
import { MainNav } from "@/components/nav";
import { RegisterServiceWorker } from "@/components/register-sw";

const noto = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI时光合伙人｜情绪旅程图",
  description: "轻记录 + 强可视化 + 规则AI复盘",
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
      <body className={`${noto.variable} ${inter.variable} antialiased`}>
        <RegisterServiceWorker />
        <MainNav userId={userId} />
        {children}
      </body>
    </html>
  );
}
