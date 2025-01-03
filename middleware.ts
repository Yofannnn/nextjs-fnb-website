import { NextRequest, NextResponse } from "next/server";
import { adminDashboardMiddleware, userDashboardMiddleware } from "@/middleware/dashboard.middleware";
import { authPageMiddleware } from "@/middleware/auth.middleware";
import { routeApiMiddleware } from "@/middleware/route.middleware";

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
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
    "/admin-dashboard/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
