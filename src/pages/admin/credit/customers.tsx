import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Plus, ChevronLeft, Search } from "lucide-react";

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
		creditStatus: "ACTIVE" | "SUSPENDED" | "DISABLED";
		creditLimit: number;
		outstandingBalance: number;
		availableCredit: number;
	};
}

const AdminCreditCustomers: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated, user } = useAppSelector((state) => state.auth);
	const [customers, setCustomers] = useState<CreditCustomer[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const limit = 10;

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		fetchCustomers();
	}, [isAuthenticated, page, search]);

	const fetchCustomers = async () => {
		try {
			setLoading(true);
			const url = new URL(`/api/v1/admin/credit/customers`, window.location.origin);
			url.searchParams.set("page", page.toString());
			url.searchParams.set("limit", limit.toString());
			if (search) url.searchParams.set("search", search);

			const res = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				const data = await res.json();
				setCustomers(data?.items || []);
				setTotalPages(data?.meta?.pageCount || 1);
			} else {
				toast.error("Failed to fetch customers");
			}
		} catch (error) {
			toast.error("Error loading customers");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "success";
			case "SUSPENDED":
				return "warning";
			case "DISABLED":
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
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Credit Customers</h1>
						<p className="text-gray-600 dark:text-gray-400">Manage customer credit accounts</p>
					</div>
					<Link href="/admin/credit/customers/new">
						<a className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
							<Plus size={20} />
							<span>New Application</span>
						</a>
					</Link>
				</div>

				{/* Search */}
				<div className="mb-6 relative">
					<Search className="absolute left-3 top-3 text-gray-400" size={20} />
					<input
						type="text"
						placeholder="Search by name or email..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					/>
				</div>

				{/* Customers Table */}
				{customers.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
						<p className="text-gray-500 dark:text-gray-400">No customers found</p>
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
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Status
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Limit
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Outstanding
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Available
										</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
											Action
										</th>
									</tr>
								</thead>
								<tbody>
									{customers.map((customer) => (
										<tr
											key={customer.id}
											className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
										>
											<td className="px-6 py-4">
												<div className="font-semibold text-gray-900 dark:text-white">
													{customer.name}
												</div>
												<div className="text-sm text-gray-600 dark:text-gray-400">
													{customer.email}
												</div>
											</td>
											<td className="px-6 py-4">
												{customer.creditAccount && (
													<Badge variant={getStatusColor(customer.creditAccount.creditStatus)}>
														{customer.creditAccount.creditStatus}
													</Badge>
												)}
											</td>
											<td className="px-6 py-4 text-right text-gray-900 dark:text-white font-semibold">
												{customer.creditAccount
													? formatCurrency(customer.creditAccount.creditLimit)
													: "-"}
											</td>
											<td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-semibold">
												{customer.creditAccount
													? formatCurrency(customer.creditAccount.outstandingBalance)
													: "-"}
											</td>
											<td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-semibold">
												{customer.creditAccount
													? formatCurrency(customer.creditAccount.availableCredit)
													: "-"}
											</td>
											<td className="px-6 py-4 text-center">
												<Link href={`/admin/credit/customers/${customer.id}`}>
													<a className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
														Manage
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

export default AdminCreditCustomers;
