import MenuDetailsPage from "@/components/pages/MenuDetails";

async function getProductById(id: string) {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/product?id=${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 120 },
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (error: any) {
    return error.message;
  }
}

export default async function MenuDetails({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const product = await getProductById(slug);

  if (!product) return;
  return <MenuDetailsPage product={product} />;
}
