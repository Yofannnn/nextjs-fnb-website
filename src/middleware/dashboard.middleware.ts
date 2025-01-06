import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/services/session.service";
import { UserRole } from "@/types/user.type";

export async function dashboardMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;
  if (!SESSION_COOKIE_NAME) throw new Error("SESSION_COOKIE_NAME is not defined in environment variables.");
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyToken(cookie);

  if (!session) {
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.role === UserRole.Member) {
    if (pathname.startsWith("/dashboard")) return NextResponse.next();
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session.role === UserRole.Admin) {
    if (pathname.startsWith("/admin-dashboard")) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }
}
