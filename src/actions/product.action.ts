import { formatError } from "@/lib/format-error";
import { ActionResult } from "@/types/action-result.type";
import {
  EditProductSchema,
  ProductSchema,
} from "@/validations/product.validation";

export async function addProduct(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const image = formData.get("image") as File;
  const imageTitle = `${title?.toString().split("-")}-${new Date().getTime()}`;

  const validate = await ProductSchema.safeParseAsync({
    title,
    price,
    description,
    category,
  });

  if (!validate.success) {
    return { success: false, errors: formatError(validate.error) };
  }

  try {
    const blob = await fetch(`/api/upload-image?filename=${imageTitle}`, {
      method: "PUT",
      headers: { "Content-Type": "image/jpg" },
      body: image,
    });

    if (!blob.ok) throw new Error(blob.statusText);
    const imageUrl = await blob.json();

    const res = await fetch("/api/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validate.data,
        image: imageUrl.url,
      }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function editProduct(
  productId: string,
  productImage: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!productId)
    return { success: false, errors: formatError("Product Id is Required") };

  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const image = formData.get("image") as File | null;
  const isAvailable = formData.get("isAvailable") === "true" ? true : false;

  try {
    // if image has change, upload new img and then delete old img
    if (image && image.size > 0) {
      const validate = await EditProductSchema.safeParseAsync({
        title,
        price,
        description,
        category,
        image,
        isAvailable,
      });
      if (!validate.success) {
        return { success: false, errors: formatError(validate.error) };
      }
      const imageTitle = `${title
        ?.toString()
        .split("-")}-${new Date().getTime()}`;
      const newBlob = await fetch(`/api/upload-image?filename=${imageTitle}`, {
        method: "PUT",
        headers: { "Content-Type": "image/jpg" },
        body: image,
      });
      if (!newBlob.ok) throw new Error(newBlob.statusText);
      const imageUrl = await newBlob.json();
      const editedProductWithNewImage = {
        title: validate.data.title,
        price: validate.data.price,
        description: validate.data.description,
        category: validate.data.category,
        image: imageUrl.url,
        isAvailable: validate.data.isAvailable,
      };
      const res = await fetch(`/api/products/update?id=${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProductWithNewImage),
      });
      if (!res.ok) throw new Error(res.statusText);
      await fetch(`/api/upload-image?url=${productImage}`, {
        method: "DELETE",
      });
      return { success: true };
    }
    const validate = await EditProductSchema.safeParseAsync({
      title,
      price,
      description,
      category,
      isAvailable,
    });
    if (!validate.success) {
      return { success: false, errors: formatError(validate.error) };
    }
    const res = await fetch(`/api/products/update?id=${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validate.data),
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function deleteProduct(
  productId: string,
  imageUrl: string
): Promise<ActionResult> {
  try {
    const deleteImage = await fetch(`/api/upload-image?url=${imageUrl}`, {
      method: "DELETE",
    });
    if (!deleteImage.ok) throw new Error(deleteImage.statusText);
    const res = await fetch(`/api/products/delete?id=${productId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}
