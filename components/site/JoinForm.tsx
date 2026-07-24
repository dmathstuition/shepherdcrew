"use client";

import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Eyebrow } from "@/components/site/Eyebrow";
import { programs } from "@/lib/content";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export function JoinForm({ defaultProgram }: { defaultProgram?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const payload = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="join" className="band">
      <div aria-hidden className="hero-aura absolute inset-x-0 bottom-0 h-[70%]" />
      <div className="relative mx-auto max-w-[820px] px-6 text-center">
        <Reveal>
          <Eyebrow>Join us</Eyebrow>
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.9]">
            THERE IS ROOM
            <br />
            FOR YOU HERE
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-muted">
            Tell us which program you want to join. Someone from the team will reach you with the
            next steps.
          </p>
        </Reveal>

        <Reveal delay={140}>
          {status === "sent" ? (
            <p className="mt-12 rounded-2xl border border-gold/40 bg-gold/10 p-8 text-lg text-gold">
              Received. We&rsquo;ll be in touch shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 space-y-4 text-left">
              {/* Honeypot: real people never fill this in. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="name" label="Full name" type="text" autoComplete="name" />
                <Field name="phone" label="Phone number" type="tel" autoComplete="tel" />
              </div>
              <Field name="email" label="Email address" type="email" autoComplete="email" />

              <div>
                <label
                  htmlFor="program"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-[0.28em] text-faint"
                >
                  Program
                </label>
                <select
                  id="program"
                  name="program"
                  required
                  defaultValue={defaultProgram ?? ""}
                  className="w-full rounded-xl border border-line/20 bg-surface2 px-5 py-4 text-ink transition-colors focus:border-ember"
                >
                  <option value="">Choose one</option>
                  {programs.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              {status === "error" && (
                <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                  That didn&rsquo;t send. Check your connection and try again, or call{" "}
                  {site.contacts[0].phone}.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-full bg-ember py-4 font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send my details"}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type,
  autoComplete,
}: {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] font-bold uppercase tracking-[0.28em] text-faint"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-line/20 bg-surface2 px-5 py-4 text-ink placeholder-faint transition-colors focus:border-ember"
      />
    </div>
  );
}
