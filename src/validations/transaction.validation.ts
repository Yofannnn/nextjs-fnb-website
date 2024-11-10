import { z } from "zod";

export const TransactionSchema = z.object({
  orderId: z
    .string()
    .min(2, { message: "Order ID must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Order ID cant be only space" })
    .trim(),
  orderType: z.enum(["reservation", "online-order"], {
    message: "Invalid order type",
  }),
  grossAmount: z
    .number({ invalid_type_error: "Amount must be a number." })
    .min(1, { message: "Amount must be at least 1." })
    .int({ message: "Amount must be an integer." }),
  paymentType: z
    .string()
    .min(2, { message: "Payment type must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Payment type cant be only space" })
    .trim()
    .optional(),
  paymentPurpose: z.enum(["downPayment", "paid"], {
    message: "Invalid payment purpose",
  }),
  transactionStatus: z.enum([
    "settlement",
    "pending",
    "expire",
    "deny",
    "cancel",
    "refund",
  ]),
  transactionTime: z.date(),
});
