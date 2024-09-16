import connectToDatabase from "@/lib/mongoose";
import { createProduct } from "@/services/product.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
