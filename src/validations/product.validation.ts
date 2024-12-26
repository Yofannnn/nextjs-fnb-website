import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

export const ProductSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
    .trim(),
  price: z
    .number({ invalid_type_error: "Price must be a number." })
    .min(1, { message: "Price must be at least 1." })
    .int({ message: "Price must be an integer." }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Description cant be only space" })
    .trim(),
  category: z
    .string()
    .min(2, { message: "Category must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Category cant be only space" })
    .trim(),
  isAvailable: z.boolean(),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "File size should be less than 2MB",
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Only .png, .jpg, and .jpeg formats are supported",
    }),
});

export const EditProductSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
    .trim(),
  price: z
    .number({ invalid_type_error: "Price must be a number." })
    .min(1, { message: "Price must be at least 1." })
    .int({ message: "Price must be an integer." }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Description cant be only space" })
    .trim(),
  category: z
    .string()
    .min(2, { message: "Category must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Category cant be only space" })
    .trim(),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: "File size should be less than 2MB",
    })
    .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Only .png, .jpg, and .jpeg formats are supported",
    }),
});

export const updateProductReviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Rating must be a number." })
    .min(1, { message: "Rating must be at least 1." })
    .int({ message: "Rating must be an integer." }),
  review: z
    .string()
    .regex(/^(?!\s*$).+/, { message: "Category cant be only space" })
    .trim(),
});
