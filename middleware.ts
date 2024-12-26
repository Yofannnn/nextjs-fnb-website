import { NextRequest, NextResponse } from "next/server";
import { adminDashboardMiddleware, userDashboardMiddleware } from "@/middleware/dashboard.middleware";
import { authPageMiddleware } from "@/middleware/auth.middleware";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const response = await userDashboardMiddleware(request);
    if (response) return response;
  }

  if (pathname.startsWith("/admin-dashboard")) {
    const response = await adminDashboardMiddleware(request);
    if (response) return response;
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    const response = await authPageMiddleware(request);
    if (response) return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
    "/admin-dashboard/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
