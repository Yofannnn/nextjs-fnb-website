import connectToDatabase from "@/lib/mongoose";
import {
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getSomeProductsById,
  updateProductById,
} from "@/services/product.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const category = searchParams.get("category");
  const productsId = searchParams.get("productsId");

  try {
    await connectToDatabase();

    if (productId) {
      const product = await getProductById(productId);
      if (!product.success)
        return new Response(
          JSON.stringify({ status: 404, statusText: "Product not found." }),
          { status: 404 }
        );

      return new Response(
        JSON.stringify({
          status: 200,
          statusText: "Success to get product.",
          data: product.data,
        }),
        { status: 200 }
      );
    }

    if (category) {
      const products = await getProductsByCategory(category);
      if (!products.success)
        return new Response(
          JSON.stringify({
            status: 404,
            statusText: "Failed to retrieve products.",
          }),
          { status: 404 }
        );

      return new Response(
        JSON.stringify({
          status: 200,
          statusText: "Success to get products.",
          data: products.data,
        }),
        { status: 200 }
      );
    }

    if (productsId) {
      const products = await getSomeProductsById(productsId.split("-"));

      if (!products.success)
        return new Response(
          JSON.stringify({ status: 404, statusText: products.message }),
          { status: 404 }
        );

      return new Response(
        JSON.stringify({
          status: 200,
          statusText: products.message,
          data: products.data,
        }),
        { status: 200 }
      );
    }

    const allProducts = await getAllProducts();
    if (!allProducts.success) throw new Error(allProducts.message);

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success to get all products.",
        data: allProducts.data,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectToDatabase();

  const body = await request.json();

  try {
    const product = createProduct(body);
    if (!product) throw new Error("Failed to create new product.");

    return NextResponse.json({
      status: 201,
      statusText: "Success to create new product.",
    });
  } catch (error: any) {
    return NextResponse.json({ status: 422, statusText: error.message });
  }
}

export async function PUT(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id");

  if (!productId)
    return NextResponse.json({
      status: 400,
      statusText: "Product Id is Required",
    });

  try {
    const updatedProduct = await updateProductById(productId, body);
    if (!updatedProduct)
      return NextResponse.json({
        status: 422,
        statusText: "Failed to Update Product",
      });

    return NextResponse.json({
      status: 200,
      statusText: "Success to Update Product",
    });
  } catch (error: any) {
    return NextResponse.json({ status: 500, statusText: error.message });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id") as string;

  if (!productId)
    return NextResponse.json({
      status: 400,
      statusText: "Product Id is Required",
    });

  try {
    const deletedProduct = await deleteProductById(productId);
    if (!deletedProduct)
      return NextResponse.json({ status: 422, statusText: "Failed to delete" });

    return NextResponse.json({ status: 200, statusText: "Success to delete" });
  } catch (error: any) {
    return NextResponse.json({ status: 500, statusText: error.message });
  }
}
