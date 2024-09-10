import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { findUserById } from "@/services/auth.service";

export const verifySession = cache(async () => {
  const cookie = cookies().get("session")?.value;
  const session = await decrypt(cookie);

  return !session?.userId
    ? { isAuth: false, userId: null, role: null }
    : { isAuth: true, userId: session.userId, role: session.role };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const user = await findUserById(session.userId as string);
    return user;
  } catch (error) {
    console.log("Failed to fetch user");
    return error;
  }
});
