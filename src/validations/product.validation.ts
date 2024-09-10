import { z } from "zod";

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
  // image: z
  //   .string()
  //   .min(2, { message: "Image must be at least 2 characters long." })
  //   .regex(/^(?!\s*$).+/, { message: "Image cant be only space" })
  //   .trim(),
});

// export const UpdateProductSchema = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Name must be at least 2 characters long." })
//     .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
//     .trim(),
//   price: z
//     .number({ invalid_type_error: "Price must be a number." })
//     .min(1, { message: "Price must be at least 1." })
//     .int({ message: "Price must be an integer." }),
//   description: z
//     .string()
//     .min(2, { message: "Description must be at least 2 characters long." })
//     .trim(),
//   category: z
//     .string()
//     .min(2, { message: "Category must be at least 2 characters long." })
//     .trim(),
//   image: z
//     .string()
//     .min(2, { message: "Image must be at least 2 characters long." })
//     .trim(),
// });
