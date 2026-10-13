import type * as React from "react";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (value: number | undefined, formattedValue: string) => void;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  precision?: number;
  thousandSeparator?: boolean;
  /** A fixed unit badge inside the field; for a choosable unit use QuantityField. */
  unit?: string;
  showSteppers?: boolean;
  prefixIcon?: React.ReactNode;
  suffix?: string;
  error?: boolean;
  helperText?: string;
}

export type UseNumberInputOptions = Pick<
  NumberInputProps,
  | "defaultValue"
  | "onChange"
  | "min"
  | "max"
  | "precision"
> & {
  controlledValue: NumberInputProps["value"];
  step: number;
  allowDecimals: boolean;
  thousandSeparator: boolean;
  disabled: boolean;
};
