import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/services/session.service";
import { findUserById } from "@/services/auth.service";

interface VerifySession {
  isAuth: boolean;
  userId: string | null;
  role: "admin" | "user" | null;
}

interface GetUser {
  success: boolean;
  user?: User;
  message?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  role?: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export const verifySession = cache(async (): Promise<VerifySession> => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  return !session?.userId
    ? { isAuth: false, userId: null, role: null }
    : {
        isAuth: true,
        userId: session.userId as string,
        role: session.role === "admin" || session.role === "user" ? session.role : null,
      };
});

export const getUser = cache(async (): Promise<GetUser> => {
  const { isAuth, userId } = await verifySession();
  if (!isAuth) return { success: false, message: "User not authenticated, please login." };

  try {
    const { success, message, data: findUser } = await findUserById(userId as string);
    if (!findUser || !success) throw new Error(message);
    const user: User = {
      _id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      address: findUser.address,
      role: findUser.role,
      createdAt: findUser.createdAt,
      updatedAt: findUser.updatedAt,
    };
    return { success: true, user };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch user" };
  }
});
