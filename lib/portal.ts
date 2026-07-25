import "server-only";
import { getServiceClient } from "@/lib/supabase";
import { hashAccessCode } from "@/lib/portal-auth";

/**
 * Server-only data access for the class portal. Everything here runs with the
 * service-role client, so it is the single place where correct answers, timing,
 * and scoring are handled. Nothing in this module may be imported by a client
 * component (the "server-only" guard enforces that at build time).
 */

export type Cohort = { id: string; name: string; slug: string; starts_on: string | null };
export type Member = { id: string; cohort_id: string; full_name: string; revoked: boolean };
export type Assessment = {
  id: string;
  cohort_id: string;
  title: string;
  week_number: number | null;
  duration_minutes: number;
  opens_at: string | null;
  closes_at: string | null;
  is_published: boolean;
};
export type Question = {
  id: string;
  assessment_id: string;
  stem: string;
  type: "single";
  options: string[];
  correct_option: number;
  explanation: string | null;
  topic: string | null;
  position: number;
};
/** Question shape safe to send to the browser — no answer key. */
export type ClientQuestion = { id: string; stem: string; type: "single"; options: string[] };
export type Attempt = {
  id: string;
  member_id: string;
  assessment_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total: number | null;
  question_order: string[];
};
export type Answer = { question_id: string; chosen_option: number; is_correct: boolean };

function db() {
  const client = getServiceClient();
  if (!client) throw new Error("Supabase is not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).");
  return client;
}

export function toClientQuestion(q: Question): ClientQuestion {
  return { id: q.id, stem: q.stem, type: q.type, options: q.options };
}

/** True when an assessment is currently takeable (published and within window). */
export function isOpen(a: Assessment, now = Date.now()): boolean {
  if (!a.is_published) return false;
  if (a.opens_at && now < Date.parse(a.opens_at)) return false;
  if (a.closes_at && now > Date.parse(a.closes_at)) return false;
  return true;
}

/** The moment an in-progress attempt must end: the earlier of the per-attempt
 *  timer and the assessment's own close time. Computed server-side only. */
