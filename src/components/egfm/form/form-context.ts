import * as React from "react";
import { useFormContext, useFormState } from "react-hook-form";
import type { FormFieldContextValue, FormItemContextValue } from "./types";

export const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);
export const FormItemContext = React.createContext<FormItemContextValue | null>(null);

/** The current field's name, ids and zod error, for the pieces inside a FormItem. */
export function useFormField() {
  const field = React.useContext(FormFieldContext);
  const item = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: field?.name });
  if (!field || !item) throw new Error("useFormField must be used inside <FormField> and <FormItem>");
  const { id } = item;
  return {
    name: field.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...getFieldState(field.name, formState),
  };
}
