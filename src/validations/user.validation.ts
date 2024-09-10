import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .regex(/^(?!\s*$).+/, { message: "Name cant be only space" })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  address: z
    .string()
    .min(2, { message: "Address must be at least 2 characters long." })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .regex(/^\S*$/, { message: "Cannot contain spaces." })
    .trim(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .regex(/^\S*$/, { message: "Cannot contain spaces." }) // No spaces allowed
    .trim(),
});
