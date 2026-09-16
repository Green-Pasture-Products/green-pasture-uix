import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface PaymentNotification {
	id: string;
	customerId: string;
	customerName: string;
	paymentAmount: number;
	paymentDate: string;
	notificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
	paymentMethod: string;
	submittedAt: string;
}

const AdminCreditPayments: React.FC = () => {
	const router = useRouter();
	const { customerId: filterCustomerId } = router.query;
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [payments, setPayments] = useState<PaymentNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<"" | "PENDING" | "VERIFIED" | "REJECTED">("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const limit = 10;

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		fetchPayments();
	}, [isAuthenticated, page, statusFilter]);

	const fetchPayments = async () => {
		try {
			setLoading(true);
			const url = new URL(`/api/v1/admin/credit/payment-notifications`, window.location.origin);
			url.searchParams.set("page", page.toString());
			url.searchParams.set("limit", limit.toString());
			if (statusFilter) url.searchParams.set("status", statusFilter);
			if (filterCustomerId) url.searchParams.set("customerId", filterCustomerId as string);

			const res = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				const data = await res.json();
				setPayments(data?.items || []);
				setTotalPages(data?.meta?.pageCount || 1);
			} else {
				toast.error("Failed to fetch payments");
			}
		} catch (error) {
			toast.error("Error loading payments");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
				return "warning";
			case "VERIFIED":
				return "success";
			case "REJECTED":
				return "danger";
			default:
				return "info";
		}
	};

	if (loading) return <PageLoader />;

	return (
		<Layout>
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link href="/admin/credit/dashboard">
					<a className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
						<ChevronLeft size={20} />
						<span>Back to Dashboard</span>
					</a>
				</Link>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Notifications</h1>
					<p className="text-gray-600 dark:text-gray-400">Review and verify customer payment submissions</p>
				</div>

				{/* Status Filter */}
				<div className="mb-6 flex items-center gap-4">
					<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value as any);
							setPage(1);
						}}
						className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					>
						<option value="">All Payments</option>
						<option value="PENDING">Pending</option>
						<option value="VERIFIED">Verified</option>
						<option value="REJECTED">Rejected</option>
					</select>
				</div>

				{/* Payments Table */}
				{payments.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
						<Clock className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={48} />
						<p className="text-gray-500 dark:text-gray-400">No payments found</p>
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Customer
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Amount
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Method
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Payment Date
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Submitted
										</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Action
										</th>
									</tr>
								</thead>
								<tbody>
									{payments.map((payment) => (
										<tr
											key={payment.id}
											className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
										>
											<td className="px-6 py-4">
												<div className="font-semibold text-gray-900 dark:text-white">
													{payment.customerName}
												</div>
											</td>
											<td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
												{formatCurrency(payment.paymentAmount)}
											</td>
											<td className="px-6 py-4 text-gray-900 dark:text-white text-sm">
												{payment.paymentMethod.replace(/_/g, " ")}
											</td>
											<td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
												{new Date(payment.paymentDate).toLocaleDateString()}
											</td>
											<td className="px-6 py-4">
												<Badge variant={getStatusColor(payment.notificationStatus)}>
													{payment.notificationStatus}
												</Badge>
											</td>
											<td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
												{new Date(payment.submittedAt).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 text-center">
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

						{/* Pagination */}
						<div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Page {page} of {totalPages}
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setPage(Math.max(1, page - 1))}
									disabled={page === 1}
									className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300"
								>
									Previous
								</button>
								<button
									onClick={() => setPage(Math.min(totalPages, page + 1))}
									disabled={page === totalPages}
									className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
};

export default AdminCreditPayments;
