"use server";

import { getProductById } from "@/services/product.service";
import AdminEditProductPage from "@/components/pages/AdminEditProductPage";

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;

  const product = await getProductById(productId);

  if (!product) throw new Error("Product not found.");

  const fixedProduct = { ...product._doc, _id: String(product._id) };

  return <AdminEditProductPage product={fixedProduct} />;
}
