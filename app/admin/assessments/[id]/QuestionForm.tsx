"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-lg border border-line/20 bg-surface2 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold";
const label = "mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-faint";

export function AddQuestionForm({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [stem, setStem] = useState("");
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setOption(i: number, v: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId, stem, options, correctOption: correct, explanation, topic }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(data.error ?? "Failed.");
    setStem("");
    setOptions(["", "", "", ""]);
    setCorrect(0);
    setTopic("");
    setExplanation("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label className={label}>Question</label>
        <textarea value={stem} onChange={(e) => setStem(e.target.value)} required rows={2} className={input} />
      </div>

      <div className="grid gap-2">
        <label className={label}>Options — select the correct one</label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="radio"
              name="correct"
              checked={correct === i}
              onChange={() => setCorrect(i)}
              className="h-4 w-4 accent-[#C6A24C]"
              aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
            />
            <span className="w-5 font-mono text-xs text-faint">{String.fromCharCode(65 + i)}</span>
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={i < 2 ? "Required" : "Optional"}
              className={input}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Topic (drives analytics)</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Salvation" className={input} />
        </div>
        <div>
          <label className={label}>Explanation (optional)</label>
          <input
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Shown on the result page"
            className={input}
          />
        </div>
      </div>

      {err && <p className="text-sm text-ember">{err}</p>}
      <div>
        <button
          disabled={loading}
          className="rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Adding…" : "Add question"}
        </button>
      </div>
    </form>
  );
}
