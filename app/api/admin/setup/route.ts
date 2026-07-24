import { NextResponse } from "next/server";
import { countAdmins, createAdmin, verifyAdminLogin } from "@/lib/admin";
import { signAdminSession, ADMIN_COOKIE, adminCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

// Per-instance throttle to blunt guessing of the setup token.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;

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

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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

  const email = String(payload.email ?? "").trim();
  const password = String(payload.password ?? "");
  const token = String(payload.token ?? "");

  // Gate 1: the setup token must be configured on the host and match.
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "Setup is disabled. Set ADMIN_SETUP_TOKEN in your host environment first." },
      { status: 403 }
    );
  }
  if (!token || !timingSafeEqual(token, expected)) {
    return NextResponse.json({ error: "Invalid setup token." }, { status: 403 });
  }

  // Gate 2: setup is only for the first admin.
  let existing: number;
  try {
    existing = await countAdmins();
  } catch (error) {
    console.error("Admin setup unavailable:", error);
    return NextResponse.json({ error: "Portal is not available right now." }, { status: 503 });
  }
  if (existing > 0) {
    return NextResponse.json({ error: "An admin already exists. Use the sign-in page." }, { status: 409 });
  }

  try {
    await createAdmin(email, password);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  // Sign the new admin in immediately.
  const admin = await verifyAdminLogin(email, password);
  if (!admin) {
    // Created but couldn't sign in — let them use the login page.
    return NextResponse.json({ ok: true, signedIn: false });
  }
  const jwt = await signAdminSession({ aid: admin.id, role: admin.role });
  const res = NextResponse.json({ ok: true, signedIn: true });
  res.cookies.set(ADMIN_COOKIE, jwt, adminCookieOptions());
  return res;
}