export function attemptDeadline(a: Assessment, attempt: Attempt): number {
  const byTimer = Date.parse(attempt.started_at) + a.duration_minutes * 60_000;
  const byClose = a.closes_at ? Date.parse(a.closes_at) : Infinity;
  return Math.min(byTimer, byClose);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Verify a member by access code, then confirm the name matches (two factors:
 *  something they were given + something they know). */
export async function verifyMemberLogin(fullName: string, code: string): Promise<Member | null> {
  const hash = hashAccessCode(code);
  const { data, error } = await db()
    .from("members")
    .select("id, cohort_id, full_name, revoked")
    .eq("access_code_hash", hash)
    .maybeSingle();
  if (error || !data) return null;
  const member = data as Member;
  if (member.revoked) return null;
  if (member.full_name.trim().toLowerCase() !== fullName.trim().toLowerCase()) return null;
  return member;
}

export async function getMemberById(id: string): Promise<Member | null> {
  const { data } = await db()
    .from("members")
    .select("id, cohort_id, full_name, revoked")
    .eq("id", id)
    .maybeSingle();
  return (data as Member) ?? null;
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

/** Pass mark, as a percentage. Configurable here. */
export const PASS_PCT = 50;

export type AssessmentListItem = Assessment & {
  attempt: Pick<Attempt, "id" | "submitted_at" | "score" | "total"> | null;
  open: boolean;
  question_count: number;
};

export async function getCohortName(cohortId: string): Promise<string | null> {
  const { data } = await db().from("cohorts").select("name").eq("id", cohortId).maybeSingle();
  return (data as { name: string } | null)?.name ?? null;
}

export async function listAssessmentsForMember(member: Member): Promise<AssessmentListItem[]> {
  const [{ data: assessments }, { data: attempts }] = await Promise.all([
    db()
      .from("assessments")
      .select("id, cohort_id, title, week_number, duration_minutes, opens_at, closes_at, is_published")
      .eq("cohort_id", member.cohort_id)
      .eq("is_published", true)
      .order("week_number", { ascending: true }),
    db()
      .from("attempts")
      .select("id, member_id, assessment_id, submitted_at, score, total")
      .eq("member_id", member.id),
  ]);

  const list = (assessments ?? []) as Assessment[];

  // Question counts for the visible assessments (one query).
  const counts = new Map<string, number>();
  if (list.length > 0) {
    const { data: qrows } = await db()
      .from("questions")
      .select("assessment_id")
      .in("assessment_id", list.map((a) => a.id));
    for (const r of (qrows ?? []) as { assessment_id: string }[]) {
      counts.set(r.assessment_id, (counts.get(r.assessment_id) ?? 0) + 1);
    }
  }

  const byAssessment = new Map((attempts ?? []).map((a: any) => [a.assessment_id, a]));
  return list.map((a) => ({
    ...a,
    open: isOpen(a),
    question_count: counts.get(a.id) ?? 0,
    attempt: byAssessment.get(a.id)
      ? {
          id: byAssessment.get(a.id).id,
          submitted_at: byAssessment.get(a.id).submitted_at,
          score: byAssessment.get(a.id).score,
          total: byAssessment.get(a.id).total,
        }
      : null,
  }));
}

export async function getAssessment(id: string): Promise<Assessment | null> {
  const { data } = await db()
    .from("assessments")
    .select("id, cohort_id, title, week_number, duration_minutes, opens_at, closes_at, is_published")
    .eq("id", id)
    .maybeSingle();
  return (data as Assessment) ?? null;
}

async function getQuestions(assessmentId: string): Promise<Question[]> {
  const { data } = await db()
    .from("questions")
    .select("id, assessment_id, stem, type, options, correct_option, explanation, topic, position")
    .eq("assessment_id", assessmentId)
    .order("position", { ascending: true });
  return (data ?? []) as Question[];
}

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getAttemptForMember(memberId: string, assessmentId: string): Promise<Attempt | null> {
  const { data } = await db()
    .from("attempts")
    .select("id, member_id, assessment_id, started_at, submitted_at, score, total, question_order")
    .eq("member_id", memberId)
    .eq("assessment_id", assessmentId)
    .maybeSingle();
  return (data as Attempt) ?? null;
}

export async function getAttemptById(id: string): Promise<Attempt | null> {
  const { data } = await db()
    .from("attempts")
    .select("id, member_id, assessment_id, started_at, submitted_at, score, total, question_order")
    .eq("id", id)
    .maybeSingle();
  return (data as Attempt) ?? null;
}

/**
 * Return the member's existing attempt, or create one (stamping started_at and
 * a shuffled question order server-side). The unique (member, assessment)
 * constraint means a race just returns the row that won.
 */
export async function startOrGetAttempt(
  member: Member,
  assessment: Assessment
): Promise<{ attempt: Attempt; questions: Question[] }> {
  const questions = await getQuestions(assessment.id);
  let attempt = await getAttemptForMember(member.id, assessment.id);

  if (!attempt) {
    const order = shuffle(questions.map((q) => q.id));
    const { data, error } = await db()
      .from("attempts")
      .insert({ member_id: member.id, assessment_id: assessment.id, question_order: order, total: questions.length })
      .select("id, member_id, assessment_id, started_at, submitted_at, score, total, question_order")
      .single();
    if (error) {
      // Likely a unique-violation race — fetch the winner.
      attempt = await getAttemptForMember(member.id, assessment.id);
      if (!attempt) throw error;
    } else {
      attempt = data as Attempt;
    }
  }
  return { attempt, questions };
}

export async function getSavedAnswers(attemptId: string): Promise<Answer[]> {
  const { data } = await db()
    .from("answers")
    .select("question_id, chosen_option, is_correct")
    .eq("attempt_id", attemptId);
  return (data ?? []) as Answer[];
}

/**
 * Autosave a single answer. Rejects if the attempt is already submitted or past
 * its server-side deadline. Correctness is computed here and stored, but never
 * returned to the caller.
 */
export async function saveAnswer(
  member: Member,
  attemptId: string,
  questionId: string,
  chosenOption: number
): Promise<{ ok: true } | { ok: false; reason: "not_found" | "forbidden" | "closed" | "bad_question" }> {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) return { ok: false, reason: "not_found" };
  if (attempt.member_id !== member.id) return { ok: false, reason: "forbidden" };
  if (attempt.submitted_at) return { ok: false, reason: "closed" };

  const assessment = await getAssessment(attempt.assessment_id);
  if (!assessment) return { ok: false, reason: "not_found" };
  if (Date.now() > attemptDeadline(assessment, attempt)) return { ok: false, reason: "closed" };

  const { data: q } = await db()
    .from("questions")
    .select("id, options, correct_option")
    .eq("id", questionId)
    .eq("assessment_id", attempt.assessment_id)
    .maybeSingle();
  if (!q) return { ok: false, reason: "bad_question" };
  const options = (q as any).options as string[];
  if (!Number.isInteger(chosenOption) || chosenOption < 0 || chosenOption >= options.length) {
    return { ok: false, reason: "bad_question" };
  }

  const isCorrect = chosenOption === (q as any).correct_option;
  const { error } = await db()
    .from("answers")
    .upsert(
      { attempt_id: attemptId, question_id: questionId, chosen_option: chosenOption, is_correct: isCorrect, answered_at: new Date().toISOString() },
      { onConflict: "attempt_id,question_id" }
    );
  if (error) return { ok: false, reason: "not_found" };
  return { ok: true };
}

/** Score and close an attempt from stored answers. Idempotent-ish: a second
 *  submit just returns the already-computed score. */
export async function submitAttempt(
  member: Member,
  attemptId: string
): Promise<{ ok: true; attemptId: string } | { ok: false; reason: "not_found" | "forbidden" }> {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) return { ok: false, reason: "not_found" };
  if (attempt.member_id !== member.id) return { ok: false, reason: "forbidden" };
  if (attempt.submitted_at) return { ok: true, attemptId };

  const answers = await getSavedAnswers(attemptId);
  const score = answers.filter((a) => a.is_correct).length;
  const total = attempt.total ?? attempt.question_order.length;

  await db()
    .from("attempts")
    .update({ submitted_at: new Date().toISOString(), score, total })
    .eq("id", attemptId)
    .is("submitted_at", null); // don't overwrite an earlier submission

  return { ok: true, attemptId };
}

