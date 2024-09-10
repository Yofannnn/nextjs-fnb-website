import { login, logout, register } from "@/lib/auth";
import { formatError } from "@/lib/format-error";
import { ActionResult } from "@/types/action-result.type";
import { LoginSchema, RegisterSchema } from "@/validations/user.validation";

export async function registerAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = await RegisterSchema.safeParseAsync(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: formatError(validatedFields.error),
    };
  }

  const { name, email, address, password } = validatedFields.data;

  try {
    await register({ name, email, address, password });
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function loginAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = await LoginSchema.safeParseAsync(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: formatError(validatedFields.error),
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await login({ email, password });
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: formatError(error.message) };
  }
}

export async function logoutAction() {
  await logout();
}
