import connectToDatabase from "@/lib/mongoose";
import { updateProductById } from "@/services/product.service";
import { NextResponse } from "next/server";

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
