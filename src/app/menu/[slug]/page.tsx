import MenuDetailsPage from "@/components/pages/MenuDetails";

async function getProductById(id: string) {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/product?id=${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true, data: await res.json() };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export default async function MenuDetails({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const product = await getProductById(slug);

  if (!product.success) return <h1>Error: {product.message}</h1>;
  return <MenuDetailsPage product={product.data} />;
}
