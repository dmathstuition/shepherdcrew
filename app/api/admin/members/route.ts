import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/current-admin";
import { createMember, setMemberRevoked } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Revoke / restore toggle.
  if (payload.action === "revoke" || payload.action === "restore") {
    const memberId = String(payload.memberId ?? "");
    if (!memberId) return NextResponse.json({ error: "Missing member." }, { status: 400 });
    try {
      await setMemberRevoked(memberId, payload.action === "revoke");
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Create member → return the one-time access code.
  const cohortId = String(payload.cohortId ?? "");
  const fullName = String(payload.fullName ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const prefix = String(payload.codePrefix ?? "SC").trim() || "SC";
  if (!cohortId) return NextResponse.json({ error: "Choose a cohort." }, { status: 400 });
  if (fullName.length < 2) return NextResponse.json({ error: "Enter the member's full name." }, { status: 400 });

  try {
    const { code } = await createMember(cohortId, fullName, phone || null, prefix.toUpperCase().slice(0, 4));
    return NextResponse.json({ ok: true, code, fullName });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
