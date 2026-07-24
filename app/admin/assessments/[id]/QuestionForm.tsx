"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-lg border border-line/20 bg-surface2 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold";
const label = "mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-faint";
const btn =
  "rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5 disabled:opacity-60";
const btnGhost = "rounded-full border border-line/25 px-4 py-2 text-sm font-bold transition-colors hover:border-gold";

type QuestionValue = {
  stem: string;
  options: string[];
  correctOption: number;
  topic: string;
  explanation: string;
};

async function postJSON(body: unknown) {
  const res = await fetch("/api/admin/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/** Shared question fields for both adding and editing. */
function QuestionFields({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: QuestionValue;
  submitLabel: string;
  onSubmit: (v: QuestionValue) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [stem, setStem] = useState(initial.stem);
  const [options, setOptions] = useState<string[]>(
    initial.options.length >= 4 ? initial.options : [...initial.options, "", "", "", ""].slice(0, 4)
  );
  const [correct, setCorrect] = useState(initial.correctOption);
  const [topic, setTopic] = useState(initial.topic);
  const [explanation, setExplanation] = useState(initial.explanation);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setOption(i: number, v: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const error = await onSubmit({ stem, options, correctOption: correct, topic, explanation });
    setLoading(false);
    if (error) setErr(error);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label className={label}>Question</label>
        <textarea value={stem} onChange={(e) => setStem(e.target.value)} required rows={2} className={input} />
      </div>

      <div className="grid gap-2">
        <label className={label}>Options — select the correct one</label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="radio"
              checked={correct === i}
              onChange={() => setCorrect(i)}
              className="h-4 w-4 accent-[#C6A24C]"
              aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
            />
            <span className="w-5 font-mono text-xs text-faint">{String.fromCharCode(65 + i)}</span>
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={i < 2 ? "Required" : "Optional"}
              className={input}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Topic (drives analytics)</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Salvation" className={input} />
        </div>
        <div>
          <label className={label}>Explanation (optional)</label>
          <input
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Shown on the result page"
            className={input}
          />
        </div>
      </div>

      {err && <p className="text-sm text-ember">{err}</p>}
      <div className="flex items-center gap-2">
        <button disabled={loading} className={btn}>
          {loading ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function AddQuestionForm({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [key, setKey] = useState(0); // reset the form after a successful add

  return (
    <QuestionFields
      key={key}
      submitLabel="Add question"
      initial={{ stem: "", options: ["", "", "", ""], correctOption: 0, topic: "", explanation: "" }}
      onSubmit={async (v) => {
        const { ok, data } = await postJSON({ assessmentId, ...v });
        if (!ok) return data.error ?? "Failed.";
        setKey((k) => k + 1);
        router.refresh();
        return null;
      }}
    />
  );
}

type EditableQuestion = {
  id: string;
  stem: string;
  options: string[];
  correct_option: number;
  topic: string | null;
  explanation: string | null;
};

export function QuestionsAdmin({ questions }: { questions: EditableQuestion[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);

  async function del(id: string) {
    await postJSON({ action: "delete", questionId: id });
    router.refresh();
  }

  if (questions.length === 0) return <p className="text-sm text-faint">No questions yet.</p>;

  return (
    <ol className="space-y-3">
      {questions.map((q, i) => (
        <li key={q.id} className="rounded-xl border border-line/15 bg-surface2 p-4">
          {editing === q.id ? (
            <QuestionFields
              submitLabel="Save changes"
              initial={{
                stem: q.stem,
                options: q.options,
                correctOption: q.correct_option,
                topic: q.topic ?? "",
                explanation: q.explanation ?? "",
              }}
              onCancel={() => setEditing(null)}
              onSubmit={async (v) => {
                const { ok, data } = await postJSON({ action: "update", questionId: q.id, ...v });
                if (!ok) return data.error ?? "Failed.";
                setEditing(null);
                router.refresh();
                return null;
              }}
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium">
                  <span className="text-faint">{i + 1}. </span>
                  {q.stem}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => setEditing(q.id)} className={btnGhost}>
                    Edit
                  </button>
                  <button onClick={() => del(q.id)} className={btnGhost}>
                    Delete
                  </button>
                </div>
              </div>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {q.options.map((opt, oi) => (
                  <li
                    key={oi}
                    className={`rounded-md px-2.5 py-1.5 text-sm ${
                      oi === q.correct_option ? "bg-emerald-500/10 text-emerald-200" : "text-muted"
                    }`}
                  >
                    <span className="mr-2 font-mono text-xs text-faint">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                    {oi === q.correct_option && <span className="ml-2 text-xs">correct</span>}
                  </li>
                ))}
              </ul>
              {q.topic && <p className="mt-2 text-xs uppercase tracking-[0.2em] text-faint">Topic: {q.topic}</p>}
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

export function EditAssessmentForm({
  assessment,
}: {
  assessment: { id: string; title: string; week_number: number | null; duration_minutes: number };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={btnGhost}>
        Edit settings
      </button>
    );
  }

  return (
    <form
      className="w-full rounded-xl border border-line/15 bg-surface2 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const res = await fetch("/api/admin/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            assessmentId: assessment.id,
            title: f.get("title"),
            weekNumber: f.get("weekNumber"),
            durationMinutes: f.get("durationMinutes"),
          }),
        });
        const data = await res.json().catch(() => ({}));
        setLoading(false);
        if (!res.ok) return setErr(data.error ?? "Failed.");
        setOpen(false);
        router.refresh();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <label className={label}>Title</label>
          <input name="title" defaultValue={assessment.title} required className={input} />
        </div>
        <div>
          <label className={label}>Week</label>
          <input name="weekNumber" type="number" min={1} defaultValue={assessment.week_number ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Duration (min)</label>
          <input name="durationMinutes" type="number" min={1} defaultValue={assessment.duration_minutes} className={input} />
        </div>
      </div>
      {err && <p className="mt-2 text-sm text-ember">{err}</p>}
      <div className="mt-3 flex items-center gap-2">
        <button disabled={loading} className={btn}>
          {loading ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
          Cancel
        </button>
      </div>
    </form>
  );
}
