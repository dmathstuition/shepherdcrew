import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getMemberById, type Member } from "@/lib/portal";

/**
 * Resolve the logged-in member from the session cookie, or null. Used by portal
 * server components and API routes. The middleware already blocks unauthenticated
 * access to the exam pages, but every mutation re-checks here — never trust the
 * middleware alone for authorisation.
 */
export async function currentMember(): Promise<Member | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  const member = await getMemberById(session.mid);
  if (!member || member.revoked) return null;
  return member;
}
