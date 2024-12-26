import { del, put } from "@vercel/blob";

export async function uploadImageService(filename: string, image: File) {
  try {
    const blob = await put(filename, image, {
      access: "public",
      contentType: "image/jpg",
    });

    if (!blob) throw new Error("Failed to upload image");

    return { success: true, message: "Success to upload image", url: blob.url };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}

export async function deleteImageService(url: string) {
  try {
    await del(url);
    return { success: true, message: "Success to delete image." };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}
