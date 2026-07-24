"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not sign you in.");
        setStatus("idle");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-[0.28em] text-faint">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-line/20 bg-surface2 px-4 py-3.5 text-ink outline-none transition-colors focus:border-gold"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-[0.28em] text-faint">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-line/20 bg-surface2 px-4 py-3.5 text-ink outline-none transition-colors focus:border-gold"
        />
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-ember py-3.5 font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
