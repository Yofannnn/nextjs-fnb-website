import mongoose from "mongoose";
import ProductModel from "@/models/product.model";

export async function createProduct(payload: object) {
  return ProductModel.create(payload);
}

export async function getAllProducts() {
  return ProductModel.find();
}

export async function getProductById(id: string) {
  return ProductModel.findById(id);
}

export async function getProductsByCategory(category: string) {
  return ProductModel.find({ category });
}

export async function getSomeProductsById(ids: string[]) {
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) {
    throw new Error("No valid ObjectIds provided");
  }
  return await ProductModel.find({ _id: { $in: objectIds } });
}
