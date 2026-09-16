import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, Package, Calendar, TrendingUp } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface CreditOrder {
	id: string;
	orderNumber: string;
	totalAmount: number;
	creditAmount: number;
	status: string;
	createdAt: string;
	dueDate?: string;
	itemCount: number;
}

const CreditOrders: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [orders, setOrders] = useState<CreditOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const limit = 10;

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		fetchCreditOrders();
	}, [isAuthenticated, page]);

	const fetchCreditOrders = async () => {
		try {
			setLoading(true);
			const url = new URL(`/api/v1/credit/orders`, window.location.origin);
			url.searchParams.set("page", page.toString());
			url.searchParams.set("limit", limit.toString());

			const res = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				const data = await res.json();
				setOrders(data?.items || []);
				setTotalPages(data?.meta?.pageCount || 1);
			} else {
				toast.error("Failed to fetch orders");
			}
		} catch (error) {
			toast.error("Error loading orders");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toUpperCase()) {
			case "COMPLETED":
				return "success";
			case "PENDING":
				return "warning";
			case "CANCELLED":
				return "danger";
			default:
				return "info";
		}
	};

	if (loading) return <PageLoader />;

	return (
		<Layout>
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link href="/credit/dashboard">
					<a className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
						<ChevronLeft size={20} />
						<span>Back to Dashboard</span>
					</a>
				</Link>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Credit Orders</h1>
					<p className="text-gray-600 dark:text-gray-400">View all orders placed with credit facility</p>
				</div>

				{/* Orders Summary */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Total Credit Orders</div>
								<div className="text-3xl font-bold text-gray-900 dark:text-white">
									{orders.length}
								</div>
							</div>
							<Package className="text-blue-500" size={32} />
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Total Credit Amount</div>
								<div className="text-3xl font-bold text-green-600 dark:text-green-400">
									{formatCurrency(orders.reduce((sum, o) => sum + o.creditAmount, 0))}
								</div>
							</div>
							<TrendingUp className="text-green-500" size={32} />
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</div>
								<div className="text-3xl font-bold text-gray-900 dark:text-white">
									{formatCurrency(
										orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0
									)}
								</div>
							</div>
							<Calendar className="text-purple-500" size={32} />
						</div>
					</div>
				</div>

				{/* Orders Table */}
				{orders.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
						<Package className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={48} />
						<p className="text-gray-500 dark:text-gray-400 mb-4">No credit orders found</p>
						<Link href="/products">
							<a className="text-blue-600 dark:text-blue-400 hover:underline">Start shopping →</a>
						</Link>
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Order
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Items
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Total
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Credit Used
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Date
										</th>
									</tr>
								</thead>
								<tbody>
									{orders.map((order) => (
										<tr
											key={order.id}
											className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
										>
											<td className="px-6 py-4">
												<Link href={`/orders/${order.id}`}>
													<a className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
														{order.orderNumber}
													</a>
												</Link>
											</td>
											<td className="px-6 py-4 text-gray-900 dark:text-white">
												{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
											</td>
											<td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
												{formatCurrency(order.totalAmount)}
											</td>
											<td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
												{formatCurrency(order.creditAmount)}
											</td>
											<td className="px-6 py-4">
												<Badge variant={getStatusColor(order.status)}>
													{order.status}
												</Badge>
											</td>
											<td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
												{new Date(order.createdAt).toLocaleDateString()}
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

export default CreditOrders;
