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
