"use server";

import { formatError } from "@/lib/format-error";
import { ActionResult } from "@/types/action-result.type";
import {
  storeNewProductService,
  updateProductAvailabilityService,
  updateProductDetailsService,
  updateProductReviewService,
  deleteProductById,
} from "@/services/product.service";
import { EditProductSchema, ProductSchema, updateProductReviewSchema } from "@/validations/product.validation";

export async function addProductAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const isAvailable = formData.get("isAvailable") === "true" ? true : false;
  const image = formData.get("image") as File;

  const validate = await ProductSchema.safeParseAsync({
    title,
    price,
    description,
    category,
    isAvailable,
    image,
  });

  if (!validate.success) return { success: false, errors: formatError(validate.error) };

  try {
    const newProduct = await storeNewProductService(validate.data);
    if (!newProduct.success) throw new Error(newProduct.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function editProductDetailsAction(
  productId: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const image = formData.get("image") as File | null;

  const validate = await EditProductSchema.safeParseAsync({
    title,
    price,
    description,
    category,
    image,
  });
  if (!validate.success) return { success: false, errors: formatError(validate.error) };

  try {
    const editedProduct = await updateProductDetailsService(productId, validate.data);
    if (!editedProduct.success) throw new Error(editedProduct.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function editProductAvailabilityAction(productId: string, isAvailable: boolean): Promise<ActionResult> {
  try {
    const updatedProductAvailability = await updateProductAvailabilityService(productId, isAvailable);
    if (!updatedProductAvailability.success) throw new Error(updatedProductAvailability.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function editProductReviewAction(
  { userId, productId }: { userId: string; productId: string },
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rating = Number(formData.get("rating"));
  const review = formData.get("review");

  const validate = await updateProductReviewSchema.safeParseAsync({ rating, review });
  if (!validate.success) return { success: false, errors: formatError(validate.error) };

  const payload = { ...validate.data, userId };
  try {
    const updatedProductReview = await updateProductReviewService("add", productId, payload);
    if (!updatedProductReview.success) throw new Error(updatedProductReview.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function deleteProduct(productId: string, imageUrl: string): Promise<ActionResult> {
  try {
    const deleteProduct = await deleteProductById(productId, imageUrl);
    if (!deleteProduct.success) throw new Error(deleteProduct.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}
