import { z } from "zod";

export const ReservationSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
    .trim(),
  customerEmail: z
    .string()
    .email({ message: "Please enter a valid email." })
    .trim(),
  reservationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format. Must be in ISO format.",
  }),
  partySize: z
    .number({ invalid_type_error: "Party size must be a number." })
    .min(1, { message: "Party size must be at least 1." }),
  seatingPreference: z.enum(["indoor", "outdoor"], {
    message: "Seating Preference must be indoor or outdoor",
  }),
  specialRequest: z.string().trim().optional(),
  tableOnly: z.boolean(),
  menus: z
    .array(
      z.object({
        productId: z.string().trim(),
        quantity: z
          .number()
          .min(1, { message: "Quantity must be at least 1." }),
      })
    )
    .optional(),
  downPayment: z
    .number()
    .min(1, { message: "DownPayment must be at least 1." }),
  total: z.number().min(1, { message: "Total must be at least 1." }),
  paymentStatus: z.enum(["downPayment", "paid"], {
    message: "Payment Status must be downPayment or paid",
  }),
});
