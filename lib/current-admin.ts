import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/session";
import { getAdminById, type Admin } from "@/lib/admin";

/** Resolve the logged-in admin from the admin session cookie, or null. */
export async function currentAdmin(): Promise<Admin | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminSession(token);
  if (!session) return null;
  return getAdminById(session.aid);
}
