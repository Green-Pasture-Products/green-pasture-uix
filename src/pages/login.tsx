import { Feature } from "@/_components/FeatureFlagProvider";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import GoogleButton from "@/_components/GoogleButton";
import AuthShowcase from "@/_components/AuthShowcase";
import { motion } from "framer-motion";
// triger deployment
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	clearError,
	setLoading,
} from "@/_redux/reducers/auth.reducer";
import { LoginFormData, loginSchema } from "@/_validations/auth";
import { useFeature } from "@/_hooks/useFeature";
import { useGoogleAuth } from "@/_hooks/useGoogleAuth";
import Image from "next/image";
import { loginAsync, resendOtpAsync } from "@/_redux/actions/auth.action";
import { appConstants } from "@/_redux/constants";
import { safeRedirectTarget } from "@/_utils/redirect";
import { logger } from "@/_utils";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";

const LoginPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isLoading, error, user, isAuthenticated } = useAppSelector(
		(state) => state.auth
	);
	const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();
	const signupOn = useFeature("auth.signup");
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	useEffect(() => {
		dispatch(clearError());
		dispatch(setLoading(false));
	}, [dispatch]);

	const onSubmit = async (data: LoginFormData) => {
		const result = await dispatch(loginAsync(data));
		if (!loginAsync.rejected.match(result)) return;
		logger.log({ logginError: result.payload });

		// Unverified account: send a fresh OTP and take them to enter it, instead
		// of leaving them stuck on "Profile has not been verified".
		if (result.meta.code === "PROFILE_NOT_VERIFIED") {
			const res = await dispatch(resendOtpAsync({ email: data.email }));
			const expiresIn = resendOtpAsync.fulfilled.match(res) ? res.payload?.data?.expiresIn : undefined;
			dispatch(clearError());
			router.push(
				`/verify-account?email=${encodeURIComponent(data.email)}${expiresIn ? `&expiresIn=${expiresIn}` : ""}`
			);
		}
	};

	useEffect(() => {
		if (isAuthenticated && user) {
			const isAdminUser = appConstants.ADMIN_ROLES.includes(
				user?.profileType?.toUpperCase() as any || ""
			);

			const redirect = safeRedirectTarget(router.query.redirect as string);

			if (isAdminUser) {
				// Admins go straight to admin dashboard
				router.push(redirect.startsWith("/admin") ? redirect : "/admin/dashboard");
				return;
			}

			// Customer: sync cart with backend (backend derives customer from JWT)
			const syncCart = async () => {
				try {
					const { syncCartOnLoginAsync } = await import("@/_redux/actions/cart.action");
					await dispatch(syncCartOnLoginAsync(true)).unwrap();
				} catch {}
			};
			syncCart();

			// Same reconciliation for the wishlist — local (guest) items get
			// pushed up, then the backend list becomes the source of truth.
			const syncWishlist = async () => {
				try {
					const { syncWishlistOnLoginAsync } = await import("@/_redux/actions/wishlist.action");
					await dispatch(syncWishlistOnLoginAsync(true)).unwrap();
				} catch {}
			};
			syncWishlist();

			router.push(redirect);
		}
	}, [isAuthenticated, user, dispatch, router]);

	return (
		<div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]" style={{ background: "var(--background)" }}>
			<AuthShowcase />

			{/* Form */}
			<main className="flex items-center justify-center p-6 sm:p-10">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
					className="w-full max-w-sm"
				>
					<Link href="/" aria-label="Green Pasture Organics home" className="lg:hidden mb-8 flex items-center gap-3">
						<Image src="/images/GP Organic Logo (Primary).png" alt="" height={48} width={48} priority className="object-contain" />
						<span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
							Green Pasture Organics
						</span>
					</Link>

					<h2 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
						Welcome back
					</h2>
					{signupOn && (
						<p className="mt-2 text-sm" style={{ color: "var(--text-hint)" }}>
							New here?{" "}
							<Link href="/signup" className="font-semibold" style={{ color: "var(--color-primary)" }}>
								Create an account
							</Link>
						</p>
					)}

					<Feature name="auth.google_signin">
						<div className="mt-8">
							<GoogleButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
						</div>
						<div className="flex items-center gap-3 my-6">
							<div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
							<span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-hint)" }}>
								or
							</span>
							<div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
						</div>
					</Feature>

					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-start gap-2 p-3 rounded-lg text-xs"
								style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}
							>
								<AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
								<span>{error}</span>
							</motion.div>
						)}

						<div className="hidden md:block">
							<Input
								label="Email Address"
								{...register("email")}
								type="email"
								autoComplete="email"
								placeholder="your@email.com"
								leftIcon={Mail}
								error={errors.email?.message}
							/>
						</div>

						<div>
							<div className="flex items-center justify-between mb-1">
								<label className="block text-xs md:text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
									Password
								</label>
								<Link href="/forgot-password" className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
									Forgot?
								</Link>
							</div>
							<Input
								{...register("password")}
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								placeholder="••••••••"
								leftIcon={Lock}
								error={errors.password?.message}
								rightElement={
									<button
										type="button"
										aria-label={showPassword ? "Hide password" : "Show password"}
										className="transition-colors"
										style={{ color: "var(--text-hint)" }}
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
									</button>
								}
							/>
						</div>

						<Button type="submit" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</form>
				</motion.div>
			</main>
		</div>
	);
};

export default LoginPage;
