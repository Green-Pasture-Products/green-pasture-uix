import * as React from "react";
import { Controller, FormProvider, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "../lib/utils";
import { FormFieldContext, FormItemContext, useFormField } from "./form-context";
import type { FormControlProps } from "./types";

/** shadcn/ui's Form, on React Hook Form: wrap a form in <Form {...form}>; each field shows its zod error in <FormMessage>. */
export const Form = FormProvider;

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>,
) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  const { error, formItemId } = useFormField();
  return (
    <label
      htmlFor={formItemId}
      className={cn("text-xs font-semibold text-foreground", error && "text-destructive", className)}
      {...props}
    />
  );
}

/** Passes the field's id and aria-* wiring to its single child input. */
export function FormControl({ children }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return React.cloneElement(children, {
    id: formItemId,
    "aria-describedby": error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
    "aria-invalid": !!error,
  });
}

export function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return <p id={formDescriptionId} className={cn("text-[11px] text-muted-foreground", className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) return null;
  return (
    <p id={formMessageId} className={cn("text-[11px] font-medium text-destructive", className)} {...props}>
      {body}
    </p>
  );
}
