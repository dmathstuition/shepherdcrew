import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/current-member";
import { getResult } from "@/lib/portal";

export const metadata: Metadata = {
  title: "Result",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: { params: { attemptId: string } }) {
  const member = await currentMember();
  if (!member) redirect("/portal");

  const result = await getResult(member, params.attemptId);
  if (!result) redirect("/portal/exams");

  const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16">
      <Link href="/portal/exams" className="text-xs uppercase tracking-[0.28em] text-white/50 hover:text-gold">
        ← All assessments
      </Link>

      <header className="mt-8 rounded-3xl border border-white/10 bg-deep/50 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-ember">{result.assessmentTitle}</p>
        <p className="mt-4 font-display text-6xl leading-none">
          {result.score}
          <span className="text-white/40">/{result.total}</span>
        </p>
        <p className="mt-3 text-white/55">{pct}% correct</p>
      </header>

      <section className="mt-10 space-y-4">
        <h2 className="text-xs uppercase tracking-[0.28em] text-white/40">Review</h2>
        {result.questions.map((q, i) => (
          <article key={i} className="rounded-2xl border border-white/10 bg-deep/40 p-5">
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  q.is_correct ? "bg-emerald-500/20 text-emerald-300" : "bg-ember/20 text-ember"
                }`}
              >
                {q.is_correct ? "✓" : "✕"}
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{q.stem}</p>
                {q.topic && (
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/35">{q.topic}</p>
                )}

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
                              : "text-white/55"
                        }`}
                      >
                        <span className="mr-2 font-mono text-xs text-white/40">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                        {isCorrect && <span className="ml-2 text-xs">correct</span>}
                        {isChosen && !isCorrect && <span className="ml-2 text-xs">your answer</span>}
                      </li>
                    );
                  })}
                </ul>

                {q.chosen_option === null && (
                  <p className="mt-2 text-xs text-white/40">Not answered</p>
                )}
                {q.explanation && (
                  <p className="mt-3 border-l-2 border-gold/50 pl-3 text-sm text-white/60">
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
