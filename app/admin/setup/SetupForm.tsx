"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-xl border border-line/20 bg-surface2 px-4 py-3.5 text-ink outline-none transition-colors focus:border-gold";
const label = "mb-2 block text-xs uppercase tracking-[0.28em] text-faint";

export function SetupForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          token: form.get("token"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not create the admin.");
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
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="token" className={label}>
          Setup token
        </label>
        <input id="token" name="token" required className={`${input} font-mono`} />
        <p className="mt-2 text-xs text-faint">
          The value of the <span className="font-mono">ADMIN_SETUP_TOKEN</span> environment variable you set on your host.
        </p>
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-ember py-3.5 font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "loading" ? "Creating…" : "Create admin & sign in"}
      </button>
    </form>
  );
}
