"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/egfm/select";

export interface SelectFieldOption {
	value: string;
	label: string;
}

interface Props {
	value: string;
	onValueChange: (value: string) => void;
	options: SelectFieldOption[];
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
	"aria-label"?: string;
}

/**
 * Drop-in for a native <select> on the egfm select. An empty value shows the
 * placeholder (Radix reserves "" for that), so never put "" in `options`:
 * a "no filter" choice needs its own value such as "ALL".
 */
export function SelectField({ value, onValueChange, options, placeholder = "Select…", disabled, className, id, "aria-label": ariaLabel }: Props) {
	return (
		<Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger id={id} aria-label={ariaLabel} className={className}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((o) => (
					<SelectItem key={o.value} value={o.value}>
						{o.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
