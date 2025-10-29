"use client";
import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
	label: string;
	register: UseFormRegisterReturn;
	error?: FieldError;
	type?: string;
	placeholder?: string;
	className?: string;
}

const Input: React.FC<FormInputProps> = ({
	label,
	register,
	error,
	type = "text",
	placeholder,
	className = "",
}) => {
	return (
		<div className={`mb-4 ${className}`}>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
			</label>

			<input
				type={type}
				placeholder={placeholder}
				{...register}
				className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
					error ? "border-red-500" : "border-gray-300"
				}`}
			/>

			{error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
		</div>
	);
};

export default Input;
