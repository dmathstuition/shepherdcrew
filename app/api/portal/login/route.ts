import { NextResponse } from "next/server";
import { verifyMemberLogin } from "@/lib/portal";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

// Per-instance throttle to blunt access-code guessing.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const fullName = String(payload.fullName ?? "").trim();
  const code = String(payload.code ?? "").trim();
  if (fullName.length < 2 || code.length < 4) {
    return NextResponse.json({ error: "Enter your full name and access code." }, { status: 400 });
  }

  let member;
  try {
    member = await verifyMemberLogin(fullName, code);
  } catch (error) {
    console.error("Portal login failed:", error);
    return NextResponse.json({ error: "Portal is not available right now." }, { status: 503 });
  }
  if (!member) {
    // Deliberately vague — don't reveal whether the name or the code was wrong.
    return NextResponse.json({ error: "That name and code don't match." }, { status: 401 });
  }

  const token = await signSession({ mid: member.id, cid: member.cohort_id });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
