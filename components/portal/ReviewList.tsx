"use client";

import { useState } from "react";

export type ReviewQuestion = {
  stem: string;
  options: string[];
  correct_option: number;
  chosen_option: number | null;
  is_correct: boolean;
  explanation: string | null;
  topic: string | null;
};

export function ReviewList({ questions }: { questions: ReviewQuestion[] }) {
  const [filter, setFilter] = useState<"all" | "incorrect">("all");
  const shown = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => (filter === "incorrect" ? !q.is_correct : true));

  const incorrectCount = questions.filter((q) => !q.is_correct).length;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs uppercase tracking-[0.28em] text-faint">Review</h2>
        <div className="flex items-center gap-1 rounded-full border border-line/15 p-1 text-xs font-bold">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 transition-colors ${filter === "all" ? "bg-ember text-midnight" : "text-faint hover:text-ink"}`}
          >
            All ({questions.length})
          </button>
          <button
            onClick={() => setFilter("incorrect")}
            className={`rounded-full px-3 py-1 transition-colors ${filter === "incorrect" ? "bg-ember text-midnight" : "text-faint hover:text-ink"}`}
          >
            Incorrect ({incorrectCount})
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {shown.length === 0 && (
          <p className="rounded-2xl border border-line/15 bg-surface px-6 py-8 text-center text-muted">
            Nothing to show here — every answer was correct.
          </p>
        )}
        {shown.map(({ q, i }) => (
          <article key={i} className="rounded-2xl border border-line/15 bg-surface p-5">
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  q.is_correct ? "bg-emerald-500/20 text-emerald-300" : "bg-ember/20 text-ember"
                }`}
              >
                {q.is_correct ? "✓" : "✕"}
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-snug">
                  <span className="text-faint">{i + 1}. </span>
                  {q.stem}
                </p>
                {q.topic && <p className="mt-1 text-xs uppercase tracking-[0.2em] text-faint">{q.topic}</p>}

                <ul className="mt-3 space-y-1.5 text-sm">
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correct_option;
                    const isChosen = oi === q.chosen_option;
                    return (
                      <li
                        key={oi}
                        className={`rounded-lg px-3 py-2 ${
                          isCorrect
                            ? "bg-emerald-500/10 text-emerald-200"
                            : isChosen
                              ? "bg-ember/10 text-ember"
                              : "text-muted"
                        }`}
                      >
                        <span className="mr-2 font-mono text-xs text-faint">{String.fromCharCode(65 + oi)}</span>
                        {opt}
                        {isCorrect && <span className="ml-2 text-xs">correct</span>}
                        {isChosen && !isCorrect && <span className="ml-2 text-xs">your answer</span>}
                      </li>
                    );
                  })}
                </ul>

                {q.chosen_option === null && <p className="mt-2 text-xs text-faint">Not answered</p>}
                {q.explanation && (
                  <p className="mt-3 border-l-2 border-gold/50 pl-3 text-sm text-muted">{q.explanation}</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
