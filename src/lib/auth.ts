"use server";

import connectToDatabase from "@/lib/mongoose";
import { redirect } from "next/navigation";
import { createUser, findUserByEmail } from "@/services/auth.service";
import { comparePassword, hashPassword } from "@/lib/hash";
import { createSession, deleteSession } from "@/lib/session";
import { LoginSchema, RegisterSchema } from "@/validations/user.validation";

export async function register(data: {
  name: string;
  email: string;
  address: string;
  password: string;
}) {
  await connectToDatabase();

  const validationData = await RegisterSchema.safeParseAsync(data);

  if (!validationData.success) throw new Error(validationData.error.message);

  const { name, email, address, password } = validationData.data;

  try {
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      throw new Error("Email is already exist");
    }
    const hashedPassword = hashPassword(password);
    const user = await createUser({
      name,
      email,
      address,
      password: hashedPassword,
    });
    if (!user) throw new Error("An error occurred while creating your account");

    await createSession(user._doc._id, user._doc.role);
    redirect("/dashboard");
  } catch (error: any) {
    return error.message;
  }
}

export async function login(data: { email: string; password: string }) {
  await connectToDatabase();

  const validationData = await LoginSchema.safeParseAsync(data);

  if (!validationData.success) throw new Error(validationData.error.message);

  const { email, password } = validationData.data;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error("Email not found.");
    }
    const isValidPassword = comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Password is incorrect.");
    }

    await createSession(user._id, user.role);
    redirect("/dashboard");
  } catch (error: any) {
    return error.message;
  }
}

export async function logout() {
  deleteSession();
  redirect("/login");
}
