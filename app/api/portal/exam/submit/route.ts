import { NextResponse } from "next/server";
import { currentMember } from "@/lib/current-member";
import { submitAttempt } from "@/lib/portal";

export const runtime = "nodejs";

/** Close and score an attempt. Scoring happens entirely server-side. */
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
  if (!attemptId) return NextResponse.json({ error: "Missing attempt." }, { status: 400 });

  const result = await submitAttempt(member, attemptId);
  if (!result.ok) {
    const status = result.reason === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ ok: true, attemptId: result.attemptId });
}
