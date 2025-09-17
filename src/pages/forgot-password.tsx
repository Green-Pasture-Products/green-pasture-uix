import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Leaf } from "lucide-react";

import { setLoading, clearError } from "@/_redux/reducers/auth.reducer";
import {
	forgotPasswordSchema,
	ForgotPasswordFormData,
} from "@/_validations/auth";
import { authAPI } from "@/_utils/auth";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import Image from "next/image";

const ForgotPasswordPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const [emailSent, setEmailSent] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	React.useEffect(() => {
		dispatch(clearError());
	}, [dispatch]);

	const onSubmit = async (data: ForgotPasswordFormData) => {
		dispatch(setLoading(true));
		dispatch(clearError());

		try {
			await authAPI.forgotPassword(data.email);
			setSubmittedEmail(data.email);
			setEmailSent(true);
		} catch (err: any) {
			// Handle error through Redux if needed
			console.error(err.message);
		} finally {
			dispatch(setLoading(false));
		}
	};

	if (emailSent) {
		return (
			<div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8 text-center">
					<div>
						<CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-6" />
						<h2 className="text-3xl font-bold text-gray-900">
							Check your email
						</h2>
						<p className="mt-4 text-gray-600">
							We've sent a password reset link to{" "}
							<strong>{submittedEmail}</strong>
						</p>
						<p className="mt-2 text-sm text-gray-500">
							Didn't receive the email? Check your spam folder or try
							again.
						</p>

						<div className="mt-6 space-y-3">
							<button
								onClick={() => {
									setEmailSent(false);
									setSubmittedEmail("");
								}}
								className="w-full bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
							>
								Try again
							</button>
							<Link
								href="/login"
								className="block w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors"
							>
								Back to Login
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<div className="flex justify-center">
						<Link href="/" className="flex items-center space-x-2">
							<div className="relative w-[2.2rem] aspect-square bg-transparent">
								<Image
									src="/images/GP Organic Logo (Primary).png"
									alt="Green Pastures Logo"
									height={100}
									width={100}
									priority
									sizes="(max-width: 768px) 2rem, (max-width: 1200px) 2.2rem, 3rem"
									className="object-contain"
								/>
							</div>
							<span className="text-md md:text-lg font-bold text-green-800">
								Green Pastures Organics
							</span>
						</Link>
					</div>
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
						Reset your password
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Enter your email address and we'll send you a link to reset
						your password.
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-md p-4">
							<div className="flex">
								<AlertCircle className="h-5 w-5 text-red-400" />
								<div className="ml-3">
									<p className="text-sm text-red-800">{error}</p>
								</div>
							</div>
						</div>
					)}

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							Email address
						</label>
						<div className="mt-1 relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Mail className="h-5 w-5 text-gray-400" />
							</div>
							<input
								{...register("email")}
								type="email"
								autoComplete="email"
								className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
								placeholder="Enter your email address"
							/>
						</div>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
									Sending reset link...
								</div>
							) : (
								"Send reset link"
							)}
						</button>
					</div>

					<div className="text-center">
						<Link
							href="/login"
							className="flex items-center justify-center text-sm text-green-600 hover:text-green-500"
						>
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back to Login
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
