import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";

export async function authPageMiddleware(request: NextRequest) {
  const { isAuth, role } = await verifySession();

  if (isAuth && role === "user") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuth && role === "admin") {
    return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }
  return null;
}
