import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/current-admin";
import { createAdmin, deleteAdmin, countAdmins, resetAdminPassword } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (payload.action === "delete") {
    const id = String(payload.adminId ?? "");
    if (!id) return NextResponse.json({ error: "Missing admin." }, { status: 400 });
    if (id === me.id) return NextResponse.json({ error: "You can't remove yourself." }, { status: 400 });
    if ((await countAdmins()) <= 1) {
      return NextResponse.json({ error: "Can't remove the last admin." }, { status: 400 });
    }
    try {
      await deleteAdmin(id);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (payload.action === "reset") {
    const id = String(payload.adminId ?? "");
    const password = String(payload.password ?? "");
    if (!id) return NextResponse.json({ error: "Missing admin." }, { status: 400 });
    try {
      await resetAdminPassword(id, password);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Create a new admin.
  const email = String(payload.email ?? "").trim();
  const password = String(payload.password ?? "");
  try {
    await createAdmin(email, password);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
