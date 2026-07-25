import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/current-member";
import { listAssessmentsForMember, getCohortName, PASS_PCT } from "@/lib/portal";
import { PortalTopBar } from "@/components/portal/PortalTopBar";
import { StatTile } from "@/components/portal/StatTile";

export const metadata: Metadata = {
  title: "Your assessments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function pctOf(score: number | null, total: number | null) {
  if (!total) return 0;
  return Math.round(((score ?? 0) / total) * 100);
}

export default async function ExamsPage() {
  const member = await currentMember();
  if (!member) redirect("/portal");

  const [assessments, cohortName] = await Promise.all([
    listAssessmentsForMember(member),
    getCohortName(member.cohort_id),
  ]);

  const completed = assessments.filter((a) => a.attempt?.submitted_at);
  const available = assessments.filter((a) => a.open && !a.attempt?.submitted_at);
  const avg =
    completed.length > 0
      ? Math.round(
          (completed.reduce((s, a) => s + pctOf(a.attempt!.score, a.attempt!.total), 0) / completed.length)
        )
      : null;

  return (
    <>
      <PortalTopBar cohortName={cohortName} />
      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 pb-24 pt-10">
        <p className="text-xs uppercase tracking-[0.28em] text-ember">Welcome back</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-none">
          Hello, {member.full_name.split(" ")[0]}
        </h1>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          <StatTile label="Available" value={available.length} />
          <StatTile label="Completed" value={completed.length} />
          <StatTile label="Average" value={avg == null ? "—" : `${avg}%`} accent={avg != null && avg >= PASS_PCT} />
        </div>

        {/* Assessments */}
        <h2 className="mt-12 text-xs uppercase tracking-[0.28em] text-faint">Your assessments</h2>
        <section className="mt-4 space-y-4">
          {assessments.length === 0 && (
            <div className="rounded-2xl border border-line/15 bg-surface px-6 py-12 text-center">
              <p className="text-muted">No assessments have been published for your cohort yet.</p>
              <p className="mt-1 text-sm text-faint">Check back when your coordinator opens one.</p>
            </div>
          )}

          {assessments.map((a) => {
            const submitted = a.attempt?.submitted_at;
            const pct = submitted ? pctOf(a.attempt!.score, a.attempt!.total) : 0;
            const passed = pct >= PASS_PCT;
            const closesSoon =
              a.open && a.closes_at && Date.parse(a.closes_at) - Date.now() < 24 * 3600 * 1000;

            let badge: { label: string; cls: string };
            if (submitted) {
              badge = passed
                ? { label: "Passed", cls: "bg-emerald-500/15 text-emerald-400" }
                : { label: "Completed", cls: "bg-ember/15 text-ember" };
            } else if (a.open) {
              badge = a.attempt
                ? { label: "In progress", cls: "bg-gold/15 text-gold" }
                : { label: "Available", cls: "bg-emerald-500/15 text-emerald-400" };
            } else {
              badge = { label: "Not open", cls: "bg-ink/10 text-faint" };
            }

            return (
              <article
                key={a.id}
                className="flex flex-col gap-4 rounded-2xl border border-line/15 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.week_number != null && (
                      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-faint">
                        Week {a.week_number}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-semibold leading-snug">{a.title}</h3>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-faint">
                    <span>{a.duration_minutes} min</span>
                    <span>· {a.question_count} question{a.question_count === 1 ? "" : "s"}</span>
                    {submitted ? (
                      <span>· scored {a.attempt!.score}/{a.attempt!.total} ({pct}%)</span>
                    ) : closesSoon && a.closes_at ? (
                      <span className="text-ember">· closes {new Date(a.closes_at).toLocaleString()}</span>
                    ) : a.closes_at ? (
                      <span>· closes {new Date(a.closes_at).toLocaleDateString()}</span>
                    ) : null}
                  </p>
                </div>

                <div className="shrink-0">
                  {submitted && a.attempt ? (
                    <Link
                      href={`/portal/result/${a.attempt.id}`}
                      className="inline-block rounded-full border border-line/25 px-5 py-2.5 text-sm font-bold transition-colors hover:border-gold hover:text-gold"
                    >
                      View result
                    </Link>
                  ) : a.open ? (
                    <Link
                      href={`/portal/exam/${a.id}`}
                      className="inline-block rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5"
                    >
                      {a.attempt ? "Continue" : "Start"}
                    </Link>
                  ) : (
                    <span className="text-sm text-faint">Locked</span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
