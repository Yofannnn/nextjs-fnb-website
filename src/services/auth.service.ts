"use server";

import connectToDatabase from "@/database/mongoose";
import UserModel from "@/database/models/user.model";
import { redirect } from "next/navigation";
import { comparePassword, hashPassword } from "@/lib/hash";
import { createSessionCookie, clearSessionCookie } from "@/services/session.service";
import { LoginSchema, RegisterSchema } from "@/validations/user.validation";
import { UserRole } from "@/types/user.type";

export async function register(data: { name: string; email: string; address: string; password: string }) {
  const validationData = await RegisterSchema.safeParseAsync(data);
  if (!validationData.success) throw new Error(validationData.error.message);

  const { name, email, address, password } = validationData.data;

  try {
    await connectToDatabase();

    const existingUser = await findUserByEmail(email);
    if (existingUser) throw new Error("Email is already exist. Please login with your email and password.");
    const newUser = await UserModel.create({ name, email, address, password: hashPassword(password) });
    if (!newUser) throw new Error("An error occurred while creating your account");

    await createSessionCookie({ email: newUser.email, role: newUser.role as UserRole });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function login(data: { email: string; password: string }) {
  const validationData = await LoginSchema.safeParseAsync(data);
  if (!validationData.success) throw new Error(validationData.error.message);

  const { email, password } = validationData.data;

  try {
    await connectToDatabase();

    const user = await findUserByEmail(email);
    if (!user) throw new Error("Email not found. Please register first.");

    const isValidPassword = comparePassword(password, user.password);
    if (!isValidPassword) throw new Error("Password is incorrect.");

    await createSessionCookie({ email: user.email, role: user.role as UserRole });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function logout() {
  clearSessionCookie();
  redirect("/login");
}

export async function findUserByEmail(email: string) {
  return await UserModel.findOne({ email });
}

export async function findUserById(id: string) {
  return await UserModel.findById(id);
}
