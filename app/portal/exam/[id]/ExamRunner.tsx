"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ClientQuestion = { id: string; stem: string; type: "single"; options: string[] };

// How many times a member may leave the exam screen before it ends.
const MAX_LEAVES = 2;

/**
 * The exam client. It never receives the correct answers — it only records the
 * member's choice and autosaves it. Timing shown here is convenience only; the
 * server enforces the real deadline and does all scoring on submit.
 *
 * Proctoring: the exam runs in full screen. Leaving it (switching tab,
 * minimising, or exiting full screen) is detected. After two warnings, a third
 * time auto-submits the attempt and signs the member out.
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
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => Math.max(0, deadlineMs - Date.now()));
  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [reviewOpen, setReviewOpen] = useState(false);

  // Proctoring state.
  const [started, setStarted] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [violations, setViolations] = useState(0);
  const [showFsPrompt, setShowFsPrompt] = useState(false);
  const [ended, setEnded] = useState(false);

  const submittedRef = useRef(false);
  const finishedRef = useRef(false);
  const startedRef = useRef(false);
  const endingRef = useRef(false);
  const violationsRef = useRef(0);
  const lastLeaveRef = useRef(0);

  const total = questions.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const unanswered = useMemo(
    () => questions.map((q, i) => ({ q, i })).filter(({ q }) => answers[q.id] === undefined),
    [questions, answers]
  );
  const current = questions[index];

  function exitFullscreen() {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  const submit = useCallback(
    async (opts?: { silent?: boolean }): Promise<boolean> => {
      if (submittedRef.current) return true;
      submittedRef.current = true;
      finishedRef.current = true;
      setSubmitting(true);
      try {
        const res = await fetch("/api/portal/exam/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.attemptId) {
          exitFullscreen();
          if (opts?.silent) return true;
          router.push(`/portal/result/${data.attemptId}`);
          router.refresh();
          return true;
        }
      } catch {
        /* fall through */
      }
      if (!opts?.silent) {
        submittedRef.current = false;
        finishedRef.current = false;
      }
      setSubmitting(false);
      return false;
    },
    [attemptId, router]
  );

  const endExam = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    finishedRef.current = true;
    setEnded(true);
    try {
      await submit({ silent: true });
    } catch {
      /* ignore */
    }
    try {
      await fetch("/api/portal/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    exitFullscreen();
    router.push("/portal?ended=proctor");
    router.refresh();
  }, [submit, router]);

  const registerLeave = useCallback(() => {
    if (!startedRef.current || finishedRef.current || endingRef.current) return;
    const now = Date.now();
    if (now - lastLeaveRef.current < 1200) return;
    lastLeaveRef.current = now;
    violationsRef.current += 1;
    const v = violationsRef.current;
    setViolations(v);
    if (v > MAX_LEAVES) {
      void endExam();
    } else {
      setWarn(
        `You left the exam screen (warning ${v} of ${MAX_LEAVES}). Leaving again will end and submit your exam, and sign you out.`
      );
    }
  }, [endExam]);

  const choose = useCallback(
    async (questionId: string, option: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: option }));
      setSaveState("saving");
      try {
        const res = await fetch("/api/portal/exam/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, questionId, chosenOption: option }),
        });
        if (res.status === 409) {
          void submit();
          return;
        }
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    },
    [attemptId, submit]
  );

  const toggleFlag = useCallback((qid: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }, []);

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

  // Proctoring listeners.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) registerLeave();
    };
    const onBlur = () => registerLeave();
    const onFs = () => {
      if (startedRef.current && !document.fullscreenElement && !finishedRef.current) {
        setShowFsPrompt(true);
        registerLeave();
      } else if (document.fullscreenElement) {
        setShowFsPrompt(false);
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (startedRef.current && !finishedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [registerLeave]);

  // Keyboard shortcuts.
  useEffect(() => {
    if (!started || ended) return;
    const onKey = (e: KeyboardEvent) => {
      if (reviewOpen || showFsPrompt) return;
      const q = questions[index];
      if (!q) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft") return setIndex((i) => Math.max(0, i - 1));
      if (k === "arrowright") return setIndex((i) => Math.min(total - 1, i + 1));
      if (k === "f") return toggleFlag(q.id);
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= q.options.length) return void choose(q.id, num - 1);
      if (/^[a-d]$/.test(k)) {
        const li = k.charCodeAt(0) - 97;
        if (li < q.options.length) void choose(q.id, li);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, ended, reviewOpen, showFsPrompt, index, total, questions, choose, toggleFlag]);

  // Auto-clear the warning banner.
  useEffect(() => {
    if (!warn) return;
    const t = setTimeout(() => setWarn(null), 6000);
    return () => clearTimeout(t);
  }, [warn]);

  async function begin() {
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      /* full screen unavailable (e.g. iOS Safari) — detection still applies */
    }
    lastLeaveRef.current = Date.now();
    startedRef.current = true;
    setStarted(true);
  }

  async function reenterFullscreen() {
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      /* ignore */
    }
    lastLeaveRef.current = Date.now();
    setShowFsPrompt(false);
  }

  function jumpTo(i: number) {
    setIndex(i);
    setReviewOpen(false);
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

  // Begin gate — enters full screen and starts proctoring on a user gesture.
  if (!started) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-ember">{title}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">Before you begin</h1>
        <ul className="mt-8 space-y-3 text-left text-muted">
          <li className="flex gap-3"><span className="text-gold">•</span> The exam opens in full screen. Stay on this screen until you submit.</li>
          <li className="flex gap-3"><span className="text-gold">•</span> Leaving — switching tab, minimising, or exiting full screen — is recorded.</li>
          <li className="flex gap-3"><span className="text-gold">•</span> After two warnings, a third time <span className="font-semibold text-ink">ends and submits your exam</span> and signs you out.</li>
          <li className="flex gap-3"><span className="text-gold">•</span> Your answers save automatically. The timer is already running.</li>
        </ul>
        <button
          onClick={() => void begin()}
          className="mt-10 w-full rounded-full bg-ember py-4 font-bold text-midnight transition-transform hover:-translate-y-0.5"
        >
          Begin exam
        </button>
        <p className="mt-4 font-mono text-sm text-faint">Time left: {mm}:{ss.toString().padStart(2, "0")}</p>
      </main>
    );
  }

  const flaggedCurrent = flagged.has(current.id);

  return (
    <>
      {/* Penalty screen */}
      {ended && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-midnight/95 px-6 text-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-mist">Exam ended</h2>
            <p className="mt-4 max-w-sm text-mist/70">
              You left the exam screen too many times. Your answers have been submitted and you&rsquo;ve been signed out.
            </p>
          </div>
        </div>
      )}

      {/* Return-to-full-screen prompt */}
      {showFsPrompt && !ended && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-midnight/95 px-6 text-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-mist">Return to full screen</h2>
            <p className="mt-3 max-w-sm text-mist/70">
              You left full screen. This was recorded ({violations} of {MAX_LEAVES}). Return to continue.
            </p>
            <button onClick={() => void reenterFullscreen()} className="mt-6 rounded-full bg-ember px-8 py-3 font-bold text-midnight">
              Continue exam
            </button>
          </div>
        </div>
      )}

      {/* Review & submit modal */}
      {reviewOpen && !ended && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-midnight/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line/15 bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold">Ready to submit?</h2>
            <p className="mt-2 text-sm text-muted">
              {answeredCount} of {total} answered · {unanswered.length} left · {flagged.size} flagged
            </p>

            {unanswered.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-faint">Unanswered — tap to jump</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unanswered.map(({ i }) => (
                    <button key={i} onClick={() => jumpTo(i)} className="h-8 w-8 rounded-lg bg-ink/10 text-sm font-bold hover:bg-ink/15">
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {flagged.size > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-faint">Flagged — tap to jump</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {questions.map((q, i) =>
                    flagged.has(q.id) ? (
                      <button key={q.id} onClick={() => jumpTo(i)} className="h-8 w-8 rounded-lg bg-gold/20 text-sm font-bold text-gold hover:bg-gold/30">
                        {i + 1}
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setReviewOpen(false)}
                className="rounded-full border border-line/25 px-5 py-2.5 text-sm font-bold transition-colors hover:border-gold"
              >
                Keep working
              </button>
              <button
                onClick={() => {
                  setReviewOpen(false);
                  void submit();
                }}
                disabled={submitting}
                className="flex-1 rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit exam"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-12">
        {warn && (
          <div role="alert" className="fixed inset-x-0 top-0 z-30 mx-auto max-w-2xl bg-ember px-4 py-3 text-center text-sm font-semibold text-midnight">
            {warn}
          </div>
        )}

        {/* Sticky header: title, timer, progress */}
        <header className="sticky top-0 z-10 -mx-6 mb-8 border-b border-line/15 bg-canvas/85 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <p className="truncate text-sm font-semibold">{title}</p>
            <div
              className={`rounded-full px-3 py-1 font-mono text-sm tabular-nums ${low ? "bg-ember/20 text-ember" : "bg-ink/10 text-muted"}`}
              aria-live="polite"
            >
              {mm}:{ss.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink/10">
            <div className="h-full bg-ember transition-all" style={{ width: `${(answeredCount / total) * 100}%` }} />
          </div>
        </header>

        {/* Question */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.28em] text-faint">
              Question {index + 1} of {total}
            </p>
            <button
              onClick={() => toggleFlag(current.id)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                flaggedCurrent ? "border-gold bg-gold/15 text-gold" : "border-line/25 text-faint hover:border-gold hover:text-gold"
              }`}
            >
              {flaggedCurrent ? "★ Flagged" : "☆ Flag for review"}
            </button>
          </div>
          <h2 className="mt-3 text-xl font-semibold leading-snug">{current.stem}</h2>

          <div className="mt-6 space-y-3">
            {current.options.map((opt, i) => {
              const selected = answers[current.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => choose(current.id, i)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                    selected ? "border-gold bg-gold/10 text-ink" : "border-line/20 bg-surface2 text-muted hover:border-line/30"
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
          <p className="mt-4 text-center text-[11px] text-faint">
            Keys: 1–{Math.min(current.options.length, 9)} answer · ← → move · F flag
          </p>
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
          <button
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={index === total - 1}
            className="rounded-full bg-ink/10 px-5 py-2.5 text-sm font-bold transition-colors hover:bg-ink/15 disabled:opacity-40"
          >
            Next
          </button>
        </div>

        {/* Question palette */}
        <div className="mt-10 flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const done = answers[q.id] !== undefined;
            const flag = flagged.has(q.id);
            return (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to question ${i + 1}`}
                className={`relative h-9 w-9 rounded-lg text-sm font-bold transition-colors ${
                  i === index ? "bg-gold text-midnight" : done ? "bg-ember/30 text-ink" : "bg-ink/10 text-faint hover:bg-ink/15"
                }`}
              >
                {i + 1}
                {flag && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold ring-2 ring-canvas" />}
              </button>
            );
          })}
        </div>

        {/* Review & submit */}
        <button
          onClick={() => setReviewOpen(true)}
          className="mt-8 w-full rounded-full bg-ember py-3.5 font-bold text-midnight transition-transform hover:-translate-y-0.5"
        >
          Review &amp; submit
        </button>
        <p className="mt-3 text-center text-xs text-faint">
          {answeredCount} of {total} answered · your answers save automatically
        </p>
      </main>
    </>
  );
}
