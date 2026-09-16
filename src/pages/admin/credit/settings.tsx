import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";

interface CreditSettings {
	minCreditLimit: number;
	maxCreditLimit: number;
	defaultPaymentTermDays: number;
	overdueTolerance: number;
	requireProofOfPayment: boolean;
	autoVerifyPayments: boolean;
}

const AdminCreditSettings: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [settings, setSettings] = useState<CreditSettings | null>(null);
	const [formData, setFormData] = useState<Partial<CreditSettings>>({});
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		fetchSettings();
	}, [isAuthenticated]);

	const fetchSettings = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/v1/admin/credit/settings", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				const data = await res.json();
				setSettings(data);
				setFormData(data);
			} else {
				toast.error("Failed to fetch settings");
			}
		} catch (error) {
			toast.error("Error loading settings");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
		setFormData((prev) => ({
			...prev,
			[name]: type === "number" ? parseFloat(value) : fieldValue,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setUpdating(true);
			const res = await fetch("/api/v1/admin/credit/settings", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (res.ok) {
				toast.success("Settings updated successfully");
				fetchSettings();
			} else {
				toast.error("Failed to update settings");
			}
		} catch (error) {
			toast.error("Error updating settings");
			console.error(error);
		} finally {
			setUpdating(false);
		}
	};

	if (loading) return <PageLoader />;

	if (!settings || !formData) {
		return (
			<Layout>
				<div className="max-w-2xl mx-auto px-4 py-8">
					<p className="text-gray-600 dark:text-gray-400">Failed to load settings</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="max-w-2xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link href="/admin/credit/dashboard">
					<a className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
						<ChevronLeft size={20} />
						<span>Back to Dashboard</span>
					</a>
				</Link>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Credit Settings</h1>
					<p className="text-gray-600 dark:text-gray-400">Configure credit system parameters</p>
				</div>

				{/* Info Alert */}
				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 flex gap-3">
					<AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
					<div>
						<p className="text-sm font-medium text-blue-900 dark:text-blue-100">System Settings</p>
						<p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
							These settings apply globally to all credit accounts in the system.
						</p>
					</div>
				</div>

				{/* Settings Form */}
				<form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
					{/* Credit Limits Section */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Credit Limits</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Min Credit Limit */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Minimum Credit Limit
								</label>
								<div className="relative">
									<span className="absolute left-3 top-3 text-gray-600 dark:text-gray-400">₦</span>
									<input
										type="number"
										name="minCreditLimit"
										value={formData.minCreditLimit || ""}
										onChange={handleChange}
										min="0"
										step="1000"
										className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
									/>
								</div>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Minimum amount for new credit accounts
								</p>
							</div>

							{/* Max Credit Limit */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Maximum Credit Limit
								</label>
								<div className="relative">
									<span className="absolute left-3 top-3 text-gray-600 dark:text-gray-400">₦</span>
									<input
										type="number"
										name="maxCreditLimit"
										value={formData.maxCreditLimit || ""}
										onChange={handleChange}
										min="0"
										step="1000"
										className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
									/>
								</div>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Maximum amount for credit accounts
								</p>
							</div>
						</div>
					</div>

					{/* Payment Terms Section */}
					<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Terms</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Default Payment Terms */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Default Payment Terms (Days)
								</label>
								<input
									type="number"
									name="defaultPaymentTermDays"
									value={formData.defaultPaymentTermDays || ""}
									onChange={handleChange}
									min="1"
									max="180"
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Number of days given for payment from order date
								</p>
							</div>

							{/* Overdue Tolerance */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Overdue Tolerance (Days)
								</label>
								<input
									type="number"
									name="overdueTolerance"
									value={formData.overdueTolerance || ""}
									onChange={handleChange}
									min="0"
									max="30"
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Grace period before account marked as overdue
								</p>
							</div>
						</div>
					</div>

					{/* Verification Settings Section */}
					<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Settings</h3>
						<div className="space-y-4">
							{/* Require Proof of Payment */}
							<div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
								<input
									type="checkbox"
									name="requireProofOfPayment"
									checked={formData.requireProofOfPayment || false}
									onChange={handleChange}
									className="w-4 h-4 text-blue-600 rounded"
								/>
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Require Proof of Payment
									</label>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Customers must upload proof when submitting payment
									</p>
								</div>
							</div>

							{/* Auto Verify Payments */}
							<div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
								<input
									type="checkbox"
									name="autoVerifyPayments"
									checked={formData.autoVerifyPayments || false}
									onChange={handleChange}
									className="w-4 h-4 text-blue-600 rounded"
								/>
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Auto-Verify Payments
									</label>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Automatically verify payment submissions without admin review
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-3">
						<button
							type="submit"
							disabled={updating}
							className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition"
						>
							<Save size={18} />
							<span>{updating ? "Saving..." : "Save Settings"}</span>
						</button>
						<button
							type="button"
							onClick={() => {
								setFormData(settings);
								toast.success("Changes discarded");
							}}
							className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition"
						>
							Cancel
						</button>
					</div>
				</form>

				{/* Configuration Notes */}
				<div className="mt-8 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
					<h3 className="font-semibold text-gray-900 dark:text-white mb-3">Configuration Notes</h3>
					<ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
						<li className="flex gap-2">
							<span>•</span>
							<span>Credit limit ranges apply to new account applications</span>
						</li>
						<li className="flex gap-2">
							<span>•</span>
							<span>Payment terms determine when invoices are due</span>
						</li>
						<li className="flex gap-2">
							<span>•</span>
							<span>Overdue tolerance is the grace period before system marks as overdue</span>
						</li>
						<li className="flex gap-2">
							<span>•</span>
							<span>Enabling proof requirement ensures audit trail compliance</span>
						</li>
						<li className="flex gap-2">
							<span>•</span>
							<span>Auto-verify should only be used with high-confidence payment methods</span>
						</li>
					</ul>
				</div>
			</div>
		</Layout>
	);
};

export default AdminCreditSettings;
