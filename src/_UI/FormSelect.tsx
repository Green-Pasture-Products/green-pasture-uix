"use client";

import React from "react";
import { Combobox } from "@/components/egfm/combobox";
import { FieldShell } from "./FieldShell";

interface Option {
	value: string | number;
	label: string;
}

interface FormSelectDropdownProps {
	label?: string;
	required?: boolean;
	placeholder?: string;
	options: Option[];
	searchable?: boolean;
	value?: string | number;
	onChange?: (value: string) => void;
	error?: string;
	className?: string;
	name?: string;
}

/** Labelled searchable select on the egfm combobox. Values are strings at this boundary. */
const FormSelectDropdown = React.forwardRef<HTMLInputElement, FormSelectDropdownProps>(
	({ label, required, placeholder = "Select an option", options, value, onChange, error, className = "", name }, _ref) => (
		<FieldShell label={label} required={required} error={error} htmlFor={name} className={className}>
			<Combobox
				id={name}
				value={value === undefined || value === null ? "" : String(value)}
				onValueChange={(v) => onChange?.(v)}
				options={options.map((o) => ({ value: String(o.value), label: o.label }))}
				placeholder={placeholder}
				aria-invalid={!!error}
			/>
		</FieldShell>
	),
);
FormSelectDropdown.displayName = "FormSelectDropdown";

export default FormSelectDropdown;
