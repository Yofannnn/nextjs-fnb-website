"use server";

import { formatError } from "@/lib/format-error";
import { UserRole } from "@/types/user.type";
import { ActionResult } from "@/types/action-result.type";
import { verifySession } from "@/services/session.service";
import { EditProductSchema, ProductSchema, updateProductReviewSchema } from "@/validations/product.validation";
import {
  storeNewProductService,
  updateProductAvailabilityService,
  updateProductDetailsService,
  updateProductReviewService,
  deleteProductById,
} from "@/services/product.service";

/**
 * Checks if the current user is an admin.
 *
 * @async
 * @function isAdmin
 * @throws Will throw an error if the user is not authenticated or not an admin.
 */
async function isAdmin() {
  const session = await verifySession();
  if (!session) throw new Error("User not authenticated, please login.");
  const isAdmin = session.role === UserRole.Admin;
  if (!isAdmin) throw new Error("You are not an admin.");
}

/**
 * Creates a new product.
 *
 * @param _ - Unused, but required by Next.js Action API
 * @param formData - Form data containing the product details
 * @returns - An ActionResult indicating whether the product was created successfully or not
 *
 * The function will first check if the user is an admin. If not, it will throw an error.
 * Then, it will validate the form data using the ProductSchema.
 * If the validation fails, it will return an ActionResult with success set to false and errors set to the validation errors.
 * If the validation succeeds, it will call the storeNewProductService function to store the product in the database.
 * If the storeNewProductService function fails, it will throw an error.
 * If the storeNewProductService function succeeds, it will return an ActionResult with success set to true.
 */
export async function addProductAction(
  image: File | null,
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const isAvailable = formData.get("isAvailable") === "true" ? true : false;

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

/**
 * Edits the details of an existing product.
 *
 * @param productId - The ID of the product to be edited
 * @param _ - Unused, but required by Next.js Action API
 * @param formData - Form data containing the updated product details
 * @returns - An ActionResult indicating whether the product was edited successfully or not
 *
 * This function checks if the user is an admin and validates the form data using the EditProductSchema.
 * If validation fails, it returns an ActionResult with success set to false and errors set to the validation errors.
 * If validation succeeds, it calls the updateProductDetailsService function to update the product in the database.
 * If the updateProductDetailsService function fails, it throws an error.
 * If the updateProductDetailsService function succeeds, it returns an ActionResult with success set to true.
 */
export async function editProductDetailsAction(
  productId: string,
  image: File | undefined,
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");

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

/**
 * Edits the availability of an existing product.
 *
 * @param productId - The ID of the product to be edited
 * @param isAvailable - The new availability status of the product
 * @returns - An ActionResult indicating whether the product was edited successfully or not
 *
 * This function checks if the user is an admin and calls the updateProductAvailabilityService function to update the
 * product availability in the database. If the updateProductAvailabilityService function fails, it throws an error.
 * If the updateProductAvailabilityService function succeeds, it returns an ActionResult with success set to true.
 */
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

/**
 * Adds a review to a product.
 *
 * @param userId - The ID of the user making the review
 * @param productId - The ID of the product being reviewed
 * @param _ - Unused, but required by Next.js Action API
 * @param formData - Form data containing the review details
 * @returns - An ActionResult indicating whether the review was added successfully or not
 *
 * This function checks if the user is logged in and calls the updateProductReviewService function to add the review to the
 * database. If the updateProductReviewService function fails, it throws an error. If the updateProductReviewService function
 * succeeds, it returns an ActionResult with success set to true.
 */
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

/**
 * Deletes a product from the database.
 *
 * @param productId - The ID of the product to be deleted
 * @param imageUrl - The URL of the product image to be deleted
 * @returns - An ActionResult indicating whether the product was deleted successfully or not
 *
 * This function checks if the user is an admin and calls the deleteProductById function to delete the product and its image
 * from the database. If the deleteProductById function fails, it throws an error. If the deleteProductById function succeeds,
 * it returns an ActionResult with success set to true.
 */
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
