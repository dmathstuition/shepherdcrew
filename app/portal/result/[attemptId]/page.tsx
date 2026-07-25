import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/current-member";
import { getResult, getCohortName, PASS_PCT } from "@/lib/portal";
import { PortalTopBar } from "@/components/portal/PortalTopBar";
import { ScoreGauge } from "@/components/portal/ScoreGauge";
import { ReviewList } from "@/components/portal/ReviewList";

export const metadata: Metadata = {
  title: "Result",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: { params: { attemptId: string } }) {
  const member = await currentMember();
  if (!member) redirect("/portal");

  const [result, cohortName] = await Promise.all([
    getResult(member, params.attemptId),
    getCohortName(member.cohort_id),
  ]);
  if (!result) redirect("/portal/exams");

  // Per-topic breakdown.
  const topics = new Map<string, { correct: number; total: number }>();
  for (const q of result.questions) {
    const key = q.topic || "General";
    const cur = topics.get(key) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (q.is_correct) cur.correct += 1;
    topics.set(key, cur);
  }
  const topicStats = Array.from(topics.entries())
    .map(([topic, { correct, total }]) => ({ topic, correct, total, pct: Math.round((correct / total) * 100) }))
    .sort((a, b) => a.pct - b.pct);

  return (
    <>
      <PortalTopBar cohortName={cohortName} />
      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 pb-24 pt-8">
        <a href="/portal/exams" className="text-xs uppercase tracking-[0.28em] text-faint hover:text-gold">
          ← All assessments
        </a>

        <div className="mt-6 grid items-center gap-8 rounded-3xl border border-line/15 bg-surface p-8 sm:grid-cols-[1fr_auto] sm:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ember">{result.assessmentTitle}</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight">Your result</h1>
            <p className="mt-3 max-w-[42ch] text-muted">
              {result.score} of {result.total} correct. The pass mark is {PASS_PCT}%. Review every question below.
            </p>
          </div>
          <ScoreGauge score={result.score} total={result.total} passPct={PASS_PCT} />
        </div>

        {/* Per-topic breakdown */}
        {topicStats.length > 0 && (
          <section className="mt-8 rounded-3xl border border-line/15 bg-surface p-6 sm:p-8">
            <h2 className="text-xs uppercase tracking-[0.28em] text-faint">By topic</h2>
            <div className="mt-6 space-y-4">
              {topicStats.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-ink">{t.topic}</span>
                    <span className="text-faint">
                      {t.pct}% · {t.correct}/{t.total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
                    <div
                      className={`h-full rounded-full ${t.pct < PASS_PCT ? "bg-ember" : "bg-emerald-500/70"}`}
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <ReviewList questions={result.questions} />
      </main>
    </>
  );
}
