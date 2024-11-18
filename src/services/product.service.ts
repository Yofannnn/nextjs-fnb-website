import mongoose from "mongoose";
import ProductModel from "@/models/product.model";

interface Response {
  success: boolean;
  data: any;
  message: string;
}

export async function createProduct(payload: object): Promise<Response> {
  // return ProductModel.create(payload);
  try {
    const data = await ProductModel.create(payload);
    if (!data) throw new Error("Failed to create new product.");
    return { success: true, data, message: "Success to create new product." };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}

export async function updateProductById(
  id: string,
  payload: object
): Promise<Response> {
  try {
    const data = await ProductModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );
    if (!data) throw new Error("Failed to update product.");
    return { success: true, data, message: "Success to update product." };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}

export async function deleteProductById(id: string): Promise<Response> {
  try {
    const data = await ProductModel.findByIdAndDelete(id);
    if (!data) throw new Error("Failed to delete product.");
    return { success: true, data, message: "Success to delete product." };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}

export async function getAllProducts(): Promise<Response> {
  try {
    const data = await ProductModel.find();
    if (!data) throw new Error("Failed to fetch products.");
    return { success: true, data, message: "Success to fetch products." };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}

export async function getProductById(id: string): Promise<Response> {
  try {
    const data = await ProductModel.findById(id);
    if (!data) throw new Error("Failed to fetch product.");
    return { success: true, data, message: "Success to fetch product." };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}

export async function getProductsByCategory(
  category: string
): Promise<Response> {
  try {
    const data = await ProductModel.find({ category });
    if (!data) throw new Error("Failed to fetch products.");
    return { success: true, data, message: "Success to fetch products." };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}

export async function getSomeProductsById(ids: string[]): Promise<Response> {
  try {
    const objectIds = ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    if (objectIds.length === 0) throw new Error("No valid ObjectIds provided");
    const data = await ProductModel.find({ _id: { $in: objectIds } });
    if (!data) throw new Error("Failed to fetch products.");
    return { success: true, data, message: "Success to fetch products." };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}
