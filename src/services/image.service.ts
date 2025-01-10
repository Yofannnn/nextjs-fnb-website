import { del, put } from "@vercel/blob";

/**
 * Uploads a given image file to Vercel Blob with a specified filename.
 *
 * @param {string} filename - The filename of the image to be uploaded.
 * @param {File} image - The image file to be uploaded.
 *
 * @returns {Promise<{ success: boolean, message: string, url?: string }>} - A promise that resolves to an object with properties
 *   indicating whether the upload was successful, an error message if not, and the URL of the uploaded image if successful.
 */
export async function uploadImageService(filename: string, image: File) {
  try {
    const blob = await put(filename, image, {
      access: "public",
      contentType: "image/jpg",
      addRandomSuffix: false,
    });

    if (!blob) throw new Error("Failed to upload image");

    return { success: true, message: "Success to upload image", url: blob.url };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}

/**
 * Deletes an image from Vercel Blob with a specified URL.
 *
 * @param {string} url - The URL of the image to be deleted.
 *
 * @returns {Promise<{ success: boolean, message: string }>} - A promise that resolves to an object with properties indicating
 *   whether the deletion was successful and an error message if not.
 */
export async function deleteImageService(url: string) {
  try {
    await del(url);
    return { success: true, message: "Success to delete image." };
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
}
