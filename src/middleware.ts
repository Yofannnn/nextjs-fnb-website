import { NextRequest, NextResponse } from "next/server";
import { dashboardMiddleware } from "@/middleware/dashboard.middleware";
import { routeApiMiddleware } from "@/middleware/route.middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return await dashboardMiddleware(request);
  }

  if (
    pathname.startsWith("/api/online-order") ||
    pathname.startsWith("/api/reservation") ||
    pathname.startsWith("/api/transaction")
  ) {
    return await routeApiMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-dashboard/:path*", "/dashboard/:path*", "/login", "/register", "/api/:path*"],
};
