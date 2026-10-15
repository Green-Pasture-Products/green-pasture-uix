import type { FieldValues } from "react-hook-form";
import { FieldError, FormField } from "../form";
import { NumberInput } from "../number-input";
import type { NumberFieldProps } from "./types";

export type { NumberFieldProps } from "./types";

/** A labelled NumberInput bound to a React Hook Form string field, with its hint and zod message underneath. */
export function NumberField<T extends FieldValues>({ control, name, label, unit, step = 0.1, min, max, hint }: NumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-1.5">
          <label htmlFor={name} className="text-xs font-semibold text-foreground">{label}</label>
          <NumberInput
            id={name}
            ref={field.ref}
            aria-label={label}
            aria-invalid={!!fieldState.error}
            error={!!fieldState.error}
            value={field.value}
            onChange={(val) => field.onChange(val == null ? "" : String(val))}
            onBlur={field.onBlur}
            unit={unit}
            step={step}
            min={min}
            max={max}
          />
          {hint && !fieldState.error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
          <FieldError error={fieldState.error} />
        </div>
      )}
    />
  );
}
