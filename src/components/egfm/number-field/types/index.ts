import type * as React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

export interface NumberFieldProps<T extends FieldValues> {
  control: Control<T>;
  /** A string field: the form keeps what was typed, the schema checks it's a number. */
  name: FieldPath<T>;
  label: string;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  /** Shown under the input until there's an error, e.g. the target band. */
  hint?: React.ReactNode;
}
