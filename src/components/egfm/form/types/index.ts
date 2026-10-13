import type { FieldError as RhfFieldError } from "react-hook-form";
import type * as React from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

export interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

export interface FormItemContextValue {
  id: string;
}

export interface FormControlProps {
  /** The single input that receives the field's id and aria wiring. */
  children: React.ReactElement<Record<string, unknown>>;
}

export interface FieldErrorProps {
  error?: Pick<RhfFieldError, "message">;
  id?: string;
}
