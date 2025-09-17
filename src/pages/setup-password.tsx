import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Eye,
	EyeOff,
	Lock,
	CheckCircle,
	AlertCircle,
	Leaf,
	UserCheck,
} from "lucide-react";

import { setLoading, clearError } from "@/_redux/reducers/auth.reducer";
import {
	setupPasswordSchema,
	SetupPasswordFormData,
} from "@/_validations/auth";
import { authAPI } from "@/_utils/auth";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import Image from "next/image";

const SetupPasswordPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [setupComplete, setSetupComplete] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [tokenError, setTokenError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SetupPasswordFormData>({
		resolver: zodResolver(setupPasswordSchema),
	});

	useEffect(() => {
		dispatch(clearError());

		// Get token from URL
		const { token: urlToken } = router.query;
		if (urlToken && typeof urlToken === "string") {
			setToken(urlToken);
		} else if (router.isReady && !urlToken) {
			setTokenError("Invalid or missing setup token");
		}
	}, [dispatch, router.query, router.isReady]);

	const onSubmit = async (data: SetupPasswordFormData) => {
		if (!token) {
			setTokenError("Invalid setup token");
			return;
		}

		dispatch(setLoading(true));
		dispatch(clearError());

		try {
			await authAPI.setupPassword(token, data.password);
			setSetupComplete(true);
		} catch (err: any) {
			setTokenError(err.message);
		} finally {
			dispatch(setLoading(false));
		}
	};

	if (tokenError) {
		return (
			<div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8 text-center">
					<div>
						<AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
						<h2 className="text-3xl font-bold text-gray-900">
							Invalid Setup Link
						</h2>
						<p className="mt-4 text-gray-600">
							This password setup link is invalid or has expired.
						</p>
						<div className="mt-6 space-y-3">
							<Link
								href="/signup"
								className="block w-full bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
							>
								Create New Account
							</Link>
							<Link
								href="/login"
								className="block w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors"
							>
								Sign In
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (setupComplete) {
		return (
			<div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8 text-center">
					<div>
						<CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-6" />
						<h2 className="text-3xl font-bold text-gray-900">
							Account Setup Complete!
						</h2>
						<p className="mt-4 text-gray-600">
							Your password has been set and your account is now active.
							You can now sign in to start shopping.
						</p>
						<div className="mt-6">
							<Link
								href="/login"
								className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors inline-block"
							>
								Sign In
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
							<span className="text-md md:text-lg hidden lg:inline-block font-bold text-green-800">
								Green Pastures Organics
							</span>
						</Link>
					</div>
					<div className="mt-6 text-center">
						<UserCheck className="h-16 w-16 text-green-600 mx-auto mb-4" />
						<h2 className="text-3xl font-bold text-gray-900">
							Complete your account setup
						</h2>
						<p className="mt-2 text-sm text-gray-600">
							Set a secure password to finish creating your account.
						</p>
					</div>
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

					<div className="space-y-4">
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Create password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									{...register("password")}
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
									placeholder="Create a secure password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.password.message}
								</p>
							)}
							<p className="mt-1 text-xs text-gray-500">
								Password must contain at least 8 characters with
								uppercase, lowercase, and number.
							</p>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700"
							>
								Confirm password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									{...register("confirmPassword")}
									type={showConfirmPassword ? "text" : "password"}
									autoComplete="new-password"
									className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
									placeholder="Confirm your password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-600">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading || !token}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
									Setting up account...
								</div>
							) : (
								"Complete setup"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SetupPasswordPage;
