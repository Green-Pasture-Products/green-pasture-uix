import * as React from "react";
import { cn } from "../lib/utils";

/** A native checkbox in the brand accent; forwards its ref, so react-hook-form's register() works. */
export const Checkbox = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<"input">, "type">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn("size-4 shrink-0 cursor-pointer rounded accent-brand-ink disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";
