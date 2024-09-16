import { deleteProductById } from "@/services/product.service";
import { NextResponse } from "next/server";

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
