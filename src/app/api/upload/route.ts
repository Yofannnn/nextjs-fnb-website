import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    throw new Error("Filename is required");
  }

  if (!request.body) {
    throw new Error("Request body is missing");
  }

  //   whether it needs to be validated or not

  try {
    const blob = await put(filename, request.body, {
      access: "public",
      contentType: "image/jpg",
    });

    return NextResponse.json(blob, {
      status: 201,
      statusText: "Success to upload image.",
    });
  } catch (error: any) {
    return NextResponse.json({ status: 500, error: error.message });
  }
}
