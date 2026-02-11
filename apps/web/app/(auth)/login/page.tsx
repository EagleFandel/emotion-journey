"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "登录失败，请稍后重试");
      setIsSubmitting(false);
      return;
    }

    router.push("/today");
    router.refresh();
  }

  return (
    <main className="page-container">
      <section className="paper-card mx-auto max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-bold">登录</h1>
        <p className="text-sm text-stone-600">首版采用邮箱登录（Passwordless体验）。</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium" htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
            placeholder="you@example.com"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {isSubmitting ? "登录中..." : "继续"}
          </button>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
