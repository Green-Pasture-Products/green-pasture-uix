import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Button from "@/_UI/Button";
import axiosInstance from "@/_utils/axiosInstance";

const ResetPasswordPage: React.FC = () => {
	const router = useRouter();
	const { token } = router.query;

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (router.isReady && !token) {
			toast.dismiss();
			toast.error("Invalid or missing reset token");
			setTimeout(() => router.push("/login"), 1500);
		}
	}, [token, router, router.isReady]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password || !confirmPassword) {
			toast.error("Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		setIsLoading(true);
		try {
			await axiosInstance.post("/auth/set-password", {
				token,
				newPassword: password,
			});

			toast.success("Password reset successfully!");
			setTimeout(() => {
				toast.dismiss();
				router.push("/login");
			}, 1500);
		} catch (error: any) {
			const errorMessage = error?.response?.data?.message || "Failed to reset password";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (!router.isReady || !token) {
		return null;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-8">
					<h1 className="text-3xl font-bold text-center mb-2" style={{ color: "var(--color-primary)" }}>
						Reset Password
					</h1>
					<p className="text-center text-gray-600 mb-8">Enter your new password below</p>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								New Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter new password"
									className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
									disabled={isLoading}
								/>
							</div>
							<p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password
							</label>
							<input
								type={showPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm new password"
								className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
								disabled={isLoading}
							/>
						</div>

						<div className="flex items-center">
							<input
								type="checkbox"
								checked={showPassword}
								onChange={(e) => setShowPassword(e.target.checked)}
								className="w-4 h-4 rounded"
								id="showPassword"
							/>
							<label htmlFor="showPassword" className="ml-2 text-sm text-gray-700">
								Show password
							</label>
						</div>

						<Button
							variant="filled"
							onClick={() => {}}
							disabled={isLoading}
							className="w-full"
						>
							{isLoading ? "Resetting..." : "Reset Password"}
						</Button>
					</form>

					<p className="text-center text-sm text-gray-600 mt-6">
						Remember your password?{" "}
						<a href="/login" className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
							Back to login
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
