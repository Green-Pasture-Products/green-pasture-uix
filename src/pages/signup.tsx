import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Eye,
	EyeOff,
	Leaf,
	Mail,
	Lock,
	User,
	AlertCircle,
	CheckCircle,
} from "lucide-react";

import {
	signupStart,
	signupSuccess,
	signupFailure,
	clearError,
} from "@/_redux/reducers/auth.reducer";
import { signupSchema, SignupFormData } from "@/_validations/auth";
import { authAPI } from "@/_utils/auth";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import Image from "next/image";

const SignupPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [signupComplete, setSignupComplete] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
	});

	React.useEffect(() => {
		dispatch(clearError());
	}, [dispatch]);

	const onSubmit = async (data: SignupFormData) => {
		dispatch(signupStart());
		try {
			await authAPI.signup(data);
			dispatch(signupSuccess());
			setSignupComplete(true);
		} catch (err: any) {
			dispatch(signupFailure(err.message));
		}
	};

	if (signupComplete) {
		return (
			<div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8 text-center">
					<div>
						<CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-6" />
						<h2 className="text-3xl font-bold text-gray-900">
							Account Created!
						</h2>
						<p className="mt-4 text-gray-600">
							We've sent a verification email to your inbox. Please check
							your email and click the verification link to activate your
							account.
						</p>
						<div className="mt-6">
							<Link
								href="/login"
								className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors inline-block"
							>
								Go to Login
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
						Create your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-green-600 hover:text-green-500"
						>
							Sign in here
						</Link>
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

					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700"
								>
									First name
								</label>
								<div className="mt-1 relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<User className="h-5 w-5 text-gray-400" />
									</div>
									<input
										{...register("firstName")}
										type="text"
										autoComplete="given-name"
										className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
										placeholder="First name"
									/>
								</div>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.firstName.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700"
								>
									Last name
								</label>
								<div className="mt-1 relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<User className="h-5 w-5 text-gray-400" />
									</div>
									<input
										{...register("lastName")}
										type="text"
										autoComplete="family-name"
										className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
										placeholder="Last name"
									/>
								</div>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.lastName.message}
									</p>
								)}
							</div>
						</div>

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
									placeholder="Enter your email"
								/>
							</div>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
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
									placeholder="Create a password"
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

					<div className="flex items-center">
						<input
							id="terms"
							name="terms"
							type="checkbox"
							required
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="terms"
							className="ml-2 block text-sm text-gray-900"
						>
							I agree to the{" "}
							<Link
								href="/terms"
								className="text-green-600 hover:text-green-500"
							>
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link
								href="/privacy"
								className="text-green-600 hover:text-green-500"
							>
								Privacy Policy
							</Link>
						</label>
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
									Creating account...
								</div>
							) : (
								"Create account"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignupPage;
