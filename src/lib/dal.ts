import "server-only";
import { cache } from "react";
import { findUserByEmail } from "@/services/auth.service";
import { User } from "@/types/user.type";
import { verifySession } from "@/services/session.service";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;
if (!SESSION_COOKIE_NAME) throw new Error("SESSION_COOKIE_NAME is not defined in environment variables.");

export const getUser = cache(
  async (): Promise<{
    success: boolean;
    user?: Omit<User, "password">;
    message?: string;
  }> => {
    const session = await verifySession();
    if (!session) return { success: false, message: "User not authenticated, please login." };

    try {
      const findUser = await findUserByEmail(session.email as string);
      if (!findUser) throw new Error("Failed to fetch user");
      const user = {
        _id: findUser._id,
        name: findUser.name,
        email: findUser.email,
        address: findUser.address,
        role: findUser.role,
        createdAt: findUser.createdAt,
        updatedAt: findUser.updatedAt,
      };
      return { success: true, message: "Success to fetch user", user };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
);
