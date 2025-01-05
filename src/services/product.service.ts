"use server";

import connectToDatabase from "@/database/mongoose";
import mongoose from "mongoose";
import ProductModel from "@/database/models/product.model";
import { deleteImageService, uploadImageService } from "@/services/image.service";
import { ProductSelection } from "@/types/order.type";
import { Product } from "@/types/product.type";
import { v4 as uuidv4 } from "uuid";

export async function storeNewProductService(payload: {
  title: string;
  price: number;
  description: string;
  category: string;
  image: File;
  isAvailable: boolean;
}) {
  const newProductId = uuidv4();
  try {
    const blob = await uploadImageService(newProductId, payload.image);
    if (!blob) throw new Error("Failed to upload image.");

    await connectToDatabase();

    const newProduct = await ProductModel.create({ ...payload, productId: newProductId, image: blob.url });
    if (!newProduct) throw new Error("Failed to create new product.");

    return { success: true, message: "Success to create new product" };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}

export async function updateProductDetailsService(
  productId: string,
  payload: {
    title: string;
    price: number;
    description: string;
    category: string;
    image?: File;
  }
) {
  try {
    await connectToDatabase();

    if (payload.image) {
      // overwriting the image at vercel blob
      const blob = await uploadImageService(productId, payload.image);
      if (!blob.success) throw new Error(blob.message);

      const updatedProduct = await ProductModel.findOneAndUpdate(
        { productId },
        { ...payload, image: blob.url },
        { new: true }
      );
      if (!updatedProduct) throw new Error("Failed to update product.");

      return { success: true, message: "Success to update product" };
    }

    const updatedProduct = await ProductModel.findOneAndUpdate({ productId }, { ...payload }, { new: true });
    if (!updatedProduct) throw new Error("Failed to update product.");

    return { success: true, message: "Success to update product" };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}

export async function updateProductAvailabilityService(productId: string, isAvailable: boolean) {
  try {
    await connectToDatabase();

    const updatedProduct = await ProductModel.findOneAndUpdate({ productId }, { isAvailable }, { new: true });
    if (!updatedProduct) throw new Error("Failed to update product.");

    return { success: true, message: "Success to update product" };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}

export async function updateProductReviewService(
  action: "add" | "update" | "delete",
  productId: string,
  payload: { userId: string; rating: number; review: string }
) {
  try {
    await connectToDatabase();

    if (action === "add") {
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { productId },
        { $push: { reviews: payload } },
        { new: true }
      );
      if (!updatedProduct) throw new Error("Failed to add product review.");

      return { success: true, message: "Success to add product review" };
    }

    if (action === "update") {
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { productId, "reviews.userId": payload.userId },
        { $set: { "reviews.$.rating": payload.rating, "reviews.$.review": payload.review } },
        { new: true }
      );
      if (!updatedProduct) throw new Error("Failed to update product review.");

      return { success: true, message: "Success to update product review." };
    }

    if (action === "delete") {
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { productId },
        { $pull: { reviews: { userId: payload.userId } } },
        { new: true }
      );
      if (!updatedProduct) throw new Error("Failed to delete product review.");

      return { success: true, message: "Success to delete product review." };
    }

    throw new Error("Invalid action.");
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}

export async function deleteProductById(productId: string, imageUrl: string) {
  try {
    const deleteProduct = await Promise.all([
      ProductModel.findOneAndDelete({ productId }),
      deleteImageService(imageUrl),
    ]);
    if (!deleteProduct[0] || !deleteProduct[1].success) throw new Error("Failed to delete product.");

    return { success: true, message: "Success to delete product" };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}

export async function getProductsSelectionFromDb(
  itemsFromClient: { productId: string; quantity: number }[]
): Promise<ProductSelection[] | []> {
  if (itemsFromClient.length === 0) return [];

  try {
    const productsId = itemsFromClient.map((item) => item.productId);

    const someProductsFromDB = await getSomeProductsById(productsId);
    if (!someProductsFromDB) return [];

    const productsMap = new Map(someProductsFromDB.map((product: Product) => [product.productId, product]));

    const products = itemsFromClient
      .map((item) => {
        const product = productsMap.get(item.productId) as Product;
        return product
          ? {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            }
          : null;
      })
      .filter((item): item is ProductSelection => item !== null);

    return products || [];
  } catch (error: any) {
    return error.message;
  }
}

export async function getAllProducts() {
  return await ProductModel.find();
}

export async function getProductById(id: string) {
  return await ProductModel.findById(id);
}

export async function getProductsByCategory(category: string) {
  return await ProductModel.find({ category });
}

export async function getSomeProductsById(ids: string[]) {
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) return;
  return await ProductModel.find({ _id: { $in: objectIds } });
}
