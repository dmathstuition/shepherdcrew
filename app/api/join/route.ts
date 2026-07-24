import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Receives registrations from the site and forwards them to your
 * Google Apps Script web app (set GOOGLE_SCRIPT_URL in .env).
 *
 * When the class portal lands, swap the forward for a database insert
 * and create the member record in the same transaction.
 */

const VALID_PROGRAMS = [
  "Atmosphere of Worship & Praise (AOWAP)",
  "Believers Foundational Class",
  "Making Jesus Famous (MJF)",
  "Campus Invasion",
];

// Crude per-instance throttle. Replace with Upstash/Redis if you deploy to more
// than one region — serverless instances do not share this map.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

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

  // Honeypot — bots fill hidden fields, people don't.
  if (typeof payload.company === "string" && payload.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const program = String(payload.program ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }
  if (!/^[0-9+\s()-]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!VALID_PROGRAMS.includes(program)) {
    return NextResponse.json({ error: "Choose a program." }, { status: 400 });
  }

  const record = { name, phone, email, program, submittedAt: new Date().toISOString() };

  const endpoint = process.env.GOOGLE_SCRIPT_URL;
  if (!endpoint) {
    console.warn("GOOGLE_SCRIPT_URL is not set. Registration logged only:", record);
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const forwarded = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!forwarded.ok) throw new Error(`Upstream responded ${forwarded.status}`);
  } catch (error) {
    console.error("Registration forward failed:", error);
    return NextResponse.json({ error: "Could not save your details." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
