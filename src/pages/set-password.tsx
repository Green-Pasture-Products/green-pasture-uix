import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";

import Image from "next/image";
import Card from "@/_UI/Card";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";
// Public endpoint: plain axios so a stale session token is never attached (and a 401
// can't trigger the refresh-then-logout redirect), matching forgotPasswordAsync.
import axios from "axios";
import { appConstants } from "@/_redux/constants";

const setPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number"
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

const SetPasswordPage: React.FC = () => {
	const router = useRouter();
	// Reset links carry mode=reset; guest-setup links (and older links) have no mode.
	const token = typeof router.query.token === "string" ? router.query.token : "";
	const isReset = router.query.mode === "reset";
	const copy = isReset
		? {
				title: "Reset your password",
				subtitle: "Choose a new password for your account",
				submit: "Reset Password",
				submitting: "Resetting password...",
				done: "Password Reset!",
				doneBody: "Your password has been reset. You can now sign in with your new password.",
			}
		: {
				title: "Set your password",
				subtitle: "Create a password for your new account",
				submit: "Set Password",
				submitting: "Setting password...",
				done: "Password Set!",
				doneBody: "Password set successfully! You can now log in.",
			};

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [complete, setComplete] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SetPasswordFormData>({
		resolver: zodResolver(setPasswordSchema),
	});

	const onSubmit = async (data: SetPasswordFormData) => {
		setIsLoading(true);
		setError(null);
		try {
			await axios.post(`${appConstants.API_BASE_URL}auth/set-password`, {
				token,
				newPassword: data.password,
			});
			setComplete(true);
		} catch (err: any) {
			const msg = err?.response?.data?.message;
			setError(typeof msg === "string" ? msg : "Invalid or expired token");
		} finally {
			setIsLoading(false);
		}
	};

	if (complete) {
		return (
			<div className="min-h-screen bg-mint-50 dark:bg-[#0e0e1a] flex items-center justify-center p-4">
				<Card elevation={2} padding="lg" className="max-w-md w-full text-center animate-page-enter">
					<CheckCircle className="h-24 w-24 text-primary-600 dark:text-primary-400 mx-auto mb-6" />
					<h2 className="text-3xl font-bold text-on-surface dark:text-white">
						{copy.done}
					</h2>
					<p className="mt-4 text-on-surface-variant dark:text-gray-400">
						{copy.doneBody}
					</p>
					<div className="mt-6">
						<Button variant="filled" size="lg" onClick={() => router.push("/login")}>
							Sign In
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	// Wait for the query string before deciding the link is broken.
	if (router.isReady && !token) {
		return (
			<div className="min-h-screen bg-mint-50 dark:bg-[#0e0e1a] flex items-center justify-center p-4">
				<Card elevation={2} padding="lg" className="max-w-md w-full text-center animate-page-enter">
					<AlertCircle className="h-16 w-16 text-red-400 dark:text-red-500 mx-auto mb-6" />
					<h2 className="text-2xl font-bold text-on-surface dark:text-white">This link isn&apos;t valid</h2>
					<p className="mt-4 text-on-surface-variant dark:text-gray-400">
						The link is missing its token. Please open the link from your email again, or request a new one.
					</p>
					<div className="mt-6">
						<Button variant="filled" size="lg" onClick={() => router.push("/forgot-password")}>
							Request a new link
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-mint-50 dark:bg-[#0e0e1a] flex items-center justify-center p-4">
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
								alt="Green Pasture Organics Logo"
								height={100}
								width={100}
								priority
								sizes="(max-width: 768px) 2rem, (max-width: 1200px) 2.2rem, 3rem"
								className="object-contain"
							/>
						</div>
						<span className="text-md md:text-lg font-bold text-primary-800 dark:text-primary-300">
							Green Pasture Organics
						</span>
					</Link>
				</div>

				<h2 className="text-center text-2xl md:text-3xl font-bold text-on-surface dark:text-white/90 mb-2">
					{copy.title}
				</h2>
				<p className="text-center text-sm text-on-surface-variant dark:text-white/50 mb-8">
					{copy.subtitle}
				</p>

				<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
					{error && (
						<div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-radius-md p-4">
							<div className="flex">
								<AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
								<div className="ml-3">
									<p className="text-sm text-red-800 dark:text-red-300">{error}</p>
									<Link
										href="/forgot-password"
										className="mt-1 inline-block text-sm font-medium text-red-800 dark:text-red-300 underline"
									>
										Request a new link
									</Link>
								</div>
							</div>
						</div>
					)}

					<Input
						label="New Password"
						{...register("password")}
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						placeholder="Enter your new password"
						leftIcon={Lock}
						error={errors.password?.message}
						rightElement={
							<button
								type="button"
								className="text-on-surface/50 dark:text-white/30 hover:text-on-surface-variant dark:hover:text-gray-300 transition-colors"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
							</button>
						}
					/>

					<Input
						label="Confirm Password"
						{...register("confirmPassword")}
						type={showConfirmPassword ? "text" : "password"}
						autoComplete="new-password"
						placeholder="Confirm your new password"
						leftIcon={Lock}
						error={errors.confirmPassword?.message}
						rightElement={
							<button
								type="button"
								className="text-on-surface/50 dark:text-white/30 hover:text-on-surface-variant dark:hover:text-gray-300 transition-colors"
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
						disabled={isLoading || !router.isReady}
					>
						{isLoading ? copy.submitting : copy.submit}
					</Button>
				</form>

				<p className="text-center text-sm text-on-surface-variant dark:text-white/50 mt-6">
					{isReset ? "Remembered it?" : "Already have an account?"}{" "}
					<Link
						href="/login"
						className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
					>
						Sign in
					</Link>
				</p>
			</Card>
		</div>
	);
};

export default SetPasswordPage;
