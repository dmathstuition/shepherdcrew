import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getServiceClient, describeDbError } from "@/lib/supabase";
import { hashAccessCode, generateAccessCode } from "@/lib/portal-auth";

/**
 * Server-only admin data access. Admins authenticate with email + password
 * (scrypt-hashed) and manage cohorts, members, assessments, and questions.
 * Everything runs with the service-role client behind the admin session guard.
 */

export type Admin = { id: string; email: string; role: string };

function db() {
  const client = getServiceClient();
  if (!client) throw new Error("Supabase is not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).");
  return client;
}

// ---- password hashing (scrypt, format: scrypt$saltHex$hashHex) ----

export function hashPassword(password: string): string {
  // The hex salt string is used directly as the scrypt salt; seed-admin.mjs
  // does the same, so hashes match across both.
  const saltHex = randomBytes(16).toString("hex");
  const hash = scryptSync(password, saltHex, 64);
  return `scrypt$${saltHex}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const saltHex = parts[1];
  const expected = Uint8Array.from(Buffer.from(parts[2], "hex"));
  const actual = Uint8Array.from(scryptSync(password, saltHex, expected.length));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ---- auth ----

export async function verifyAdminLogin(email: string, password: string): Promise<Admin | null> {
  const { data } = await db()
    .from("admins")
    .select("id, email, role, password_hash")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (!data) return null;
  if (!verifyPassword(password, (data as any).password_hash)) return null;
  return { id: (data as any).id, email: (data as any).email, role: (data as any).role };
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const { data } = await db().from("admins").select("id, email, role").eq("id", id).maybeSingle();
  return (data as Admin) ?? null;
}

// ---- admin management ----

export async function countAdmins(): Promise<number> {
  const { count, error } = await db().from("admins").select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function listAdmins(): Promise<Admin[]> {
  const { data } = await db().from("admins").select("id, email, role").order("email");
  return (data ?? []) as Admin[];
}

/** Create an admin. Reuses the scrypt hashing used by verifyAdminLogin. */
export async function createAdmin(email: string, password: string, role = "admin"): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  const { error } = await db()
    .from("admins")
    .insert({ email: normalized, password_hash: hashPassword(password), role });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) throw new Error("An admin with that email already exists.");
    throw new Error(describeDbError(error));
  }
}

export async function deleteAdmin(id: string): Promise<void> {
  const { error } = await db().from("admins").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- cohorts ----

export type Cohort = { id: string; name: string; slug: string; starts_on: string | null };

export async function listCohorts(): Promise<Cohort[]> {
  const { data } = await db().from("cohorts").select("id, name, slug, starts_on").order("name");
  return (data ?? []) as Cohort[];
}

export async function createCohort(name: string, slug: string, startsOn: string | null): Promise<void> {
  const { error } = await db().from("cohorts").insert({ name, slug, starts_on: startsOn || null });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      throw new Error("A cohort with that name already exists — select it from the list above instead of creating a new one.");
    }
    throw new Error(describeDbError(error));
  }
}

// ---- members ----

export type AdminMember = { id: string; full_name: string; phone: string | null; revoked: boolean; joined_at: string };

export async function listMembers(cohortId: string): Promise<AdminMember[]> {
  const { data } = await db()
    .from("members")
    .select("id, full_name, phone, revoked, joined_at")
    .eq("cohort_id", cohortId)
    .order("joined_at", { ascending: false });
  return (data ?? []) as AdminMember[];
}

/** Create a member and return the one-time access code (never stored in clear). */
export async function createMember(
  cohortId: string,
  fullName: string,
  phone: string | null,
  codePrefix = "SC"
): Promise<{ code: string }> {
  // Retry a couple of times in case of an (unlikely) code-hash collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAccessCode(codePrefix);
    const { error } = await db().from("members").insert({
      cohort_id: cohortId,
      full_name: fullName.trim(),
      phone: phone?.trim() || null,
      access_code_hash: hashAccessCode(code),
    });
    if (!error) return { code };
    if (!/duplicate|unique/i.test(error.message)) throw new Error(describeDbError(error));
  }
  throw new Error("Could not generate a unique access code. Try again.");
}

export async function setMemberRevoked(memberId: string, revoked: boolean): Promise<void> {
  const { error } = await db().from("members").update({ revoked }).eq("id", memberId);
  if (error) throw new Error(error.message);
}

// ---- assessments ----

export type AdminAssessment = {
  id: string;
  cohort_id: string;
  title: string;
  week_number: number | null;
  duration_minutes: number;
  is_published: boolean;
};

export async function listAssessments(cohortId: string): Promise<AdminAssessment[]> {
  const { data } = await db()
    .from("assessments")
    .select("id, cohort_id, title, week_number, duration_minutes, is_published")
    .eq("cohort_id", cohortId)
    .order("week_number", { ascending: true });
  return (data ?? []) as AdminAssessment[];
}

export async function createAssessment(input: {
  cohortId: string;
  title: string;
  weekNumber: number | null;
  durationMinutes: number;
  closesAt: string | null;
}): Promise<{ id: string }> {
  const { data, error } = await db()
    .from("assessments")
    .insert({
      cohort_id: input.cohortId,
      title: input.title.trim(),
      week_number: input.weekNumber,
      duration_minutes: input.durationMinutes,
      opens_at: new Date().toISOString(),
      closes_at: input.closesAt || null,
      is_published: false,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: (data as any).id };
}

export async function setAssessmentPublished(id: string, isPublished: boolean): Promise<void> {
  const { error } = await db().from("assessments").update({ is_published: isPublished }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateAssessment(
  id: string,
  input: { title: string; weekNumber: number | null; durationMinutes: number }
): Promise<void> {
  if (input.title.trim().length < 2) throw new Error("Enter a title.");
  if (input.durationMinutes < 1) throw new Error("Duration must be at least 1 minute.");
  const { error } = await db()
    .from("assessments")
    .update({
      title: input.title.trim(),
      week_number: input.weekNumber,
      duration_minutes: input.durationMinutes,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAssessmentBasic(id: string): Promise<AdminAssessment | null> {
  const { data } = await db()
    .from("assessments")
    .select("id, cohort_id, title, week_number, duration_minutes, is_published")
    .eq("id", id)
    .maybeSingle();
  return (data as AdminAssessment) ?? null;
}

// ---- questions ----

export type AdminQuestion = {
  id: string;
  stem: string;
  options: string[];
  correct_option: number;
  topic: string | null;
  position: number;
  explanation: string | null;
};

export async function listQuestions(assessmentId: string): Promise<AdminQuestion[]> {
  const { data } = await db()
    .from("questions")
    .select("id, stem, options, correct_option, topic, position, explanation")
    .eq("assessment_id", assessmentId)
    .order("position", { ascending: true });
  return (data ?? []) as AdminQuestion[];
}

export async function addQuestion(input: {
  assessmentId: string;
  stem: string;
  options: string[];
  correctOption: number;
  explanation: string | null;
  topic: string | null;
}): Promise<void> {
  const cleaned = input.options.map((o) => o.trim()).filter((o) => o.length > 0);
  if (cleaned.length < 2) throw new Error("A question needs at least two options.");
  if (input.correctOption < 0 || input.correctOption >= cleaned.length) {
    throw new Error("The correct option is out of range.");
  }
  // Append after the current last position.
  const { data: last } = await db()
    .from("questions")
    .select("position")
    .eq("assessment_id", input.assessmentId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos = ((last as any)?.position ?? 0) + 1;

  const { error } = await db().from("questions").insert({
    assessment_id: input.assessmentId,
    stem: input.stem.trim(),
    options: cleaned,
    correct_option: input.correctOption,
    explanation: input.explanation?.trim() || null,
    topic: input.topic?.trim() || null,
    position: nextPos,
  });
  if (error) throw new Error(error.message);
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await db().from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type FullQuestion = AdminQuestion & { explanation: string | null };

export async function getQuestionById(id: string): Promise<FullQuestion | null> {
  const { data } = await db()
    .from("questions")
    .select("id, stem, options, correct_option, topic, position, explanation")
    .eq("id", id)
    .maybeSingle();
  return (data as FullQuestion) ?? null;
}

export async function updateQuestion(
  id: string,
  input: { stem: string; options: string[]; correctOption: number; explanation: string | null; topic: string | null }
): Promise<void> {
  const cleaned = input.options.map((o) => o.trim()).filter((o) => o.length > 0);
  if (input.stem.trim().length < 3) throw new Error("Enter the question.");
  if (cleaned.length < 2) throw new Error("A question needs at least two options.");
  if (input.correctOption < 0 || input.correctOption >= cleaned.length) {
    throw new Error("The correct option is out of range.");
  }
  const { error } = await db()
    .from("questions")
    .update({
      stem: input.stem.trim(),
      options: cleaned,
      correct_option: input.correctOption,
      explanation: input.explanation?.trim() || null,
      topic: input.topic?.trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- results & analytics ----

export type ResultRow = { memberName: string; score: number | null; total: number | null; submittedAt: string | null };

export async function getResults(assessmentId: string): Promise<ResultRow[]> {
  const { data: attempts } = await db()
    .from("attempts")
    .select("member_id, score, total, submitted_at")
    .eq("assessment_id", assessmentId)
    .order("submitted_at", { ascending: false });

  const rows = (attempts ?? []) as any[];
  if (rows.length === 0) return [];

  const { data: members } = await db()
    .from("members")
    .select("id, full_name")
    .in("id", Array.from(new Set(rows.map((r) => r.member_id))));
  const nameById = new Map((members ?? []).map((m: any) => [m.id, m.full_name]));

  return rows.map((r) => ({
    memberName: nameById.get(r.member_id) ?? "Unknown",
    score: r.score,
    total: r.total,
    submittedAt: r.submitted_at,
  }));
}

export type TopicStat = { topic: string; correct: number; total: number; pct: number };

/** Percentage correct per question topic across all submitted attempts —
 *  the diagnostic the whole portal exists for. */
export async function getTopicAnalytics(assessmentId: string): Promise<TopicStat[]> {
  const { data: questions } = await db()
    .from("questions")
    .select("id, topic")
    .eq("assessment_id", assessmentId);
  const topicByQ = new Map((questions ?? []).map((q: any) => [q.id, q.topic ?? "Untagged"]));
  if (topicByQ.size === 0) return [];

  const { data: submitted } = await db()
    .from("attempts")
    .select("id")
    .eq("assessment_id", assessmentId)
    .not("submitted_at", "is", null);
  const attemptIds = (submitted ?? []).map((a: any) => a.id);
  if (attemptIds.length === 0) return [];

  const { data: answers } = await db()
    .from("answers")
    .select("question_id, is_correct")
    .in("attempt_id", attemptIds);

  const acc = new Map<string, { correct: number; total: number }>();
  for (const a of (answers ?? []) as any[]) {
    const topic = topicByQ.get(a.question_id) ?? "Untagged";
    const cur = acc.get(topic) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (a.is_correct) cur.correct += 1;
    acc.set(topic, cur);
  }

  return Array.from(acc.entries())
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct);
}
