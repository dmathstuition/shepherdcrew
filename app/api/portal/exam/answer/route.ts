import { NextResponse } from "next/server";
import { currentMember } from "@/lib/current-member";
import { saveAnswer } from "@/lib/portal";

export const runtime = "nodejs";

/** Autosave one answer. The correct option is never in the request or response. */
export async function POST(request: Request) {
  const member = await currentMember();
  if (!member) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const attemptId = String(payload.attemptId ?? "");
  const questionId = String(payload.questionId ?? "");
  const chosenOption = Number(payload.chosenOption);
  if (!attemptId || !questionId || !Number.isInteger(chosenOption)) {
    return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  }

  const result = await saveAnswer(member, attemptId, questionId, chosenOption);
  if (!result.ok) {
    const status = result.reason === "forbidden" ? 403 : result.reason === "closed" ? 409 : 400;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ ok: true });
}
