import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * Gate the member-only portal routes. The exam pages and their result pages
 * require a valid, unexpired session cookie; without one the visitor is bounced
 * to the access-code login at /portal. The login page itself is left open.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/portal";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/portal/exams/:path*", "/portal/exam/:path*", "/portal/result/:path*"],
};
