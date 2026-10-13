import React from "react";

interface Props {
	label?: string;
	required?: boolean;
	error?: string;
	hint?: string;
	htmlFor?: string;
	className?: string;
	children: React.ReactNode;
}

/** Label + control + hint/error, so the egfm controls (which are bare) keep the labelled-field API the forms already use. */
export function FieldShell({ label, required, error, hint, htmlFor, className = "", children }: Props) {
	return (
		<div className={`space-y-1.5 ${className}`}>
			{label && (
				<label htmlFor={htmlFor} className="text-foreground block text-xs font-semibold">
					{label}
					{required && <span className="text-destructive ml-0.5">*</span>}
				</label>
			)}
			{children}
			{error ? (
				<p role="alert" className="text-destructive text-xs">
					{error}
				</p>
			) : hint ? (
				<p className="text-muted-foreground text-xs">{hint}</p>
			) : null}
		</div>
	);
}
