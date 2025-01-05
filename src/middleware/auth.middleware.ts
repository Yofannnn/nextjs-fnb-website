import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/user.type";
import { verifyToken } from "@/services/session.service";

export async function authPageMiddleware(request: NextRequest) {
  const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;
  if (!SESSION_COOKIE_NAME) throw new Error("SESSION_COOKIE_NAME is not defined in environment variables.");
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyToken(cookie);

  if (session && session.role === UserRole.Member) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && session.role === UserRole.Admin) {
    return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }
  return null;
}
