import { z } from "zod";

export const OnlineOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
    .trim(),
  customerEmail: z
    .string()
    .email({ message: "Please enter a valid email." })
    .trim(),
  customerAddress: z
    .string()
    .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
    .trim(),
  deliveryDate: z.date({ message: "Delivery date must be a date." }),
  note: z
    .string()
    .regex(/^(?!\s*$).+/, { message: "Note cant be only space" })
    .trim()
    .optional(),
  items: z.array(
    z.object({
      productId: z.string().trim(),
      quantity: z.number().min(1, { message: "Quantity must be at least 1." }),
    })
  ),
});
