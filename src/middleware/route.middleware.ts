import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/services/session.service";

export async function routeApiMiddleware(request: NextRequest) {
  const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;
  if (!SESSION_COOKIE_NAME) throw new Error("SESSION_COOKIE_NAME is not defined in environment variables.");
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = await verifyToken(cookie);
  try {
    if (!payload) return new Response(JSON.stringify({ status: 403, statusText: "Forbidden" }), { status: 403 });

    const response = NextResponse.next();
    response.headers.set("X-User-Email", payload.email as string);
    response.headers.set("X-User-Role", payload.role as string);
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ status: 401, statusText: "Unauthorized" }), { status: 401 });
  }
}
