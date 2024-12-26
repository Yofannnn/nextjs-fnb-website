import connectToDatabase from "@/database/mongoose";
import { getAllProducts, getProductById, getProductsByCategory, getSomeProductsById } from "@/services/product.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const category = searchParams.get("category");
  const productsId = searchParams.get("productsId");

  try {
    await connectToDatabase();

    if (productId) {
      const product = await getProductById(productId);
      if (!product)
        return new Response(JSON.stringify({ status: 404, statusText: "Product not found." }), { status: 404 });

      return new Response(JSON.stringify({ status: 200, statusText: "Success to get product.", data: product }), {
        status: 200,
      });
    }

    if (category) {
      const products = await getProductsByCategory(category);
      if (!products)
        return new Response(JSON.stringify({ status: 404, statusText: "Failed to retrieve products." }), {
          status: 404,
        });

      return new Response(JSON.stringify({ status: 200, statusText: "Success to get products.", data: products }), {
        status: 200,
      });
    }

    if (productsId) {
      const products = await getSomeProductsById(productsId.split("-"));

      if (!products)
        return new Response(JSON.stringify({ status: 404, statusText: "Failed to retrieve products." }), {
          status: 404,
        });

      return new Response(JSON.stringify({ status: 200, statusText: "Success to get products.", data: products }), {
        status: 200,
      });
    }

    const allProducts = await getAllProducts();
    if (!allProducts) throw new Error("Failed to retrieve products.");

    return new Response(
      JSON.stringify({ status: 200, statusText: "Success to get all products.", data: allProducts }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
