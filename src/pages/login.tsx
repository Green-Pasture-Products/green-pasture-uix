import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Leaf, Heart } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

import { useAppDispatch, useAppSelector } from "@/_redux/store";
import {
	clearError,
	setLoading,
} from "@/_redux/reducers/auth.reducer";
import { LoginFormData, loginSchema } from "@/_validations/auth";
import { useGoogleAuth } from "@/_hooks/useGoogleAuth";
import Image from "next/image";
import { loginAsync } from "@/_redux/actions/auth.action";
import { appConstants } from "@/_redux/constants";
import { safeRedirectTarget } from "@/_utils/redirect";
import { logger } from "@/_utils";
import Card from "@/_UI/Card";
import Input from "@/_UI/Input";
import Button from "@/_UI/Button";

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
		try {
			await dispatch(loginAsync(data)).unwrap();
		} catch (err: any) {
			logger.log({ logginError: err });
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
		<div className="min-h-screen relative overflow-hidden" style={{
			background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
			backgroundAttachment: "fixed"
		}}>
			{/* Animated Background Elements */}
			<motion.div
				className="absolute top-10 left-10 opacity-20"
				animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
				transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
			>
				<Leaf className="w-24 h-24 text-green-600" strokeWidth={1} />
			</motion.div>
			<motion.div
				className="absolute bottom-20 right-10 opacity-15"
				animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
				transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
			>
				<Leaf className="w-32 h-32 text-green-500" strokeWidth={1} />
			</motion.div>
			<motion.div
				className="absolute top-1/3 right-20 opacity-10"
				animate={{ rotate: 360 }}
				transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
			>
				<Heart className="w-20 h-20 text-green-600" strokeWidth={1} />
			</motion.div>

			{/* Main Content */}
			<div className="min-h-screen flex items-center justify-center p-4 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="w-full max-w-md"
				>
					<Card
						elevation={3}
						padding="lg"
						className="rounded-3xl backdrop-blur-sm"
						style={{
							background: "rgba(255, 255, 255, 0.95)",
							border: "1px solid rgba(34, 197, 94, 0.1)",
							boxShadow: "0 20px 60px rgba(34, 197, 94, 0.1)"
						}}
					>
					{/* Logo */}
					<motion.div
						className="flex justify-center mb-6"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						<Link href="/" className="flex items-center space-x-3 group">
							<motion.div
								className="relative w-10 aspect-square"
								whileHover={{ scale: 1.1 }}
								transition={{ type: "spring", stiffness: 400 }}
							>
								<Image
									src="/images/GP Organic Logo (Primary).png"
									alt="Green Pastures Logo"
									height={100}
									width={100}
									priority
									sizes="(max-width: 768px) 2.5rem, 3rem"
									className="object-contain"
								/>
							</motion.div>
							<span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent group-hover:from-green-500 group-hover:to-green-600 transition-all">
								Green Pastures
							</span>
						</Link>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-center mb-8"
					>
						<h2 className="text-3xl font-bold mb-2" style={{ color: "#065f46" }}>
							Welcome Back
						</h2>
						<p className="text-sm text-green-700/60 mb-4">
							Nourish your wellness journey with organic goodness
						</p>
						<div className="flex items-center justify-center gap-2">
							<div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-green-400" />
							<Leaf className="w-4 h-4 text-green-600" strokeWidth={1.5} />
							<div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-green-400" />
						</div>
					</motion.div>

					<p className="text-center text-sm text-green-700/70 mb-6">
						Don't have an account?{" "}
						<Link
							href="/signup"
							className="font-semibold text-green-600 hover:text-green-700 transition-colors"
						>
							Sign up
						</Link>
					</p>

					<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4"
								style={{
									background: "linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.8) 100%)"
								}}
							>
								<div className="flex items-start gap-3">
									<AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
									<p className="text-sm text-red-700 font-medium">{error}</p>
								</div>
							</motion.div>
						)}

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
						>
							<Input
								label="Email Address"
								{...register("email")}
								type="email"
								autoComplete="email"
								placeholder="your@email.com"
								leftIcon={Mail}
								error={errors.email?.message}
								className="focus:ring-2 focus:ring-green-400 focus:border-green-500"
							/>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.15 }}
						>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-sm font-semibold text-green-900">
									Password
								</label>
								<Link
									href="/forgot-password"
									className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
								>
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
								className="focus:ring-2 focus:ring-green-400 focus:border-green-500"
								rightElement={
									<motion.button
										type="button"
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										className="text-green-600/60 hover:text-green-600 transition-colors"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</motion.button>
								}
							/>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Button
								type="submit"
								size="lg"
								fullWidth
								loading={isLoading}
								disabled={isLoading}
								className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/30"
							>
								{isLoading ? (
									<span className="flex items-center justify-center gap-2">
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
										>
											<Leaf className="w-4 h-4" />
										</motion.div>
										Signing in...
									</span>
								) : (
									"Sign In"
								)}
							</Button>
						</motion.div>
					</form>

					{/* Divider */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-8 pt-6"
						style={{
							borderTop: "1px solid rgba(34, 197, 94, 0.1)"
						}}
					>
						<div className="flex items-center gap-3 mb-5">
							<div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent" />
							<span className="text-xs font-medium text-green-600 uppercase tracking-wide">Or continue with</span>
							<div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent" />
						</div>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.4 }}
						>
							<GoogleLogin
								onSuccess={handleGoogleSuccess}
								onError={handleGoogleError}
								theme="outline"
								size="large"
								width="100%"
							/>
						</motion.div>
					</motion.div>
					</Card>
				</motion.div>
			</div>
		</div>
	);
};

export default LoginPage;
