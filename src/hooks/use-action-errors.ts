import { useState, useEffect } from "react";
import { ActionErrors, ActionResult } from "@/types/action-result.type";

export function useActionErrors(state: ActionResult = {}) {
  const [errors, setErrors] = useState<ActionErrors>();

  useEffect(() => {
    setErrors(state?.errors);
  }, [state?.errors]);

  const setFieldError = (fields: string | string[], value?: string) => {
    if (!fields) return;

    if (typeof fields === "string") {
      fields = [fields];
    }

    const fieldErrors = errors?.fieldErrors || {};

    fields.forEach((field) => {
      if (!field) return;

      if (value === null || value === undefined) {
        delete fieldErrors[field];
      } else if (Array.isArray(value)) {
        fieldErrors[field] = value.join(", ");
      } else if (typeof value === "string") {
        fieldErrors[field] = value;
      } else {
        fieldErrors[field] = value as string;
      }
    });

    setErrors({ ...errors, fieldErrors });
  };

  return {
    errors,
    setFieldError,
  };
}
