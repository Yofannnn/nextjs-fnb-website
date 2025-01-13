import MenuDetailsPage from "@/components/pages/MenuDetails";
import { getProductById } from "@/services/product.service";

export default async function MenuDetails(props: { params: Promise<{ productId: string }> }) {
  const { productId } = await props.params;
  const product = await getProductById(productId);

  if (!product) throw new Error("Product not found.");

  const fixedProduct = { ...product._doc, _id: String(product._id) };
  return <MenuDetailsPage product={fixedProduct} />;
}
