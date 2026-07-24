"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          code: form.get("code"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not sign you in.");
        setStatus("idle");
        return;
      }
      router.push("/portal/exams");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-2 block text-xs uppercase tracking-[0.28em] text-faint">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          className="w-full rounded-xl border border-line/20 bg-surface2 px-4 py-3.5 text-ink outline-none transition-colors focus:border-gold"
        />
      </div>
      <div>
        <label htmlFor="code" className="mb-2 block text-xs uppercase tracking-[0.28em] text-faint">
          Access code
        </label>
        <input
          id="code"
          name="code"
          required
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="BFC-7K4Q-2M"
          className="w-full rounded-xl border border-line/20 bg-surface2 px-4 py-3.5 font-mono uppercase tracking-widest text-ink outline-none transition-colors placeholder:text-faint focus:border-gold"
        />
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-ember py-3.5 font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "loading" ? "Checking…" : "Enter the portal"}
      </button>
    </form>
  );
}
