import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface CreditCustomer {
	id: string;
	name: string;
	email: string;
	phone: string;
	creditAccount?: {
		id: string;
		creditStatus: "ACTIVE" | "SUSPENDED" | "DISABLED";
		creditLimit: number;
		outstandingBalance: number;
		availableCredit: number;
		paymentTermDays: number;
		dueDate?: string;
	};
}

const AdminCreditCustomerDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [customer, setCustomer] = useState<CreditCustomer | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [formData, setFormData] = useState({
		creditLimit: 0,
		paymentTermDays: 30,
		status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "DISABLED",
	});

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		if (id) {
			fetchCustomer();
		}
	}, [isAuthenticated, id]);

	const fetchCustomer = async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/v1/admin/credit/customers/${id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				const data = await res.json();
				setCustomer(data);
				if (data.creditAccount) {
					setFormData({
						creditLimit: data.creditAccount.creditLimit,
						paymentTermDays: data.creditAccount.paymentTermDays,
						status: data.creditAccount.creditStatus,
					});
				}
			} else {
				toast.error("Failed to fetch customer");
			}
		} catch (error) {
			toast.error("Error loading customer");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "creditLimit" || name === "paymentTermDays" ? parseFloat(value) : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!customer?.creditAccount) {
			toast.error("No credit account found");
			return;
		}

		try {
			setUpdating(true);
			const res = await fetch(`/api/v1/admin/credit/customers/${customer.id}`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					creditLimit: formData.creditLimit,
					paymentTermDays: formData.paymentTermDays,
					creditStatus: formData.status,
				}),
			});

			if (res.ok) {
				toast.success("Customer updated successfully");
				fetchCustomer();
			} else {
				toast.error("Failed to update customer");
			}
		} catch (error) {
			toast.error("Error updating customer");
			console.error(error);
		} finally {
			setUpdating(false);
		}
	};

	const handleSuspend = async () => {
		if (!confirm("Are you sure you want to suspend this customer's credit account?")) return;

		try {
			setUpdating(true);
			const res = await fetch(`/api/v1/admin/credit/customers/${customer?.id}/suspend`, {
				method: "POST",
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});

			if (res.ok) {
				toast.success("Account suspended successfully");
				fetchCustomer();
			} else {
				toast.error("Failed to suspend account");
			}
		} catch (error) {
			toast.error("Error suspending account");
			console.error(error);
		} finally {
			setUpdating(false);
		}
	};

	if (loading) return <PageLoader />;

	if (!customer) {
		return (
			<Layout>
				<div className="max-w-2xl mx-auto px-4 py-8">
					<p className="text-gray-600 dark:text-gray-400">Customer not found</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link href="/admin/credit/customers">
					<a className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
						<ChevronLeft size={20} />
						<span>Back to Customers</span>
					</a>
				</Link>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{customer.name}</h1>
					<p className="text-gray-600 dark:text-gray-400">{customer.email}</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Customer Info */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Email</p>
								<p className="text-sm text-gray-900 dark:text-white">{customer.email}</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Phone</p>
								<p className="text-sm text-gray-900 dark:text-white">{customer.phone}</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">ID</p>
								<p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{customer.id}</p>
							</div>
						</div>
					</div>

					{/* Account Overview */}
					{customer.creditAccount && (
						<>
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Status</h3>
								<div className="space-y-3">
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Credit Status</p>
										<Badge
											variant={
												customer.creditAccount.creditStatus === "ACTIVE"
													? "success"
													: customer.creditAccount.creditStatus === "SUSPENDED"
														? "warning"
															: "error"
											}
										>
											{customer.creditAccount.creditStatus}
										</Badge>
									</div>
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Credit Limit</p>
										<p className="text-lg font-bold text-gray-900 dark:text-white">
											{formatCurrency(customer.creditAccount.creditLimit)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Payment Terms</p>
										<p className="text-sm text-gray-900 dark:text-white">
											{customer.creditAccount.paymentTermDays} days
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Balance</h3>
								<div className="space-y-3">
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Outstanding</p>
										<p className="text-lg font-bold text-red-600 dark:text-red-400">
											{formatCurrency(customer.creditAccount.outstandingBalance)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Available Credit</p>
										<p className="text-lg font-bold text-green-600 dark:text-green-400">
											{formatCurrency(customer.creditAccount.availableCredit)}
										</p>
									</div>
									{customer.creditAccount.dueDate && (
										<div>
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Due Date</p>
											<p className="text-sm text-gray-900 dark:text-white">
												{new Date(customer.creditAccount.dueDate).toLocaleDateString()}
											</p>
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</div>

				{/* Update Form */}
				{customer.creditAccount && (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Update Credit Account</h3>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Credit Limit */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Credit Limit
									</label>
									<div className="relative">
										<span className="absolute left-3 top-3 text-gray-600 dark:text-gray-400">₦</span>
										<input
											type="number"
											name="creditLimit"
											value={formData.creditLimit}
											onChange={handleChange}
											min="0"
											step="1000"
											className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
										/>
									</div>
								</div>

								{/* Payment Terms */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Payment Terms (Days)
									</label>
									<input
										type="number"
										name="paymentTermDays"
										value={formData.paymentTermDays}
										onChange={handleChange}
										min="1"
										max="180"
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
									/>
								</div>

								{/* Status */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Credit Status
									</label>
									<select
										name="status"
										value={formData.status}
										onChange={handleChange}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
									>
										<option value="ACTIVE">Active</option>
										<option value="SUSPENDED">Suspended</option>
										<option value="DISABLED">Disabled</option>
									</select>
								</div>
							</div>

							<div className="flex gap-3">
								<button
									type="submit"
									disabled={updating}
									className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition"
								>
									<Save size={18} />
									<span>{updating ? "Updating..." : "Save Changes"}</span>
								</button>
								<button
									type="button"
									onClick={handleSuspend}
									disabled={updating || formData.status === "SUSPENDED"}
									className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition"
								>
									<AlertCircle size={18} />
									<span>Suspend Account</span>
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Quick Links */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Link href={`/admin/credit/payments?customerId=${customer.id}`}>
						<a className="block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow transition">
							<h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Payment History</h3>
							<p className="text-sm text-blue-700 dark:text-blue-300">View payment submissions from this customer</p>
						</a>
					</Link>
					<Link href={`/admin/credit/reports?customerId=${customer.id}`}>
						<a className="block bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:shadow transition">
							<h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Detailed Report</h3>
							<p className="text-sm text-purple-700 dark:text-purple-300">View detailed account report and statement</p>
						</a>
					</Link>
				</div>
			</div>
		</Layout>
	);
};

export default AdminCreditCustomerDetail;
