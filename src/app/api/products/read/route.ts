import connectToDatabase from "@/lib/mongoose";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
} from "@/services/product.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  await connectToDatabase();

  try {
    if (id) {
      const product = await getProductById(id);
      if (!product) {
        return NextResponse.json({
          status: 404,
          statusText: "Product not found.",
        });
      }
      return NextResponse.json(product, {
        status: 200,
        statusText: "Success to get product.",
      });
    }
    if (category) {
      const products = await getProductsByCategory(category);
      if (!products) {
        return NextResponse.json({
          status: 404,
          statusText: "Failed to retrieve products.",
        });
      }
      return NextResponse.json(products, {
        status: 200,
        statusText: "Success to get products.",
      });
    }
    const allProducts = await getAllProducts();
    if (!allProducts) throw new Error("Failed to retrieve all products.");
    return NextResponse.json(allProducts, {
      status: 200,
      statusText: "Success to get products.",
    });
  } catch (error: any) {
    return NextResponse.json({ status: 500, statusText: error.message });
  }
}
