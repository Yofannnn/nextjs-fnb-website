import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { findUserById } from "@/services/auth.service";

interface VerifySession {
  isAuth: boolean;
  userId: string | null;
  role: "admin" | "user" | null;
}

interface GetUser {
  status: "success" | "failed";
  user?: User | null;
  error?: string | undefined;
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
  const cookie = cookies().get("session")?.value;
  const session = await decrypt(cookie);

  return !session?.userId
    ? { isAuth: false, userId: null, role: null }
    : {
        isAuth: true,
        userId: session.userId as string,
        role:
          session.role === "admin" || session.role === "user"
            ? session.role
            : null,
      };
});

export const getUser = cache(async (): Promise<GetUser> => {
  const { isAuth, userId } = await verifySession();
  if (!isAuth)
    return { status: "failed", error: "Please login before get user" };

  try {
    const findUser = await findUserById(userId as string);
    const user: User = {
      _id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      address: findUser.address,
      role: findUser.role,
      createdAt: findUser.createdAt,
      updatedAt: findUser.updatedAt,
    };
    return { status: "success", user };
  } catch (error: any) {
    return { status: "failed", error: error.message || "Failed to fetch user" };
  }
});
