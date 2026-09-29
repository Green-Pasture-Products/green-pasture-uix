import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
// triger deployment
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	clearError,
	setLoading,
} from "@/_redux/reducers/auth.reducer";
import { LoginFormData, loginSchema } from "@/_validations/auth";
import { useGoogleAuth } from "@/_hooks/useGoogleAuth";
import Image from "next/image";
import { loginAsync, resendOtpAsync } from "@/_redux/actions/auth.action";
import { appConstants } from "@/_redux/constants";
import { safeRedirectTarget } from "@/_utils/redirect";
import { logger } from "@/_utils";
import Card from "@/_UI/Card";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";
import WhatsAppIcon from "@/_UI/WhatsAppIcon";

const LoginPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isLoading, error, user, isAuthenticated } = useAppSelector(
		(state) => state.auth
	);
	const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();
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
				transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
				className="w-full max-w-md rounded-2xl overflow-hidden"
				style={{
					background: "var(--surface-paper)",
					border: "1px solid var(--border-light)",
					boxShadow: "var(--shadow-xl)",
				}}
			>
				<Card elevation={0} padding="lg" className="!border-0 !bg-transparent !rounded-none">
					<h2 className="text-center text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
						Welcome back
					</h2>
					<p className="text-center text-xs mb-6" style={{ color: "var(--text-hint)" }}>
						Don't have an account?{" "}
						<Link href="/signup" className="font-medium" style={{ color: "var(--color-primary)" }}>
							Sign up
						</Link>
					</p>

					{/* Google Sign-In */}
					{/* Google Sign-In */}
<div className="mb-4">
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
        <span className="text-xs" style={{ color: "var(--text-hint)" }}>
            Or continue with email
        </span>
        <div className="flex-1 h-[1px]" style={{ background: "var(--border-light)" }} />
    </div>
</div>

					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-start gap-2 p-3 rounded-lg text-xs"
								style={{
									background: "rgba(239,68,68,0.08)",
									border: "1px solid rgba(239,68,68,0.2)",
									color: "#dc2626",
								}}
							>
								<AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
								<span>{error}</span>
							</motion.div>
						)}

						<Input
							label="Email Address"
							{...register("email")}
							type="email"
							autoComplete="email"
							placeholder="your@email.com"
							leftIcon={Mail}
							error={errors.email?.message}
						/>

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

				</Card>
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

export default LoginPage;
