import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/current-admin";
import { createCohort, updateCohort, deleteCohort } from "@/lib/admin";

export const runtime = "nodejs";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (payload.action === "delete") {
    const id = String(payload.cohortId ?? "");
    if (!id) return NextResponse.json({ error: "Missing cohort." }, { status: 400 });
    try {
      await deleteCohort(id);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (payload.action === "update") {
    const id = String(payload.cohortId ?? "");
    if (!id) return NextResponse.json({ error: "Missing cohort." }, { status: 400 });
    try {
      await updateCohort(id, String(payload.name ?? ""), String(payload.startsOn ?? "").trim() || null);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  const name = String(payload.name ?? "").trim();
  if (name.length < 2) return NextResponse.json({ error: "Enter a cohort name." }, { status: 400 });
  const slug = String(payload.slug ?? "").trim() || slugify(name);
  const startsOn = String(payload.startsOn ?? "").trim() || null;

  try {
    await createCohort(name, slug, startsOn);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
