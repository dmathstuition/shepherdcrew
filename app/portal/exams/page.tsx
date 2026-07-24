import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/current-member";
import { listAssessmentsForMember } from "@/lib/portal";
import { LogoutButton } from "../LogoutButton";

export const metadata: Metadata = {
  title: "Your assessments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const member = await currentMember();
  if (!member) redirect("/portal");

  const assessments = await listAssessmentsForMember(member);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-20">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ember">Class portal</p>
          <h1 className="mt-2 font-display text-4xl leading-none">
            HELLO,
            <br />
            {member.full_name.split(" ")[0].toUpperCase()}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <section className="mt-12 space-y-4">
        {assessments.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-deep/50 px-6 py-8 text-center text-white/55">
            No assessments have been published for your cohort yet. Check back when your coordinator opens one.
          </p>
        )}

        {assessments.map((a) => {
          const submitted = a.attempt?.submitted_at;
          return (
            <article
              key={a.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-deep/50 px-6 py-5"
            >
              <div>
                {a.week_number != null && (
                  <p className="text-xs uppercase tracking-[0.28em] text-white/40">Week {a.week_number}</p>
                )}
                <h2 className="mt-1 font-semibold">{a.title}</h2>
                <p className="mt-1 text-sm text-white/45">
                  {a.duration_minutes} min
                  {submitted && a.attempt
                    ? ` · scored ${a.attempt.score}/${a.attempt.total}`
                    : a.open
                      ? a.attempt
                        ? " · in progress"
                        : " · not started"
                      : " · not open"}
                </p>
              </div>

              {submitted && a.attempt ? (
                <Link
                  href={`/portal/result/${a.attempt.id}`}
                  className="shrink-0 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition-colors hover:border-gold hover:text-gold"
                >
                  View result
                </Link>
              ) : a.open ? (
                <Link
                  href={`/portal/exam/${a.id}`}
                  className="shrink-0 rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5"
                >
                  {a.attempt ? "Continue" : "Start"}
                </Link>
              ) : (
                <span className="shrink-0 text-sm text-white/35">Locked</span>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
