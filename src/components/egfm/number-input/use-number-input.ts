import * as React from "react";
import { cleanNumericString, formatWithCommas } from "./number-format";
import type { UseNumberInputOptions } from "./types";

/** Display-value state and all key/paste/step handlers behind NumberInput. */
export function useNumberInput({
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
}: UseNumberInputOptions) {
  const allowNegative = min !== undefined && min < 0;
  const [displayValue, setDisplayValue] = React.useState<string>(() => {
    const initial = controlledValue !== undefined ? controlledValue : defaultValue;
    if (initial === undefined || initial === null || initial === "") return "";
    const cleaned = cleanNumericString(String(initial), allowDecimals, allowNegative);
    return thousandSeparator ? formatWithCommas(cleaned) : cleaned;
  });

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      const cleaned = cleanNumericString(String(controlledValue), allowDecimals, allowNegative);
      const formatted = thousandSeparator ? formatWithCommas(cleaned) : cleaned;
      setDisplayValue(formatted);
    }
  }, [controlledValue, allowDecimals, allowNegative, thousandSeparator]);

  const emitChange = (rawNumeric: string) => {
    let cleaned = cleanNumericString(rawNumeric, allowDecimals, allowNegative);
    if (precision !== undefined && cleaned.includes(".")) {
      const parts = cleaned.split(".");
      cleaned = `${parts[0]}.${parts[1].slice(0, precision)}`;
    }

    const numValue = ["", ".", "-", "-."].includes(cleaned) ? undefined : Number(cleaned);
    const formatted = thousandSeparator ? formatWithCommas(cleaned) : cleaned;
    setDisplayValue(formatted);

    if (onChange) {
      onChange(numValue, formatted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key) ||
      e.ctrlKey === true ||
      e.metaKey === true
    ) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleStep(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleStep(-1);
      }
      return;
    }

    if (e.key === "." && allowDecimals) {
      if (displayValue.includes(".")) {
        e.preventDefault();
      }
      return;
    }

    // A minus only as the first character, and only when min allows negatives.
    if (e.key === "-" && allowNegative && e.currentTarget.selectionStart === 0 && !displayValue.startsWith("-")) {
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = cleanNumericString(pasted, allowDecimals, allowNegative);
    if (cleaned) {
      emitChange(cleaned);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    emitChange(raw);
  };

  const handleStep = (direction: 1 | -1) => {
    if (disabled) return;
    const raw = cleanNumericString(displayValue, allowDecimals, allowNegative);
    const current = raw === "" ? 0 : Number(raw);
    let next = current + direction * step;

    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;

    if (precision !== undefined) {
      next = Number(next.toFixed(precision));
    }

    emitChange(String(next));
  };

  return {
    displayValue,
    handleKeyDown,
    handlePaste,
    handleChange,
    handleStep,
  };
}
