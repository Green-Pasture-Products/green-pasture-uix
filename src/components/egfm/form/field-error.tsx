import type { FieldErrorProps } from "./types";

/** A field's validation message, for forms that register inputs directly instead of using <FormField>. */
export function FieldError({ error, id }: FieldErrorProps) {
  if (!error?.message) return null;
  return (
    <p id={id} role="alert" className="text-[11px] font-medium text-destructive">
      {String(error.message)}
    </p>
  );
}
