import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import { LoginFormData, loginSchema } from "@/_validations/auth";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { clearError } from "@/_redux/reducers/auth.reducer";
import { loginAsync } from "@/_redux/actions/auth.action";
import { authConstants } from "@/_redux/constants";
import { getObjectFromStorage, logger, setObjectInStorage } from "@/_utils";
import Loader from "@/_components/Loader";

interface StoredCred {
	email?: string;
	password?: string;
}

const LoginPage: React.FC = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [showPassword, setShowPassword] = useState(false);
	const [storedCred, setStoredCred] = useState<StoredCred | null>(null);
	const { isLoading, error, user, isAuthenticated } = useAppSelector(
		(state) => state.auth
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	useEffect(() => {
		dispatch(clearError());
	}, []);

	useEffect(() => {
		(async () => {
			const { email, password } =
				(await getObjectFromStorage(authConstants.USER_CRED)) || {};
			setStoredCred({ email, password });
		})();
	}, []);

	const onSubmit = async (data: LoginFormData) => {
		try {
			if (data?.remember) {
				setObjectInStorage(authConstants.USER_CRED, {
					email: data.email,
					password: data.password,
				});
			}
			dispatch(loginAsync({ email: data.email, password: data.password }));
		} catch (err: any) {
			logger.log({ logginError: err });
		}
	};

	useEffect(() => {
		if (isAuthenticated) {
			const redirect = router.query.redirect as string;
			if (user?.profileType === "STAFF") {
				router.push(redirect || "/admin/dashboard");
			} else {
				router.push(redirect || "/");
			}
		}
		// Redirect to home or previous page
	}, [isAuthenticated]);

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
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Or{" "}
						<Link
							href="/signup"
							className="font-medium text-green-600 hover:text-green-500"
						>
							create a new account
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
									className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10"
									placeholder="Enter your email"
									value={storedCred?.email}
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
									autoComplete="current-password"
									className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10"
									placeholder="Enter your password"
									value={storedCred?.password}
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
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								{...register("remember")}
								id="remember-me"
								type="checkbox"
								className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="remember-me"
								className="ml-2 block text-sm text-gray-900"
							>
								Remember me
							</label>
						</div>

						<div className="text-sm">
							<Link
								href="/forgot-password"
								className="font-medium text-green-600 hover:text-green-500"
							>
								Forgot your password?
							</Link>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? <Loader text="Signing in..." /> : "Sign in"}
						</button>
					</div>

					<div className="text-center">
						<p className="text-sm text-gray-600">
							Demo credentials: user@example.com / password123
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
