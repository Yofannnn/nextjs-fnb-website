export interface ActionResult {
  success?: boolean;
  errors?: ActionErrors;
}

export interface ActionErrors {
  fieldErrors?: FieldErrors;
  formErrors?: string[];
}

export interface FieldErrors {
  [x: string]: string | undefined;
  [x: number]: string | undefined;
  [x: symbol]: string | undefined;
}
