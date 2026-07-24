"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-lg border border-line/20 bg-surface2 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold";
const label = "mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-faint";
const btn =
  "rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60";

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="text-xs uppercase tracking-[0.28em] text-faint transition-colors hover:text-gold"
    >
      Sign out
    </button>
  );
}

export function CreateCohortForm() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const { ok, data } = await postJSON("/api/admin/cohorts", {
          name: f.get("name"),
          startsOn: f.get("startsOn"),
        });
        setLoading(false);
        if (!ok) return setErr(data.error ?? "Failed.");
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Cohort name</label>
          <input name="name" required placeholder="BFC Cohort 2.0" className={input} />
        </div>
        <div>
          <label className={label}>Starts on (optional)</label>
          <input name="startsOn" type="date" className={input} />
        </div>
      </div>
      <button className={btn} disabled={loading}>
        {loading ? "Adding…" : "Add cohort"}
      </button>
      {err && <p className="text-sm text-ember sm:col-span-2">{err}</p>}
    </form>
  );
}

export function CreateMemberForm({ cohorts }: { cohorts: { id: string; name: string }[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState<{ name: string; code: string } | null>(null);

  return (
    <div>
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setLoading(true);
          const f = new FormData(e.currentTarget);
          const { ok, data } = await postJSON("/api/admin/members", {
            cohortId: f.get("cohortId"),
            fullName: f.get("fullName"),
            phone: f.get("phone"),
            codePrefix: f.get("codePrefix"),
          });
          setLoading(false);
          if (!ok) return setErr(data.error ?? "Failed.");
          setIssued({ name: data.fullName, code: data.code });
          (e.target as HTMLFormElement).reset();
          router.refresh();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Full name</label>
            <input name="fullName" required placeholder="Grace Adeyemi" className={input} />
          </div>
          <div>
            <label className={label}>Phone (optional)</label>
            <input name="phone" className={input} />
          </div>
          <div>
            <label className={label}>Cohort</label>
            <select name="cohortId" required className={input} defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Code prefix</label>
            <input name="codePrefix" defaultValue="BFC" maxLength={4} className={`${input} uppercase`} />
          </div>
        </div>
        <div>
          <button className={btn} disabled={loading}>
            {loading ? "Creating…" : "Create member & issue code"}
          </button>
        </div>
        {err && <p className="text-sm text-ember">{err}</p>}
      </form>

      {issued && (
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/[0.08] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Access code — shown once</p>
          <p className="mt-2 text-sm text-ink/70">
            Give <span className="font-semibold text-ink">{issued.name}</span> this code. It cannot be
            shown again (only reset).
          </p>
          <p className="mt-2 select-all font-mono text-2xl tracking-widest text-ink">{issued.code}</p>
        </div>
      )}
    </div>
  );
}

export function CreateAssessmentForm({ cohorts }: { cohorts: { id: string; name: string }[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const { ok, data } = await postJSON("/api/admin/assessments", {
          cohortId: f.get("cohortId"),
          title: f.get("title"),
          weekNumber: f.get("weekNumber"),
          durationMinutes: f.get("durationMinutes"),
          closesAt: f.get("closesAt"),
        });
        setLoading(false);
        if (!ok) return setErr(data.error ?? "Failed.");
        router.push(`/admin/assessments/${data.id}`);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label}>Title</label>
          <input name="title" required placeholder="Week One — Salvation & Assurance" className={input} />
        </div>
        <div>
          <label className={label}>Cohort</label>
          <select name="cohortId" required className={input} defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Week number</label>
          <input name="weekNumber" type="number" min={1} placeholder="1" className={input} />
        </div>
        <div>
          <label className={label}>Duration (minutes)</label>
          <input name="durationMinutes" type="number" min={1} defaultValue={15} className={input} />
        </div>
        <div>
          <label className={label}>Closes at (optional)</label>
          <input name="closesAt" type="datetime-local" className={input} />
        </div>
      </div>
      <div>
        <button className={btn} disabled={loading}>
          {loading ? "Creating…" : "Create & add questions"}
        </button>
      </div>
      {err && <p className="text-sm text-ember">{err}</p>}
    </form>
  );
}

export function ToggleButton({
  url,
  body,
  children,
}: {
  url: string;
  body: unknown;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await postJSON(url, body);
        setLoading(false);
        router.refresh();
      }}
      className="rounded-full border border-line/25 px-4 py-1.5 text-xs font-bold transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function CreateAdminForm() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const { ok: good, data } = await postJSON("/api/admin/admins", {
          email: f.get("email"),
          password: f.get("password"),
        });
        setLoading(false);
        if (!good) return setErr(data.error ?? "Failed.");
        setOk(`Added ${String(f.get("email"))}.`);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }}
    >
      <div>
        <label className={label}>Email</label>
        <input name="email" type="email" required placeholder="name@church.org" className={input} />
      </div>
      <div>
        <label className={label}>Password</label>
        <input name="password" type="password" required minLength={8} placeholder="≥ 8 characters" className={input} />
      </div>
      <button className={btn} disabled={loading}>
        {loading ? "Adding…" : "Add admin"}
      </button>
      {err && <p className="text-sm text-ember sm:col-span-3">{err}</p>}
      {ok && <p className="text-sm text-emerald-300 sm:col-span-3">{ok}</p>}
    </form>
  );
}

