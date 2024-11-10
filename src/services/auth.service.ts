import UserModel from "@/models/user.model";
import { User } from "@/types/user.type";

interface Response {
  success: boolean;
  data: any;
  message: string;
}

export async function createUser(payload: User): Promise<Response> {
  try {
    const data = await UserModel.create(payload);
    return {
      success: true,
      data,
      message: "User fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

export async function findUserByEmail(email: string): Promise<Response> {
  try {
    const data = await UserModel.findOne({ email });
    return {
      success: true,
      data,
      message: "User fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

export async function findUserById(id: string): Promise<Response> {
  try {
    const data = await UserModel.findById(id);
    return {
      success: true,
      data,
      message: "User fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}
