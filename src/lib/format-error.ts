import { ZodError } from "zod";
import { ActionErrors, FieldErrors } from "@/types/action-result.type";

/// Create an ActionErrors object with a field error
export function getErrorsForField(field: string, error: string): ActionErrors {
  return {
    fieldErrors: {
      [field]: error,
    },
  };
}

/// Create an ActionErrors object with a form error
export function getErrorsForForm(error: string): ActionErrors {
  return {
    formErrors: [error],
  };
}

/// Format an error into an ActionErrors object
export function formatError(error: unknown): ActionErrors {
  if (error instanceof ZodError) {
    return formatZodError(error);
  }

  if (error instanceof Error) {
    const e = error as Error;
    return {
      formErrors: [e.message],
    };
  }

  if (typeof error === "string") {
    return {
      formErrors: [error],
    };
  }

  return {
    formErrors: ["An error occurred"],
  };
}

/// Format a ZodError into an ActionErrors object
function formatZodError(error: ZodError): ActionErrors {
  const zodErrors = error.flatten();
  const errors: ActionErrors = {
    formErrors: zodErrors?.formErrors,
  };

  // join errors in fieldErrors to a single string
  if (zodErrors?.fieldErrors) {
    const fieldErrors: FieldErrors = {};

    for (const key in zodErrors.fieldErrors) {
      fieldErrors[key] = zodErrors.fieldErrors[key]?.join(", ");
    }
    errors.fieldErrors = fieldErrors;
  }
  return errors;
}
