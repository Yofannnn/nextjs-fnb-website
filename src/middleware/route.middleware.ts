import { verifyToken } from "@/services/session.service";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/user.type";

export async function routeApiMiddleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (!token) throw new Error("Unauthorized");

  try {
    const payload = await verifyToken(token);

    if (!payload) return new Response(JSON.stringify({ status: 403, statusText: "Forbidden" }), { status: 403 });

    request.user = { userId: payload.userId as string, role: payload.role as UserRole };
    return NextResponse.next();
  } catch (error) {
    return new Response(JSON.stringify({ status: 401, statusText: "Unauthorized" }), { status: 401 });
  }
}
