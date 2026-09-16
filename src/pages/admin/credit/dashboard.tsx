import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface DashboardMetrics {
	pendingPaymentNotifications: number;
	totalCreditCustomers?: number;
	totalOutstandingCredit?: number;
	overdueCount?: number;
}

interface PaymentNotification {
	id: string;
	customerName: string;
	paymentAmount: number;
	paymentDate: string;
	notificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
	submittedAt: string;
}

const AdminCreditDashboard: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated, user } = useAppSelector((state) => state.auth);
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [pendingPayments, setPendingPayments] = useState<PaymentNotification[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		fetchDashboardData();
	}, [isAuthenticated]);

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			// Fetch dashboard metrics
			const metricsRes = await fetch("/api/v1/admin/credit/dashboard", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (metricsRes.ok) {
				setMetrics(await metricsRes.json());
			}

			// Fetch pending payment notifications
			const paymentsRes = await fetch("/api/v1/admin/credit/payment-notifications?page=1&limit=10", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (paymentsRes.ok) {
				const data = await paymentsRes.json();
				setPendingPayments(data?.items || []);
			}
		} catch (error) {
			toast.error("Failed to load credit dashboard");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, []);

	if (loading) return <PageLoader />;

	return (
		<Layout>
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Credit Management</h1>
					<p className="text-gray-600 dark:text-gray-400">Manage customer credit accounts and verify payments</p>
				</div>

				{/* KPI Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					{/* Pending Payments */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-yellow-500">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Pending Verifications</div>
								<div className="text-3xl font-bold text-gray-900 dark:text-white">
									{metrics?.pendingPaymentNotifications || 0}
								</div>
							</div>
							<Clock className="text-yellow-500" size={32} />
						</div>
						<Link href="/admin/credit/payments">
							<a className="inline-block mt-4 text-sm text-yellow-600 dark:text-yellow-400 hover:underline font-medium">
								Review →
							</a>
						</Link>
					</div>

					{/* Credit Customers */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Active Credit Customers</div>
								<div className="text-3xl font-bold text-gray-900 dark:text-white">
									{metrics?.totalCreditCustomers || 0}
								</div>
							</div>
							<CheckCircle className="text-blue-500" size={32} />
						</div>
						<Link href="/admin/credit/customers">
							<a className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
								Manage →
							</a>
						</Link>
					</div>

					{/* Total Outstanding */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</div>
								<div className="text-2xl font-bold text-gray-900 dark:text-white">
									{formatCurrency(metrics?.totalOutstandingCredit || 0)}
								</div>
							</div>
							<AlertCircle className="text-red-500" size={32} />
						</div>
					</div>

					{/* Overdue Accounts */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-600">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Overdue Accounts</div>
								<div className="text-3xl font-bold text-red-600 dark:text-red-400">
									{metrics?.overdueCount || 0}
								</div>
							</div>
							<XCircle className="text-red-600" size={32} />
						</div>
					</div>
				</div>

				{/* Pending Payments Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
						Pending Payment Verifications
					</h2>

					{pendingPayments.length === 0 ? (
						<div className="text-center py-8 text-gray-500 dark:text-gray-400">
							<CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
							<p>All payments verified! No pending notifications.</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="border-b border-gray-200 dark:border-gray-700">
										<tr>
											<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
												Customer
											</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
												Amount
											</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
												Payment Date
											</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
												Submitted
											</th>
											<th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
												Action
											</th>
										</tr>
									</thead>
									<tbody>
										{pendingPayments.map((payment) => (
											<tr
												key={payment.id}
												className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
											>
												<td className="py-3 px-4">{payment.customerName}</td>
												<td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
													{formatCurrency(payment.paymentAmount)}
												</td>
												<td className="py-3 px-4 text-gray-600 dark:text-gray-400">
													{new Date(payment.paymentDate).toLocaleDateString()}
												</td>
												<td className="py-3 px-4 text-gray-600 dark:text-gray-400">
													{new Date(payment.submittedAt).toLocaleDateString()}
												</td>
												<td className="py-3 px-4 text-center">
													<Link href={`/admin/credit/payments/${payment.id}`}>
														<a className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
															Review
														</a>
													</Link>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<Link href="/admin/credit/payments">
								<a className="inline-block mt-6 text-blue-600 dark:text-blue-400 hover:underline font-medium">
									View all pending payments →
								</a>
							</Link>
						</>
					)}
				</div>

				{/* Quick Links */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
					<Link href="/admin/credit/customers">
						<a className="block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow transition">
							<h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Manage Customers</h3>
							<p className="text-sm text-blue-700 dark:text-blue-300">
								Approve, update, or suspend customer credit accounts
							</p>
						</a>
					</Link>
					<Link href="/admin/credit/payments">
						<a className="block bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 hover:shadow transition">
							<h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">Verify Payments</h3>
							<p className="text-sm text-yellow-700 dark:text-yellow-300">
								Review and verify customer payment submissions
							</p>
						</a>
					</Link>
				</div>
			</div>
		</Layout>
	);
};

export default AdminCreditDashboard;
