import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, Filter } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface Transaction {
	id: string;
	transactionType: "DEBIT" | "CREDIT" | "ADJUSTMENT";
	amount: number;
	description: string;
	referenceId?: string;
	createdAt: string;
	createdBy: string;
}

const CreditTransactions: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterType, setFilterType] = useState<"" | "DEBIT" | "CREDIT" | "ADJUSTMENT">("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const limit = 10;

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		fetchTransactions();
	}, [isAuthenticated, page, filterType]);

	const fetchTransactions = async () => {
		try {
			setLoading(true);
			const url = new URL(`/api/v1/credit/transactions`, window.location.origin);
			url.searchParams.set("page", page.toString());
			url.searchParams.set("limit", limit.toString());
			if (filterType) url.searchParams.set("type", filterType);

			const res = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				const data = await res.json();
				setTransactions(data?.items || []);
				setTotalPages(data?.meta?.pageCount || 1);
			} else {
				toast.error("Failed to fetch transactions");
			}
		} catch (error) {
			toast.error("Error loading transactions");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const getTransactionColor = (type: string) => {
		switch (type) {
			case "DEBIT":
				return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
			case "CREDIT":
				return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
			case "ADJUSTMENT":
				return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
			default:
				return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
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
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transaction History</h1>
					<p className="text-gray-600 dark:text-gray-400">View all debits, credits, and adjustments</p>
				</div>

				{/* Filter Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
					<div className="flex items-center gap-4">
						<Filter size={20} className="text-gray-600 dark:text-gray-400" />
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Type:</label>
						<select
							value={filterType}
							onChange={(e) => {
								setFilterType(e.target.value as any);
								setPage(1);
							}}
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="">All Transactions</option>
							<option value="DEBIT">Debits (Purchases)</option>
							<option value="CREDIT">Credits (Payments)</option>
							<option value="ADJUSTMENT">Adjustments</option>
						</select>
					</div>
				</div>

				{/* Transactions Table */}
				{transactions.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
						<p className="text-gray-500 dark:text-gray-400">No transactions found</p>
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Type
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Description
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Amount
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Date
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Reference
										</th>
									</tr>
								</thead>
								<tbody>
									{transactions.map((transaction) => (
										<tr
											key={transaction.id}
											className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
										>
											<td className="px-6 py-4">
												<Badge
													variant={
														transaction.transactionType === "DEBIT"
															? "danger"
															: transaction.transactionType === "CREDIT"
																? "success"
																: "info"
													}
												>
													{transaction.transactionType}
												</Badge>
											</td>
											<td className="px-6 py-4 text-gray-900 dark:text-white">
												{transaction.description}
											</td>
											<td
												className={`px-6 py-4 text-right font-semibold ${
													transaction.transactionType === "DEBIT"
														? "text-red-600 dark:text-red-400"
														: "text-green-600 dark:text-green-400"
												}`}
											>
												{transaction.transactionType === "DEBIT" ? "-" : "+"}
												{formatCurrency(transaction.amount)}
											</td>
											<td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
												{new Date(transaction.createdAt).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
												{transaction.referenceId || "-"}
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

export default CreditTransactions;
