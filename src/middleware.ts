import { NextRequest, NextResponse } from "next/server";
import { dashboardPageMiddleware } from "@/middleware/dashboard.middleware";
import { authPageMiddleware } from "@/middleware/auth.middleware";
import { routeApiMiddleware } from "@/middleware/route.middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin-dashboard")) {
    const response = await dashboardPageMiddleware(request);
    if (response) return response;
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    await authPageMiddleware(request);
  }

  if (
    pathname.startsWith("/api/online-order") ||
    pathname.startsWith("/api/reservation") ||
    pathname.startsWith("/api/transaction")
  ) {
    // /api/online-order?orderId=orderId or /api/online-order/orderId
    const response = await routeApiMiddleware(request);
    if (response) return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-dashboard/:path*", "/dashboard/:path*", "/login", "/register", "/api/:path*"],
};
