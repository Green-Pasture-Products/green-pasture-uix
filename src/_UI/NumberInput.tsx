import React from "react";
import { NumberInput as EgfmNumberInput } from "@/components/egfm/number-input";
import { FieldShell } from "./FieldShell";

interface NumberInputProps {
	label?: string;
	required?: boolean;
	placeholder?: string;
	value?: string | number;
	onChange?: (value: string) => void;
	error?: string;
	className?: string;
	name?: string;
	suffix?: string;
	prefix?: string;
	step?: string;
	min?: number;
	max?: number;
	hint?: string;
}

/** Labelled number field on the egfm control. The value stays a string at this boundary (what the forms hold). */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
	({ label, required, placeholder = "0", value, onChange, error, className = "", name, suffix, prefix, step, min, max, hint }, ref) => {
		const id = name ?? undefined;
		return (
			<FieldShell label={label} required={required} error={error} hint={hint} htmlFor={id} className={className}>
				<EgfmNumberInput
					ref={ref}
					id={id}
					name={name}
					value={value ?? ""}
					placeholder={placeholder}
					onChange={(n) => onChange?.(n === undefined ? "" : String(n))}
					step={step ? Number(step) : undefined}
					min={min}
					max={max}
					suffix={suffix}
					prefixIcon={prefix ? <span className="text-muted-foreground text-xs font-semibold">{prefix}</span> : undefined}
					thousandSeparator={false}
					allowDecimals
					error={!!error}
				/>
			</FieldShell>
		);
	},
);
NumberInput.displayName = "NumberInput";

export default NumberInput;