// ---------------------------------------------------------------------------
// Results (answer key is allowed here — only after submission)
// ---------------------------------------------------------------------------

export type ResultQuestion = {
  stem: string;
  options: string[];
  correct_option: number;
  chosen_option: number | null;
  is_correct: boolean;
  explanation: string | null;
  topic: string | null;
};
export type Result = {
  assessmentTitle: string;
  score: number;
  total: number;
  questions: ResultQuestion[];
};

export async function getResult(member: Member, attemptId: string): Promise<Result | null> {
  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.member_id !== member.id || !attempt.submitted_at) return null;

  const assessment = await getAssessment(attempt.assessment_id);
  if (!assessment) return null;
  const questions = await getQuestions(attempt.assessment_id);
  const answers = await getSavedAnswers(attemptId);
  const chosen = new Map(answers.map((a) => [a.question_id, a]));

  const order = attempt.question_order.length ? attempt.question_order : questions.map((q) => q.id);
  const qById = new Map(questions.map((q) => [q.id, q]));

  const resultQuestions: ResultQuestion[] = order
    .map((id) => qById.get(id))
    .filter((q): q is Question => Boolean(q))
    .map((q) => {
      const a = chosen.get(q.id);
      return {
        stem: q.stem,
        options: q.options,
        correct_option: q.correct_option,
        chosen_option: a ? a.chosen_option : null,
        is_correct: a ? a.is_correct : false,
        explanation: q.explanation,
        topic: q.topic,
      };
    });

  return {
    assessmentTitle: assessment.title,
    score: attempt.score ?? 0,
    total: attempt.total ?? resultQuestions.length,
    questions: resultQuestions,
  };
}
