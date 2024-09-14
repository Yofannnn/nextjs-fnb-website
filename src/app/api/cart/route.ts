import { getSomeProductsById } from "@/services/product.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split("-");

  if (!ids)
    return NextResponse.json(
      { statusText: "Missing Id Products." },
      { status: 422 }
    );

  try {
    const products = await getSomeProductsById(ids);
    if (!products || products.length === 0) {
      return NextResponse.json(
        { statusText: "Product Not Found." },
        { status: 404 }
      );
    }
    return NextResponse.json(products, { status: 200, statusText: "Success" });
  } catch (error: any) {
    return NextResponse.json(
      { statusText: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
