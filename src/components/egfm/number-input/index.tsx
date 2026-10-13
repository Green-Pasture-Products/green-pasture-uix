import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "../lib/utils";
import { cleanNumericString } from "./number-format";
import type { NumberInputProps } from "./types";
import { useNumberInput } from "./use-number-input";

export type { NumberInputProps } from "./types";

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      allowDecimals = true,
      precision,
      thousandSeparator = true,
      unit,
      showSteppers = false,
      prefixIcon,
      suffix,
      disabled = false,
      required = false,
      placeholder = "0",
      error = false,
      helperText,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) => {
    // A field can be marked invalid either through `error` or, like every other field in this codebase, `aria-invalid`.
    const invalid = error || ariaInvalid === true || ariaInvalid === "true";
    const {
      displayValue,
      handleKeyDown,
      handlePaste,
      handleChange,
      handleStep,
    } = useNumberInput({
      controlledValue,
      defaultValue,
      onChange,
      min,
      max,
      step,
      allowDecimals,
      precision,
      thousandSeparator,
      disabled,
    });

    return (
      <div className="w-full space-y-1">
        <div
          className={cn(
            "group relative flex items-center w-full h-9 sm:h-10 pointer-coarse:min-h-12 bg-card border rounded-lg transition-all duration-150 shadow-2xs",
            invalid
              ? "border-destructive ring-2 ring-destructive/20"
              : "border-input hover:border-brand focus-within:border-ring focus-within:ring-2 focus-within:ring-ring",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {prefixIcon && (
            <div className="pl-3 pr-1.5 flex items-center text-muted-foreground group-focus-within:text-brand transition-colors">
              {prefixIcon}
            </div>
          )}

          {showSteppers && (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled || (min !== undefined && Number(cleanNumericString(displayValue, allowDecimals, true)) <= min)}
              onClick={() => handleStep(-1)}
              className="px-2 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}

          <input
            ref={ref}
            type="text"
            inputMode={allowDecimals ? "decimal" : "numeric"}
            autoComplete="off"
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onChange={handleChange}
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full h-full bg-transparent px-3 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground placeholder:font-normal focus:outline-none",
              showSteppers && "text-center",
              prefixIcon && "pl-1"
            )}
            {...props}
          />

          {showSteppers && (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled || (max !== undefined && Number(cleanNumericString(displayValue, allowDecimals, true)) >= max)}
              onClick={() => handleStep(1)}
              className="px-2 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {suffix && !unit && (
            <span className="pr-3 text-xs font-semibold text-muted-foreground select-none">{suffix}</span>
          )}

          {unit && (
            <div className="pr-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold text-muted-foreground border border-border select-none">
                {unit}
              </span>
            </div>
          )}

        </div>

        {helperText && (
          <p className={cn("text-[11px] px-1 font-medium", invalid ? "text-destructive" : "text-muted-foreground")}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
