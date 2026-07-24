import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession, ADMIN_COOKIE, verifyAdminSession } from "@/lib/session";

/**
 * Gate the two private route groups:
 *   - /portal/exam*, /portal/result*  → member session required
 *   - /admin/*  (except /admin/login)  → admin session required
 *
 * Sessions are also re-checked server-side on every mutation; the middleware is
 * a first line, never the only one.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const admin = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
    if (admin) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const member = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (member) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/portal";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/portal/exams/:path*",
    "/portal/exam/:path*",
    "/portal/result/:path*",
    // All admin routes except the login and first-admin setup pages.
    "/admin/((?!login|setup).*)",
    "/admin",
  ],
};
