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
  reservationDate: z.date({ message: "Reservation date must be a date." }),
  partySize: z
    .number({ invalid_type_error: "Party size must be a number." })
    .min(1, { message: "Party size must be at least 1." }),
  seatingPreference: z.enum(["indoor", "outdoor"], {
    message: "Seating Preference must be indoor or outdoor",
  }),
  specialRequest: z.string().trim().optional(),
  reservationType: z.enum(["table-only", "include-food"], {
    message: "Reservation type must be table-only or include-food",
  }),
  menus: z
    .array(
      z.object({
        productId: z.string().trim(),
        quantity: z
          .number()
          .min(1, { message: "Quantity must be at least 1." }),
        price: z.number(),
      })
    )
    .optional(),
  paymentStatus: z.enum(["downPayment", "paid"], {
    message: "paymentStatus must be downPayment or paid",
  }),
});
