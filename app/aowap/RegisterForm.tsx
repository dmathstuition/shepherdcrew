"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const OCCUPATIONS = [
  "Student",
  "Business owner / Entrepreneur",
  "Employed / Professional",
  "Unemployed",
  "Other",
];
const AGE_RANGES = ["15 – 25", "26 – 30", "31 – 35", "36 and above"];

const labelCls = "mb-2 block text-[11px] font-bold uppercase tracking-[0.28em] text-faint";
const inputCls =
  "w-full rounded-xl border border-line/20 bg-surface2 px-5 py-4 text-ink placeholder-faint transition-colors focus:border-ember focus:outline-none";

export function RegisterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch("/api/aowap/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-gold/40 bg-gold/[0.08] p-8 text-center sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ember/20 text-3xl text-ember">
          ✓
        </span>
        <h2 className="mt-6 font-display text-3xl font-semibold">You&rsquo;re registered!</h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-muted">
          Thank you for registering for AOWAP 2026 — The Sound of Revival. A confirmation email is
          on its way to your inbox — do check your spam folder if you don&rsquo;t see it shortly. We
          can&rsquo;t wait to worship with you on{" "}
          <span className="font-semibold text-ink">20th November 2026</span> at PAYM Event Centre,
          Epe, Lagos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Honeypot — bots fill hidden fields, people don't. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Text name="firstName" label="First name *" autoComplete="given-name" />
        <Text name="lastName" label="Last name *" autoComplete="family-name" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Text name="email" label="Email *" type="email" autoComplete="email" />
        <Text name="phone" label="Phone number *" type="tel" autoComplete="tel" />
      </div>

      <RadioGroup name="gender" label="Gender *" options={["Male", "Female"]} inline />

      <div className="grid gap-6 sm:grid-cols-2">
        <Text name="city" label="City *" autoComplete="address-level2" />
        <Text name="denomination" label="Denomination / Fellowship *" />
      </div>

      <RadioGroup name="occupation" label="Occupation *" options={OCCUPATIONS} />

      <RadioGroup name="ageRange" label="Age range *" options={AGE_RANGES} inline />

      <RadioGroup name="attendedBefore" label="Have you attended AOWAP before? *" options={["Yes", "No"]} inline />

      <div>
        <label htmlFor="expectations" className={labelCls}>
          What are your expectations for AOWAP 2026? *
        </label>
        <textarea
          id="expectations"
          name="expectations"
          required
          rows={4}
          placeholder="Share what you're believing God for…"
          className={`${inputCls} resize-y`}
        />
      </div>

      {status === "error" && (
        <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          {error || "That didn’t send. Check your connection and try again."}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-ember py-4 font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "sending" ? "Submitting…" : "Complete my registration"}
      </button>

      <p className="text-center text-xs text-faint">
        Fields marked * are required. We&rsquo;ll only use your details to keep you informed about
        AOWAP 2026.
      </p>
    </form>
  );
}

function Text({
  name,
  label,
  type = "text",
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label}
      </label>
      <input id={name} name={name} type={type} required autoComplete={autoComplete} className={inputCls} />
    </div>
  );
}

function RadioGroup({
  name,
  label,
  options,
  inline,
}: {
  name: string;
  label: string;
  options: string[];
  inline?: boolean;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div className={inline ? "flex flex-wrap gap-3" : "grid gap-3 sm:grid-cols-2"}>
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-line/20 bg-surface2 px-5 py-3.5 text-sm text-ink transition-colors has-[:checked]:border-ember has-[:checked]:bg-ember/10 hover:border-line/40"
          >
            <input type="radio" name={name} value={opt} required className="accent-ember" />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
