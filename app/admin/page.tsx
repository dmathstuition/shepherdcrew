import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/current-admin";
import { listCohorts, listMembers, listAssessments } from "@/lib/admin";
import { CreateCohortForm, CreateMemberForm, CreateAssessmentForm, ToggleButton, LogoutButton } from "./AdminForms";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const card = "rounded-2xl border border-white/10 bg-deep/50 p-6 lg:p-8";
const h2 = "font-display text-2xl font-semibold";

export default async function AdminDashboard({ searchParams }: { searchParams: { cohort?: string } }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const cohorts = await listCohorts();
  const selectedId = searchParams.cohort && cohorts.some((c) => c.id === searchParams.cohort)
    ? searchParams.cohort
    : cohorts[0]?.id;

  const [members, assessments] = selectedId
    ? await Promise.all([listMembers(selectedId), listAssessments(selectedId)])
    : [[], []];

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-14">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Class portal</p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-none">Admin</h1>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden text-sm text-white/45 sm:block">{admin.email}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Cohorts */}
      <section className={`${card} mt-10`}>
        <h2 className={h2}>Cohorts</h2>
        {cohorts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {cohorts.map((c) => (
              <Link
                key={c.id}
                href={`/admin?cohort=${c.id}`}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  c.id === selectedId ? "bg-ember text-midnight" : "border border-white/20 text-white/70 hover:border-gold"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 border-t border-white/10 pt-6">
          <CreateCohortForm />
        </div>
      </section>

      {!selectedId ? (
        <p className="mt-8 text-center text-white/50">Create your first cohort to begin.</p>
      ) : (
        <>
          {/* Members */}
          <section className={`${card} mt-6`}>
            <h2 className={h2}>Members</h2>
            <div className="mt-6"><CreateMemberForm cohorts={cohorts} /></div>

            <div className="mt-8 divide-y divide-white/10">
              {members.length === 0 && <p className="text-sm text-white/45">No members yet.</p>}
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className={`font-semibold ${m.revoked ? "text-white/40 line-through" : "text-white"}`}>
                      {m.full_name}
                    </p>
                    {m.phone && <p className="text-xs text-white/40">{m.phone}</p>}
                  </div>
                  <ToggleButton
                    url="/api/admin/members"
                    body={{ action: m.revoked ? "restore" : "revoke", memberId: m.id }}
                  >
                    {m.revoked ? "Restore" : "Revoke"}
                  </ToggleButton>
                </div>
              ))}
            </div>
          </section>

          {/* Assessments */}
          <section className={`${card} mt-6`}>
            <h2 className={h2}>Assessments</h2>
            <div className="mt-6"><CreateAssessmentForm cohorts={cohorts} /></div>

            <div className="mt-8 space-y-3">
              {assessments.length === 0 && <p className="text-sm text-white/45">No assessments yet.</p>}
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-night/40 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">
                      {a.week_number != null && <span className="text-white/45">Week {a.week_number} · </span>}
                      {a.title}
                    </p>
                    <p className="text-xs text-white/40">
                      {a.duration_minutes} min · {a.is_published ? "published" : "draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleButton
                      url="/api/admin/assessments"
                      body={{ action: a.is_published ? "unpublish" : "publish", assessmentId: a.id }}
                    >
                      {a.is_published ? "Unpublish" : "Publish"}
                    </ToggleButton>
                    <Link
                      href={`/admin/assessments/${a.id}`}
                      className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold transition-colors hover:bg-white/20"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
