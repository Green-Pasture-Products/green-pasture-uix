import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

import { clearError } from "@/_redux/reducers/auth.reducer";
import { appConstants } from "@/_redux/constants";
import { signupSchema, signupStep1Schema, SignupFormData } from "@/_validations/auth";
import { signupAsync } from "@/_redux/actions/auth.action";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { useGoogleAuth } from "@/_hooks/useGoogleAuth";
import Image from "next/image";
import { FormInput } from "@/_UI/FormField";
import WhatsAppIcon from "@/_UI/WhatsAppIcon";

const slideVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 200 : -200,
		opacity: 0,
	}),
	center: { x: 0, opacity: 1 },
	exit: (direction: number) => ({
		x: direction > 0 ? -200 : 200,
		opacity: 0,
	}),
};

const SignupPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [step, setStep] = useState(1);
	const [direction, setDirection] = useState(1);
	const showGoogleForm = true;

	const {
		register,
		handleSubmit,
		watch,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema) as any,
		defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
		mode: "onSubmit",
	});

	React.useEffect(() => {
		dispatch(clearError());
	}, [dispatch]);

	const onSubmit = async (data: SignupFormData) => {
		try {
			const res = await dispatch(
				signupAsync({
					firstName: data.firstName,
					lastName: data.lastName,
					email: data.email,
					password: data.password,
					profileType: "CLIENT",
				} as any)
			).unwrap();
			// Carry the OTP's lifetime across so the verify page can start its countdown
			// at the moment the code was actually issued, not when that page mounts.
			const expiresIn = res?.data?.expiresIn;
			router.push(
				`/verify-account?email=${encodeURIComponent(data.email)}${expiresIn ? `&expiresIn=${expiresIn}` : ""}`
			);
		} catch {}
	};

	const errorMessage = error
		? typeof error === "string"
			? error
			: Array.isArray(error)
				? (error as string[]).join(". ")
				: "Registration failed. Please try again."
		: null;

	// Watch values for step summary
	const firstName = watch("firstName");
	const email = watch("email");
	const lastName = watch("lastName");

	const goNext = () => {
		const result = signupStep1Schema.safeParse({ firstName, lastName, email });
		if (!result.success) {
			clearErrors(["firstName", "lastName", "email"]);
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof SignupFormData;
				setError(field, { message: issue.message });
			}
			return;
		}

		clearErrors();
		setDirection(1);
		setStep(2);
	};

	const goBack = () => {
		setDirection(-1);
		setStep(1);
	};

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center gap-6 p-4"
			style={{ background: "var(--background)" }}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<Link href="/" aria-label="Green Pasture Organics home" className="flex flex-col items-center gap-2">
					<Image
						src="/images/GP Organic Logo (Primary).png"
						alt="Green Pasture Organics logo"
						height={96}
						width={96}
						priority
						className="object-contain"
					/>
					<span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
						Green Pasture Organics
					</span>
				</Link>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
				className="w-full max-w-md rounded-2xl overflow-hidden"
				style={{
					background: "var(--surface-paper)",
					border: "1px solid var(--border-light)",
					boxShadow: "var(--shadow-xl)",
				}}
			>
				<div className="px-8 pt-8 pb-2">
					<h2
						className="text-center text-xl font-bold mb-1"
						style={{ color: "var(--text-primary)" }}
					>
						Create your account
					</h2>
					<p className="text-center text-xs mb-6" style={{ color: "var(--text-hint)" }}>
						Already have an account?{" "}
						<Link href="/login" className="font-medium" style={{ color: "var(--color-primary)" }}>
							Sign in
						</Link>
					</p>

					{/* Google Sign-Up Option */}
				{showGoogleForm && (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
    >
        <div className="w-full flex justify-center overflow-hidden min-h-[44px]">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                type="standard"
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                width="300"
                useOneTap={false}
            />
        </div>
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px]" style={{ background: "var(--border-light)" }} />
            <span className="text-xs" style={{ color: "var(--text-hint)" }}>Or continue with email</span>
            <div className="flex-1 h-[1px]" style={{ background: "var(--border-light)" }} />
        </div>
    </motion.div>
)}

				</div>

				{/* Form */}
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="px-8 overflow-hidden" style={{ minHeight: 180 }}>
						{errorMessage && step === 2 && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-start gap-2 p-3 rounded-lg text-xs mb-4"
								style={{
									background: "rgba(239,68,68,0.08)",
									border: "1px solid rgba(239,68,68,0.2)",
									color: "#dc2626",
								}}
							>
								<AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
								<span>{errorMessage}</span>
							</motion.div>
						)}

						<AnimatePresence mode="wait" custom={direction}>
							{/* Step 1: Personal and Contact */}
							{step === 1 && (
								<motion.div
									key="step1"
									custom={direction}
									variants={slideVariants}
									initial="enter"
									animate="center"
									exit="exit"
									transition={{ duration: 0.25, ease: "easeInOut" }}
									className="space-y-4"
								>
									<div className="grid grid-cols-2 gap-3">
										<FormInput
											label="First Name"
											placeholder="John"
											required
											{...register("firstName")}
											error={errors.firstName?.message}
										/>
										<FormInput
											label="Last Name"
											placeholder="Doe"
											required
											{...register("lastName")}
											error={errors.lastName?.message}
										/>
									</div>
									<FormInput
										label="Email Address"
										type="email"
										placeholder="john@example.com"
										required
										{...register("email")}
										error={errors.email?.message}
									/>
								</motion.div>
							)}

							{/* Step 2: Security */}
							{step === 2 && (
								<motion.div
									key="step2"
									custom={direction}
									variants={slideVariants}
									initial="enter"
									animate="center"
									exit="exit"
									transition={{ duration: 0.25, ease: "easeInOut" }}
									className="space-y-4"
								>
									{/* Summary */}
									{firstName && (
										<div
											className="p-3 rounded-lg text-xs"
											style={{
												background: "rgba(22,163,74,0.06)",
												border: "1px solid rgba(22,163,74,0.12)",
												color: "var(--text-secondary)",
											}}
										>
											Creating account for <strong style={{ color: "var(--text-primary)" }}>{firstName}</strong>
											{email && <> · <span style={{ color: "var(--text-hint)" }}>{email}</span></>}
										</div>
									)}

									<div className="relative">
										<FormInput
											label="Password"
											type={showPassword ? "text" : "password"}
											placeholder="Min. 8 characters"
											required
											{...register("password")}
											error={errors.password?.message}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-[2rem] p-1 cursor-pointer"
											style={{ color: "var(--text-hint)" }}
										>
											{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>

									<div className="relative">
										<FormInput
											label="Confirm password"
											type={showConfirmPassword ? "text" : "password"}
											placeholder="Re-enter password"
											required
											{...register("confirmPassword")}
											error={errors.confirmPassword?.message}
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-[2rem] p-1 cursor-pointer"
											style={{ color: "var(--text-hint)" }}
										>
											{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>

									<label className="flex items-start gap-2 cursor-pointer">
										<input
											type="checkbox"
											required
											className="mt-0.5 h-4 w-4 rounded cursor-pointer accent-green-600"
										/>
										<span className="text-[0.65rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
											I agree to the{" "}
											<Link href="/terms" style={{ color: "var(--color-primary)" }}>Terms</Link>
											{" "}and{" "}
											<Link href="/privacy" style={{ color: "var(--color-primary)" }}>Privacy Policy</Link>
										</span>
									</label>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Footer Buttons */}
					<div
						className="px-8 py-4 flex items-center justify-between"
						style={{ borderTop: "1px solid var(--border-light)" }}
					>
						{step === 1 ? (
							<button
								type="button"
								onClick={goNext}
								className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer press-effect"
								style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-sm)" }}
							>
								Continue
								<ArrowRight className="w-3.5 h-3.5" />
							</button>
						) : (
							<>
								<button
									type="button"
									onClick={goBack}
									className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer press-effect px-3 py-2 rounded-lg"
									style={{ color: "var(--text-secondary)" }}
								>
									<ArrowLeft className="w-3.5 h-3.5" />
									Back
								</button>
								<button
									type="submit"
									disabled={isLoading}
									className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer press-effect disabled:opacity-60 disabled:cursor-not-allowed"
									style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-sm)" }}
								>
								{isLoading ? (
									<>
										<svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
										</svg>
										Creating...
									</>
								) : (
									<>
										Create account
										<Check className="w-3.5 h-3.5" />
									</>
								)}
								</button>
							</>
						)}
					</div>
				</form>

			</motion.div>

			<div
				className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-lg"
				style={{ background: "var(--color-primary)" }}
			>
				<span className="text-xs font-semibold text-white">
					Message us
				</span>
				<a
					href={appConstants.WHATSAPP_URL}
					target="_blank"
					rel="noreferrer"
					aria-label="Message us on WhatsApp"
					className="p-1 rounded-full transition-colors text-white"
				>
					<WhatsAppIcon size={20} />
				</a>
				<a
					href={appConstants.CONTACT.EMAIL_HREF}
					aria-label="Email us"
					className="p-1 rounded-full transition-colors text-white"
				>
					<Mail className="h-5 w-5" />
				</a>
			</div>
		</div>
	);
};

export default SignupPage;
