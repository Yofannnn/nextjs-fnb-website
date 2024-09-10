import UserModel from "@/models/user.model";
import { User } from "@/types/user.type";

export async function createUser(payload: User) {
  return UserModel.create(payload);
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export async function findUserById(id: string) {
  return UserModel.findById(id);
}
