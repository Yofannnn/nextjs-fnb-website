import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";

export async function userDashboardMiddleware(request: NextRequest) {
  const { isAuth, role } = await verifySession();

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role === "admin") {
    return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }
  return null;
}

export async function adminDashboardMiddleware(request: NextRequest) {
  const { isAuth, role } = await verifySession();

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return null;
}
