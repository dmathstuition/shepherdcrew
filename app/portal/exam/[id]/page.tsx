import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/current-member";
import {
  getAssessment,
  isOpen,
  startOrGetAttempt,
  getSavedAnswers,
  attemptDeadline,
  toClientQuestion,
  type Question,
} from "@/lib/portal";
import { ExamRunner } from "./ExamRunner";

export const metadata: Metadata = {
  title: "Assessment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ExamPage({ params }: { params: { id: string } }) {
  const member = await currentMember();
  if (!member) redirect("/portal");

  const assessment = await getAssessment(params.id);
  if (!assessment || assessment.cohort_id !== member.cohort_id) redirect("/portal/exams");
  if (!isOpen(assessment)) redirect("/portal/exams");

  const { attempt, questions } = await startOrGetAttempt(member, assessment);

  // Already handed in — go straight to the result.
  if (attempt.submitted_at) redirect(`/portal/result/${attempt.id}`);

  // Order questions by the per-attempt shuffle, and strip the answer key.
  const byId = new Map(questions.map((q) => [q.id, q]));
  const ordered = (attempt.question_order.length ? attempt.question_order : questions.map((q) => q.id))
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q))
    .map(toClientQuestion);

  const saved = await getSavedAnswers(attempt.id);
  const savedMap: Record<string, number> = {};
  for (const a of saved) savedMap[a.question_id] = a.chosen_option;

  return (
    <ExamRunner
      attemptId={attempt.id}
      title={assessment.title}
      questions={ordered}
      saved={savedMap}
      deadlineMs={attemptDeadline(assessment, attempt)}
    />
  );
}
