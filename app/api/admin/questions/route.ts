import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/current-admin";
import { addQuestion, deleteQuestion, updateQuestion } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (payload.action === "delete") {
    const id = String(payload.questionId ?? "");
    if (!id) return NextResponse.json({ error: "Missing question." }, { status: 400 });
    try {
      await deleteQuestion(id);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (payload.action === "update") {
    const id = String(payload.questionId ?? "");
    if (!id) return NextResponse.json({ error: "Missing question." }, { status: 400 });
    const stem = String(payload.stem ?? "").trim();
    const options = Array.isArray(payload.options) ? payload.options.map((o) => String(o)) : [];
    const correctOption = Number(payload.correctOption);
    const explanation = String(payload.explanation ?? "").trim() || null;
    const topic = String(payload.topic ?? "").trim() || null;
    if (!Number.isInteger(correctOption)) {
      return NextResponse.json({ error: "Mark the correct option." }, { status: 400 });
    }
    try {
      await updateQuestion(id, { stem, options, correctOption, explanation, topic });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  const assessmentId = String(payload.assessmentId ?? "");
  const stem = String(payload.stem ?? "").trim();
  const options = Array.isArray(payload.options) ? payload.options.map((o) => String(o)) : [];
  const correctOption = Number(payload.correctOption);
  const explanation = String(payload.explanation ?? "").trim() || null;
  const topic = String(payload.topic ?? "").trim() || null;

  if (!assessmentId) return NextResponse.json({ error: "Missing assessment." }, { status: 400 });
  if (stem.length < 3) return NextResponse.json({ error: "Enter the question." }, { status: 400 });
  if (!Number.isInteger(correctOption)) return NextResponse.json({ error: "Mark the correct option." }, { status: 400 });

  try {
    await addQuestion({ assessmentId, stem, options, correctOption, explanation, topic });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
