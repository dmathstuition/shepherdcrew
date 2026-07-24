import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/current-admin";
import { createAssessment, setAssessmentPublished, updateAssessment, deleteAssessment } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Publish / unpublish toggle.
  if (payload.action === "publish" || payload.action === "unpublish") {
    const id = String(payload.assessmentId ?? "");
    if (!id) return NextResponse.json({ error: "Missing assessment." }, { status: 400 });
    try {
      await setAssessmentPublished(id, payload.action === "publish");
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Delete an assessment (and its questions/attempts/answers).
  if (payload.action === "delete") {
    const id = String(payload.assessmentId ?? "");
    if (!id) return NextResponse.json({ error: "Missing assessment." }, { status: 400 });
    try {
      await deleteAssessment(id);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Edit assessment settings.
  if (payload.action === "update") {
    const id = String(payload.assessmentId ?? "");
    if (!id) return NextResponse.json({ error: "Missing assessment." }, { status: 400 });
    const title = String(payload.title ?? "").trim();
    const weekNumber = payload.weekNumber != null && payload.weekNumber !== "" ? Number(payload.weekNumber) : null;
    const durationMinutes = Number(payload.durationMinutes) || 20;
    try {
      await updateAssessment(id, {
        title,
        weekNumber: weekNumber != null && Number.isFinite(weekNumber) ? weekNumber : null,
        durationMinutes,
      });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Create assessment.
  const cohortId = String(payload.cohortId ?? "");
  const title = String(payload.title ?? "").trim();
  const weekNumber = payload.weekNumber != null && payload.weekNumber !== "" ? Number(payload.weekNumber) : null;
  const durationMinutes = Number(payload.durationMinutes) || 20;
  const closesAt = String(payload.closesAt ?? "").trim() || null;

  if (!cohortId) return NextResponse.json({ error: "Choose a cohort." }, { status: 400 });
  if (title.length < 2) return NextResponse.json({ error: "Enter a title." }, { status: 400 });
  if (durationMinutes < 1) return NextResponse.json({ error: "Duration must be at least 1 minute." }, { status: 400 });

  try {
    const { id } = await createAssessment({
      cohortId,
      title,
      weekNumber: weekNumber != null && Number.isFinite(weekNumber) ? weekNumber : null,
      durationMinutes,
      closesAt: closesAt ? new Date(closesAt).toISOString() : null,
    });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
