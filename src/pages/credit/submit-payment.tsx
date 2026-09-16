import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import AuthPrompt from "@/_UI/AuthPrompt";
import PageLoader from "@/_UI/PageLoader";
import { Upload, AlertCircle } from "lucide-react";

const SubmitPayment: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [showAuthPrompt, setShowAuthPrompt] = useState(false);
	const [loading, setLoading] = useState(false);
	const [creditInfo, setCreditInfo] = useState<any>(null);
	const [formData, setFormData] = useState({
		paymentAmount: "",
		paymentDate: new Date().toISOString().split("T")[0],
		paymentMethod: "BANK_TRANSFER",
		transactionReference: "",
		proofOfPaymentUrl: "",
	});

	useEffect(() => {
		if (!isAuthenticated) {
			setShowAuthPrompt(true);
			return;
		}
		fetchCreditInfo();
	}, [isAuthenticated]);

	const fetchCreditInfo = async () => {
		try {
			const res = await fetch("/api/v1/credit/account", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				setCreditInfo(await res.json());
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// In a real app, upload to S3/Cloudinary
		// For now, create a simple data URL
		const reader = new FileReader();
		reader.onloadend = () => {
			setFormData((prev) => ({
				...prev,
				proofOfPaymentUrl: reader.result as string,
			}));
			toast.success("Proof of payment attached");
		};
		reader.readAsDataURL(file);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.paymentAmount) {
			toast.error("Payment amount is required");
			return;
		}

		const amount = parseFloat(formData.paymentAmount);
		if (amount <= 0) {
			toast.error("Payment amount must be greater than zero");
			return;
		}

		if (creditInfo && amount > creditInfo.outstandingBalance) {
			toast.error(`Payment cannot exceed outstanding balance of ₦${creditInfo.outstandingBalance}`);
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/v1/credit/payment-notifications", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					paymentAmount: amount,
					paymentDate: formData.paymentDate,
					paymentMethod: formData.paymentMethod,
					transactionReference: formData.transactionReference || undefined,
					proofOfPaymentUrl: formData.proofOfPaymentUrl || undefined,
				}),
			});

			if (res.ok) {
				toast.success("Payment submitted successfully! It will be verified shortly.");
				router.push("/credit/dashboard");
			} else {
				const error = await res.json();
				toast.error(error.message || "Failed to submit payment");
			}
		} catch (error) {
			toast.error("Error submitting payment");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	if (showAuthPrompt) return <AuthPrompt isOpen={showAuthPrompt} />;

	return (
		<Layout>
			<div className="max-w-2xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submit Payment</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-8">
					Report a payment you've made and provide proof for verification
				</p>

				{creditInfo && creditInfo.outstandingBalance > 0 && (
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
						<div className="font-medium text-blue-900 dark:text-blue-100">Outstanding Balance</div>
						<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							₦{creditInfo.outstandingBalance.toLocaleString()}
						</div>
						<p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
							You can submit a payment of up to this amount.
						</p>
					</div>
				)}

				{creditInfo && creditInfo.outstandingBalance === 0 && (
					<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
						<div className="text-green-900 dark:text-green-100">
							Your account is fully paid! No payment is needed at this time.
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
					{/* Payment Amount */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Payment Amount *
						</label>
						<div className="relative">
							<span className="absolute left-3 top-3 text-gray-600 dark:text-gray-400 font-medium">₦</span>
							<input
								type="number"
								step="100"
								min="0"
								value={formData.paymentAmount}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, paymentAmount: e.target.value }))
								}
								placeholder="Enter amount"
								className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
								disabled={loading}
							/>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							Must be between ₦1 and ₦{creditInfo?.outstandingBalance?.toLocaleString() || "N/A"}
						</p>
					</div>

					{/* Payment Date */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Payment Date *
						</label>
						<input
							type="date"
							value={formData.paymentDate}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, paymentDate: e.target.value }))
							}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
							disabled={loading}
						/>
					</div>

					{/* Payment Method */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Payment Method *
						</label>
						<select
							value={formData.paymentMethod}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
							}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
							disabled={loading}
						>
							<option value="BANK_TRANSFER">Bank Transfer</option>
							<option value="CASH">Cash</option>
							<option value="OTHER">Other</option>
						</select>
					</div>

					{/* Transaction Reference */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Transaction Reference
						</label>
						<input
							type="text"
							value={formData.transactionReference}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									transactionReference: e.target.value,
								}))
							}
							placeholder="e.g., bank receipt number"
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
							disabled={loading}
						/>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							Optional - helps us verify the payment
						</p>
					</div>

					{/* Proof of Payment */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Proof of Payment
						</label>
						<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition">
							<input
								type="file"
								accept="image/*,.pdf"
								onChange={handleFileChange}
								className="hidden"
								id="proof-upload"
								disabled={loading}
							/>
							<label htmlFor="proof-upload" className="cursor-pointer block">
								<Upload className="mx-auto text-gray-400 mb-2" size={32} />
								<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{formData.proofOfPaymentUrl ? "✓ Proof attached" : "Click to upload or drag and drop"}
								</div>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									PNG, JPG, or PDF (max 5MB)
								</p>
							</label>
						</div>
					</div>

					{/* Info Alert */}
					<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start space-x-3">
						<AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
						<div className="text-sm text-amber-800 dark:text-amber-200">
							Your payment submission will be reviewed by our team. We'll verify the payment and update your balance within 24 hours.
						</div>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={loading || !creditInfo?.outstandingBalance}
						className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition disabled:cursor-not-allowed"
					>
						{loading ? "Submitting..." : "Submit Payment"}
					</button>
				</form>
			</div>
		</Layout>
	);
};

export default SubmitPayment;
