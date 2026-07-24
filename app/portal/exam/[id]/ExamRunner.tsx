"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ClientQuestion = { id: string; stem: string; type: "single"; options: string[] };

/**
 * The exam client. It never receives the correct answers — it only records the
 * member's choice and autosaves it. Timing shown here is convenience only; the
 * server enforces the real deadline and does all scoring on submit.
 */
export function ExamRunner({
  attemptId,
  title,
  questions,
  saved,
  deadlineMs,
}: {
  attemptId: string;
  title: string;
  questions: ClientQuestion[];
  saved: Record<string, number>;
  deadlineMs: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>(saved);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => Math.max(0, deadlineMs - Date.now()));
  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const submittedRef = useRef(false);

  const total = questions.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const current = questions[index];

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.attemptId) {
        router.push(`/portal/result/${data.attemptId}`);
        router.refresh();
        return;
      }
    } catch {
      /* fall through */
    }
    // If submit failed, let the member try again.
    submittedRef.current = false;
    setSubmitting(false);
  }, [attemptId, router]);

  // Countdown; auto-submit when time runs out.
  useEffect(() => {
    const t = setInterval(() => {
      const left = Math.max(0, deadlineMs - Date.now());
      setRemaining(left);
      if (left <= 0) {
        clearInterval(t);
        void submit();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [deadlineMs, submit]);

  async function choose(questionId: string, option: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setSaveState("saving");
    try {
      const res = await fetch("/api/portal/exam/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, questionId, chosenOption: option }),
      });
      if (res.status === 409) {
        // Time is up on the server — hand in what we have.
        void submit();
        return;
      }
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const low = remaining < 60_000;

  if (total === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 text-center text-muted">
        This assessment has no questions yet.
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-12">
      {/* Sticky header: title, timer, progress */}
      <header className="sticky top-0 z-10 -mx-6 mb-8 border-b border-line/15 bg-canvas/85 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <p className="truncate text-sm font-semibold">{title}</p>
          <div
            className={`rounded-full px-3 py-1 font-mono text-sm tabular-nums ${
              low ? "bg-ember/20 text-ember" : "bg-ink/10 text-muted"
            }`}
            aria-live="polite"
          >
            {mm}:{ss.toString().padStart(2, "0")}
          </div>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full bg-ember transition-all"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      </header>

      {/* Question */}
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-faint">
          Question {index + 1} of {total}
        </p>
        <h2 className="mt-3 text-xl font-semibold leading-snug">{current.stem}</h2>

        <div className="mt-6 space-y-3">
          {current.options.map((opt, i) => {
            const selected = answers[current.id] === i;
            return (
              <button
                key={i}
                onClick={() => choose(current.id, i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  selected
                    ? "border-gold bg-gold/10 text-ink"
                    : "border-line/20 bg-surface2 text-muted hover:border-line/30"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                    selected ? "border-gold bg-gold text-midnight" : "border-line/30 text-faint"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-full border border-line/25 px-5 py-2.5 text-sm font-bold transition-colors hover:border-line/40 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-xs text-faint" aria-live="polite">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && "Save failed — retrying on next tap"}
        </span>
        {index < total - 1 ? (
          <button
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            className="rounded-full bg-ink/10 px-5 py-2.5 text-sm font-bold transition-colors hover:bg-ink/15"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => void submit()}
            disabled={submitting}
            className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        )}
      </div>

      {/* Question palette */}
      <div className="mt-10 flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const done = answers[q.id] !== undefined;
          return (
            <button
              key={q.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to question ${i + 1}`}
              className={`h-9 w-9 rounded-lg text-sm font-bold transition-colors ${
                i === index
                  ? "bg-gold text-midnight"
                  : done
                    ? "bg-ember/30 text-ink"
                    : "bg-ink/10 text-faint hover:bg-ink/15"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-faint">
        {answeredCount} of {total} answered · your answers save automatically
      </p>
    </main>
  );
}
