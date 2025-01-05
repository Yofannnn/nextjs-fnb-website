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
import { verifySession } from "@/lib/dal";
import { UserRole } from "@/types/user.type";

async function isAdmin() {
  const session = await verifySession();
  if (!session) throw new Error("User not authenticated, please login.");
  const isAdmin = session.role === UserRole.Admin;
  if (!isAdmin) throw new Error("You are not an admin.");
}

export async function addProductAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const isAvailable = formData.get("isAvailable") === "true" ? true : false;
  const image = formData.get("image") as File;

  try {
    await isAdmin();

    const validate = await ProductSchema.safeParseAsync({
      title,
      price,
      description,
      category,
      isAvailable,
      image,
    });

    if (!validate.success) return { success: false, errors: formatError(validate.error) };

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

  try {
    await isAdmin();

    const validate = await EditProductSchema.safeParseAsync({
      title,
      price,
      description,
      category,
      image,
    });
    if (!validate.success) return { success: false, errors: formatError(validate.error) };

    const editedProduct = await updateProductDetailsService(productId, validate.data);
    if (!editedProduct.success) throw new Error(editedProduct.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function editProductAvailabilityAction(productId: string, isAvailable: boolean): Promise<ActionResult> {
  try {
    await isAdmin();

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
    await isAdmin();

    const deleteProduct = await deleteProductById(productId, imageUrl);
    if (!deleteProduct.success) throw new Error(deleteProduct.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}
