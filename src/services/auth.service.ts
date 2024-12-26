"use server";

import connectToDatabase from "@/database/mongoose";
import UserModel from "@/database/models/user.model";
import { redirect } from "next/navigation";
import { comparePassword, hashPassword } from "@/lib/hash";
import { createSession, deleteSession } from "@/services/session.service";
import { LoginSchema, RegisterSchema } from "@/validations/user.validation";

export async function register(data: { name: string; email: string; address: string; password: string }) {
  const validationData = await RegisterSchema.safeParseAsync(data);

  if (!validationData.success) throw new Error(validationData.error.message);

  const { name, email, address, password } = validationData.data;

  try {
    await connectToDatabase();

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error("Email is already exist");
    }
    const hashedPassword = hashPassword(password);
    const newUser = await UserModel.create({
      name,
      email,
      address,
      password: hashedPassword,
    });
    if (!newUser) throw new Error("An error occurred while creating your account");

    await createSession(newUser._doc._id, newUser._doc.role);
    redirect("/dashboard");
  } catch (error: any) {
    return error.message;
  }
}

export async function login(data: { email: string; password: string }) {
  const validationData = await LoginSchema.safeParseAsync(data);

  if (!validationData.success) throw new Error(validationData.error.message);

  const { email, password } = validationData.data;

  try {
    await connectToDatabase();

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

export async function findUserByEmail(email: string) {
  return await UserModel.findOne({ email });
}

export async function findUserById(id: string) {
  return await UserModel.findById(id);
}
