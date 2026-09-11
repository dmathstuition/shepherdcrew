import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * AOWAP 2026 registration intake.
 *
 * Validates the submission server-side, then forwards it to a Google Apps
 * Script Web App which (a) appends the row to a Google Sheet and (b) sends the
 * registrant an acknowledgement email. Set the deployed Web App URL in the
 * environment as AOWAP_APPS_SCRIPT_URL. See docs/aowap-apps-script.md for the
 * script and step-by-step deployment.
 *
 * Forwarding happens server-to-server, so there are no browser CORS issues and
 * the Apps Script URL is never exposed to the client.
 */

const GENDERS = ["Male", "Female"];
const OCCUPATIONS = [
  "Student",
  "Business owner / Entrepreneur",
  "Employed / Professional",
  "Unemployed",
  "Other",
];
const AGE_RANGES = ["15 – 25", "26 – 30", "31 – 35", "36 and above"];
const YES_NO = ["Yes", "No"];

// Crude per-instance throttle (best-effort; serverless instances don't share it).
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

const str = (v: unknown) => String(v ?? "").trim();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields, people don't. Pretend success.
  if (str(payload.company).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const firstName = str(payload.firstName);
  const lastName = str(payload.lastName);
  const email = str(payload.email);
  const phone = str(payload.phone);
  const gender = str(payload.gender);
  const city = str(payload.city);
  const denomination = str(payload.denomination);
  const occupation = str(payload.occupation);
  const ageRange = str(payload.ageRange);
  const attendedBefore = str(payload.attendedBefore);
  const expectations = str(payload.expectations);

  if (firstName.length < 2) return NextResponse.json({ error: "Enter your first name." }, { status: 400 });
  if (lastName.length < 2) return NextResponse.json({ error: "Enter your last name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!/^[0-9+\s()-]{7,20}$/.test(phone))
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!GENDERS.includes(gender)) return NextResponse.json({ error: "Select your gender." }, { status: 400 });
  if (city.length < 2) return NextResponse.json({ error: "Enter your city." }, { status: 400 });
  if (denomination.length < 2)
    return NextResponse.json({ error: "Enter your denomination or fellowship." }, { status: 400 });
  if (!OCCUPATIONS.includes(occupation))
    return NextResponse.json({ error: "Select your occupation." }, { status: 400 });
  if (!AGE_RANGES.includes(ageRange))
    return NextResponse.json({ error: "Select your age range." }, { status: 400 });
  if (!YES_NO.includes(attendedBefore))
    return NextResponse.json({ error: "Let us know if you've attended before." }, { status: 400 });
  if (expectations.length < 3)
    return NextResponse.json({ error: "Share your expectations for AOWAP 2026." }, { status: 400 });

  const record = {
    event: "AOWAP 2026",
    firstName,
    lastName,
    email,
    phone,
    gender,
    city,
    denomination,
    occupation,
    ageRange,
    attendedBefore,
    expectations,
    submittedAt: new Date().toISOString(),
    ip,
  };

  const endpoint = process.env.AOWAP_APPS_SCRIPT_URL;
  if (!endpoint) {
    console.warn("AOWAP_APPS_SCRIPT_URL is not set. Registration not recorded:", record.email);
    return NextResponse.json(
      { error: "Registration isn’t open yet. Please try again shortly." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      // text/plain avoids a CORS preflight and is what the Apps Script reads
      // from e.postData.contents; server-to-server this is simply the body.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(record),
    });

    if (!res.ok) {
      console.error("Apps Script responded", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "Could not save your registration. Please try again." }, { status: 502 });
    }

    // Apps Script returns JSON like { ok: true }; tolerate non-JSON too.
    const data = (await res.json().catch(() => ({ ok: true }))) as { ok?: boolean; error?: string };
    if (data.ok === false) {
      return NextResponse.json({ error: data.error || "Could not save your registration." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to reach Apps Script:", err);
    return NextResponse.json({ error: "Could not save your registration. Please try again." }, { status: 502 });
  }
}