const btnGhost = "rounded-full border border-line/25 px-4 py-1.5 text-xs font-bold transition-colors hover:border-gold hover:text-gold";

/** Destructive action with a confirm prompt. Optionally navigates after success. */
export function ConfirmButton({
  url,
  body,
  confirm,
  redirectTo,
  children,
}: {
  url: string;
  body: unknown;
  confirm: string;
  redirectTo?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => {
        if (!window.confirm(confirm)) return;
        setLoading(true);
        const { ok, data } = await postJSON(url, body);
        setLoading(false);
        if (!ok) {
          window.alert(data.error ?? "Failed.");
          return;
        }
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      }}
      className="rounded-full border border-rose-400/40 px-4 py-1.5 text-xs font-bold text-rose-400 transition-colors hover:border-rose-400 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function RenameCohortForm({ cohort }: { cohort: { id: string; name: string; starts_on: string | null } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={btnGhost}>
        Rename
      </button>
    );
  }
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const { ok, data } = await postJSON("/api/admin/cohorts", {
          action: "update",
          cohortId: cohort.id,
          name: f.get("name"),
          startsOn: f.get("startsOn"),
        });
        setLoading(false);
        if (!ok) return setErr(data.error ?? "Failed.");
        setOpen(false);
        router.refresh();
      }}
    >
      <input name="name" defaultValue={cohort.name} required className={`${input} w-40`} />
      <input name="startsOn" defaultValue={cohort.starts_on ?? ""} placeholder="Starts (optional)" className={`${input} w-36`} />
      <button className={btn} disabled={loading}>
        {loading ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
        Cancel
      </button>
      {err && <p className="w-full text-sm text-ember">{err}</p>}
    </form>
  );
}

export function ResetAdminPassword({ adminId }: { adminId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={btnGhost}>
        Reset password
      </button>
    );
  }
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setOk(false);
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const { ok: good, data } = await postJSON("/api/admin/admins", {
          action: "reset",
          adminId,
          password: f.get("password"),
        });
        setLoading(false);
        if (!good) return setErr(data.error ?? "Failed.");
        setOk(true);
        setOpen(false);
        router.refresh();
      }}
    >
      <input name="password" type="password" required minLength={8} placeholder="New password" className={`${input} w-44`} />
      <button className={btn} disabled={loading}>
        {loading ? "Saving…" : "Set"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
        Cancel
      </button>
      {ok && <span className="text-xs text-emerald-300">Updated</span>}
      {err && <p className="w-full text-sm text-ember">{err}</p>}
    </form>
  );
}
