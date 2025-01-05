import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { verifyToken } from "@/services/session.service";
import { findUserByEmail } from "@/services/auth.service";
import { User } from "@/types/user.type";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;
if (!SESSION_COOKIE_NAME) throw new Error("SESSION_COOKIE_NAME is not defined in environment variables.");

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return await verifyToken(cookie);
});

export const getUser = cache(
  async (): Promise<{
    success: boolean;
    user?: Omit<User, "password">;
    message?: string;
  }> => {
    const session = await verifySession();
    if (!session) return { success: false, message: "User not authenticated, please login." };

    try {
      const { success, message, data: findUser } = await findUserByEmail(session.email as string);
      if (!findUser || !success) throw new Error(message);
      const user = {
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
  }
);
