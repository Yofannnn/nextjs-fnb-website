import { formatError } from "@/lib/format-error";
import { ActionResult } from "@/types/action-result.type";
import { ProductSchema } from "@/validations/product.validation";

export async function addProduct(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const title = formData.get("title");
  const price = Number(formData.get("price"));
  const description = formData.get("description");
  const category = formData.get("category");
  const image = formData.get("image") as File;

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
    const blob = await fetch(`/api/upload?filename=${image.name}`, {
      method: "POST",
      headers: { "Content-Type": "image/jpg" },
      body: image,
    });

    if (!blob.ok) throw new Error(blob.statusText);
    const imageUrl = await blob.json();

    const res = await fetch("/api/product", {
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
