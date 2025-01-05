import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/services/session.service";
import { UserRole } from "@/types/user.type";

export async function dashboardPageMiddleware(request: NextRequest) {
  const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;
  if (!SESSION_COOKIE_NAME) throw new Error("SESSION_COOKIE_NAME is not defined in environment variables.");
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyToken(cookie);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.role === UserRole.Member) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session.role === UserRole.Admin) {
    return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }
  return null;
}
