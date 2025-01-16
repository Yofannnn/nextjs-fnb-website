import { ReservationPaymentStatus, ReservationSeatingPreference } from "@/types/order.type";
import { z } from "zod";

export const ReservationSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
    .trim(),
  customerEmail: z.string().email({ message: "Please enter a valid email." }).trim(),
  reservationDate: z.date({ message: "Reservation date must be a date." }),
  partySize: z
    .number({ invalid_type_error: "Party size must be a number." })
    .min(1, { message: "Party size must be at least 1." }),
  seatingPreference: z.enum([ReservationSeatingPreference.INDOOR, ReservationSeatingPreference.OUTDOOR], {
    message: "Seating Preference must be indoor or outdoor",
  }),
  specialRequest: z.string().trim().optional(),
  menus: z
    .array(
      z.object({
        productId: z.string().trim(),
        quantity: z.number().min(1, { message: "Quantity must be at least 1." }),
      })
    )
    .optional(),
  paymentStatus: z.enum([ReservationPaymentStatus.DOWNPAYMENT, ReservationPaymentStatus.PAID], {
    message: "paymentStatus must be downPayment or paid",
  }),
});
