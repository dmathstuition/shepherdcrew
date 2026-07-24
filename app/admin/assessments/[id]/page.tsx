import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/current-admin";
import {
  getAssessmentBasic,
  listQuestions,
  getResults,
  getTopicAnalytics,
} from "@/lib/admin";
import { AddQuestionForm } from "./QuestionForm";
import { ToggleButton } from "../../AdminForms";

export const metadata: Metadata = {
  title: "Assessment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const card = "rounded-2xl border border-white/10 bg-deep/50 p-6 lg:p-8";
const h2 = "font-display text-2xl font-semibold";

export default async function AssessmentAdmin({ params }: { params: { id: string } }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const assessment = await getAssessmentBasic(params.id);
  if (!assessment) redirect("/admin");

  const [questions, results, analytics] = await Promise.all([
    listQuestions(params.id),
    getResults(params.id),
    getTopicAnalytics(params.id),
  ]);

  const submitted = results.filter((r) => r.submittedAt);
  const avg =
    submitted.length > 0
      ? Math.round(
          (submitted.reduce((s, r) => s + (r.score ?? 0), 0) /
            submitted.reduce((s, r) => s + (r.total || questions.length || 1), 0)) *
            100
        )
      : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-14">
      <Link href="/admin" className="text-xs uppercase tracking-[0.28em] text-white/50 hover:text-gold">
        ← Dashboard
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {assessment.week_number != null && (
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Week {assessment.week_number}</p>
          )}
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">{assessment.title}</h1>
          <p className="mt-2 text-sm text-white/45">
            {assessment.duration_minutes} min · {questions.length} question{questions.length === 1 ? "" : "s"} ·{" "}
            {assessment.is_published ? "published" : "draft"}
          </p>
        </div>
        <ToggleButton
          url="/api/admin/assessments"
          body={{ action: assessment.is_published ? "unpublish" : "publish", assessmentId: assessment.id }}
        >
          {assessment.is_published ? "Unpublish" : "Publish"}
        </ToggleButton>
      </header>

      {/* Add question */}
      <section className={`${card} mt-8`}>
        <h2 className={h2}>Add a question</h2>
        <div className="mt-6">
          <AddQuestionForm assessmentId={assessment.id} />
        </div>
      </section>

      {/* Question list */}
      <section className={`${card} mt-6`}>
        <h2 className={h2}>Questions</h2>
        <ol className="mt-6 space-y-3">
          {questions.length === 0 && <p className="text-sm text-white/45">No questions yet.</p>}
          {questions.map((q, i) => (
            <li key={q.id} className="rounded-xl border border-white/10 bg-night/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium">
                  <span className="text-white/40">{i + 1}. </span>
                  {q.stem}
                </p>
                <ToggleButton url="/api/admin/questions" body={{ action: "delete", questionId: q.id }}>
                  Delete
                </ToggleButton>
              </div>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {q.options.map((opt, oi) => (
                  <li
                    key={oi}
                    className={`rounded-md px-2.5 py-1.5 text-sm ${
                      oi === q.correct_option ? "bg-emerald-500/10 text-emerald-200" : "text-white/55"
                    }`}
                  >
                    <span className="mr-2 font-mono text-xs text-white/40">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                    {oi === q.correct_option && <span className="ml-2 text-xs">correct</span>}
                  </li>
                ))}
              </ul>
              {q.topic && (
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/35">Topic: {q.topic}</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Topic analytics */}
      <section className={`${card} mt-6`}>
        <h2 className={h2}>Topic analytics</h2>
        <p className="mt-2 text-sm text-white/45">Percentage correct per topic across submitted attempts.</p>
        <div className="mt-6 space-y-3">
          {analytics.length === 0 && <p className="text-sm text-white/45">No submissions yet.</p>}
          {analytics.map((t) => (
            <div key={t.topic}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-white/70">{t.topic}</span>
                <span className="text-white/45">
                  {t.pct}% · {t.correct}/{t.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${t.pct < 50 ? "bg-ember" : "bg-emerald-500/70"}`}
                  style={{ width: `${t.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className={`${card} mt-6`}>
        <div className="flex items-baseline justify-between">
          <h2 className={h2}>Results</h2>
          {avg != null && <p className="text-sm text-white/45">Cohort average: {avg}%</p>}
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-white/40">
                <th className="py-2 pr-4 font-medium">Member</th>
                <th className="py-2 pr-4 font-medium">Score</th>
                <th className="py-2 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-white/45">
                    No attempts yet.
                  </td>
                </tr>
              )}
              {results.map((r, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2.5 pr-4">{r.memberName}</td>
                  <td className="py-2.5 pr-4">
                    {r.submittedAt ? `${r.score}/${r.total}` : <span className="text-white/40">in progress</span>}
                  </td>
                  <td className="py-2.5 text-white/50">
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
