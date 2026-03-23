import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	AlertCircle,
	CheckCircle,
} from "lucide-react";

import { clearError } from "@/_redux/reducers/auth.reducer";
import { signupSchema, SignupFormData } from "@/_validations/auth";
import { signupAsync } from "@/_redux/actions/auth.action";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import Image from "next/image";
import Card from "@/_UI/Card";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";

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
		try {
			await dispatch(signupAsync(data)).unwrap();
			router.push(`/verify-account?email=${encodeURIComponent(data.email)}`);
		} catch (err: any) {
			console.error(err);
		}
	};

	if (signupComplete) {
		return (
			<div className="min-h-screen bg-white dark:bg-[#0a0f1a] flex items-center justify-center p-4">
				<Card elevation={2} padding="lg" className="max-w-md w-full text-center animate-page-enter">
					<CheckCircle className="h-24 w-24 text-primary-600 dark:text-primary-400 mx-auto mb-6" />
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white">
						Account Created!
					</h2>
					<p className="mt-4 text-gray-600 dark:text-gray-400">
						We've sent a verification email to your inbox. Please check
						your email and click the verification link to activate your
						account.
					</p>
					<div className="mt-6">
						<Link href="/login">
							<Button variant="filled" size="lg">Go to Login</Button>
						</Link>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white dark:bg-[#0a0f1a] flex items-center justify-center p-4">
			<Card
				elevation={2}
				padding="lg"
				className="max-w-md w-full rounded-radius-lg animate-page-enter"
			>
				{/* Logo */}
				<div className="flex justify-center mb-6">
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
						<span className="text-md md:text-lg font-bold text-primary-800 dark:text-primary-300">
							Green Pastures Organics
						</span>
					</Link>
				</div>

				<h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Create your account
				</h2>
				<p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
					Already have an account?{" "}
					<Link
						href="/login"
						className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
					>
						Sign in here
					</Link>
				</p>

				<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
					{error && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md p-4">
							<div className="flex">
								<AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
								<div className="ml-3">
									<p className="text-sm text-red-800 dark:text-red-300">{error}</p>
								</div>
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Input
							label="First name"
							{...register("firstName")}
							type="text"
							autoComplete="given-name"
							placeholder="First name"
							leftIcon={User}
							error={errors.firstName?.message}
						/>
						<Input
							label="Last name"
							{...register("lastName")}
							type="text"
							autoComplete="family-name"
							placeholder="Last name"
							leftIcon={User}
							error={errors.lastName?.message}
						/>
					</div>

					<Input
						label="Email address"
						{...register("email")}
						type="email"
						autoComplete="email"
						placeholder="Enter your email"
						leftIcon={Mail}
						error={errors.email?.message}
					/>

					<Input
						label="Password"
						{...register("password")}
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						placeholder="Create a password"
						leftIcon={Lock}
						error={errors.password?.message}
						rightElement={
							<button
								type="button"
								className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-5 w-5" />
								) : (
									<Eye className="h-5 w-5" />
								)}
							</button>
						}
					/>

					<Input
						label="Confirm password"
						{...register("confirmPassword")}
						type={showConfirmPassword ? "text" : "password"}
						autoComplete="new-password"
						placeholder="Confirm your password"
						leftIcon={Lock}
						error={errors.confirmPassword?.message}
						rightElement={
							<button
								type="button"
								className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								{showConfirmPassword ? (
									<EyeOff className="h-5 w-5" />
								) : (
									<Eye className="h-5 w-5" />
								)}
							</button>
						}
					/>

					<div className="flex items-center">
						<input
							id="terms"
							name="terms"
							type="checkbox"
							required
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
						/>
						<label
							htmlFor="terms"
							className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
						>
							I agree to the{" "}
							<Link
								href="/terms"
								className="text-primary-600 dark:text-primary-400 hover:text-primary-500"
							>
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link
								href="/privacy"
								className="text-primary-600 dark:text-primary-400 hover:text-primary-500"
							>
								Privacy Policy
							</Link>
						</label>
					</div>

					<Button
						type="submit"
						variant="filled"
						size="lg"
						fullWidth
						loading={isLoading}
						disabled={isLoading}
					>
						{isLoading ? "Creating account..." : "Create account"}
					</Button>
				</form>
			</Card>
		</div>
	);
};

export default SignupPage;
