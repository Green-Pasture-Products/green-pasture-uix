"use client";

import React, { useEffect, useRef, useState } from "react";
import { PhoneInput as EgfmPhoneInput } from "@/components/egfm/phone-input";
import { COUNTRIES, countryByCode } from "@/components/egfm/countries";
import { FieldShell } from "./FieldShell";

const digitsOnly = (v: string) => v.replace(/\D/g, "");

/** Split a stored number ("+2348030000000", "234 803…") into its country and local digits. */
export function splitDialCode(phone?: string | null): { countryCode: string; local: string } {
	const digits = digitsOnly(String(phone ?? ""));
	if (!digits) return { countryCode: "NG", local: "" };
	const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => digits.startsWith(digitsOnly(c.dial)));
	if (!match) return { countryCode: "NG", local: digits };
	return { countryCode: match.code, local: digits.slice(digitsOnly(match.dial).length) };
}

interface PhoneInputProps {
	label?: string;
	required?: boolean;
	error?: string;
	/** The number WITHOUT its dial code (digits). */
	value?: string;
	onChange?: (localDigits: string) => void;
	onCountryChange?: (dialCode: string) => void;
	defaultCountry?: string;
	className?: string;
	name?: string;
}

/**
 * Labelled phone field on the egfm control (country picker + national number).
 * Forms keep the local digits and the dial code separately, so this converts to
 * and from the control's E.164 value at the boundary.
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(({ label, required, error, value, onChange, onCountryChange, defaultCountry = "NG", className = "", name }, ref) => {
	const [dial, setDial] = useState(() => countryByCode(defaultCountry)?.dial ?? "+234");
	const announced = useRef(false);

	// Tell the form the starting dial code once, as the previous control did.
	useEffect(() => {
		if (!announced.current) {
			announced.current = true;
			onCountryChange?.(dial);
		}
	}, [dial, onCountryChange]);

	const digits = (value ?? "").replace(/\D/g, "");
	return (
		<FieldShell label={label} required={required} error={error} htmlFor={name} className={className}>
			<EgfmPhoneInput
				ref={ref}
				id={name}
				name={name}
				defaultCountry={defaultCountry}
				value={digits ? `${dial}${digits}` : ""}
				error={!!error}
				onChange={(e164, country) => {
					const nextDial = country.dial;
					if (nextDial !== dial) {
						setDial(nextDial);
						onCountryChange?.(nextDial);
					}
					onChange?.(e164.startsWith(nextDial) ? e164.slice(nextDial.length).replace(/\D/g, "") : e164.replace(/\D/g, ""));
				}}
			/>
		</FieldShell>
	);
});
PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
