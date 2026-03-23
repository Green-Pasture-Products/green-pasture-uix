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
	UserCheck,
	KeyRound,
} from "lucide-react";

import { clearError } from "@/_redux/reducers/auth.reducer";
import {
	resetPasswordFormSchema,
	ResetPasswordOtpFormData,
} from "@/_validations/auth";
import { resetPasswordAsync } from "@/_redux/actions/auth.action";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import Image from "next/image";
import Card from "@/_UI/Card";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";

const SetupPasswordPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [setupComplete, setSetupComplete] = useState(false);

	const email = (router.query.email as string) || "";

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<ResetPasswordOtpFormData>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: {
			email: email,
		},
	});

	useEffect(() => {
		dispatch(clearError());
	}, [dispatch]);

	useEffect(() => {
		if (email) {
			setValue("email", email);
		}
	}, [email, setValue]);

	const onSubmit = async (data: ResetPasswordOtpFormData) => {
		dispatch(clearError());

		try {
			await dispatch(
				resetPasswordAsync({
					email: data.email,
					otp: data.otp,
					newPassword: data.newPassword,
				})
			).unwrap();
			setSetupComplete(true);
		} catch (err: any) {
			console.error(err);
		}
	};

	if (setupComplete) {
		return (
			<div className="min-h-screen bg-white dark:bg-[#0a0f1a] flex items-center justify-center p-4">
				<Card elevation={2} padding="lg" className="max-w-md w-full text-center animate-page-enter">
					<CheckCircle className="h-24 w-24 text-primary-600 dark:text-primary-400 mx-auto mb-6" />
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white">
						Account Setup Complete!
					</h2>
					<p className="mt-4 text-gray-600 dark:text-gray-400">
						Your password has been set and your account is now active.
						You can now sign in to start shopping.
					</p>
					<div className="mt-6">
						<Link href="/login">
							<Button variant="filled" size="lg">Sign In</Button>
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

				<div className="text-center mb-8">
					<UserCheck className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
					<h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
						Complete your account setup
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Set a secure password to finish creating your account.
					</p>
				</div>

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

					<Input
						label="Email address"
						{...register("email")}
						type="email"
						readOnly
						className="opacity-70"
						error={errors.email?.message}
					/>

					<Input
						label="OTP Code"
						{...register("otp")}
						type="text"
						maxLength={6}
						placeholder="Enter OTP code"
						leftIcon={KeyRound}
						error={errors.otp?.message}
					/>

					<div>
						<Input
							label="Create password"
							{...register("newPassword")}
							type={showPassword ? "text" : "password"}
							autoComplete="new-password"
							placeholder="Create a secure password"
							leftIcon={Lock}
							error={errors.newPassword?.message}
							rightElement={
								<button
									type="button"
									className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							}
						/>
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Password must contain at least 8 characters with uppercase, lowercase, and number.
						</p>
					</div>

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
								{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
							</button>
						}
					/>

					<Button
						type="submit"
						variant="filled"
						size="lg"
						fullWidth
						loading={isLoading}
						disabled={isLoading}
					>
						{isLoading ? "Setting up account..." : "Complete setup"}
					</Button>
				</form>
			</Card>
		</div>
	);
};

export default SetupPasswordPage;
