import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import AuthPrompt from "@/_UI/AuthPrompt";
import { formatCurrency } from "@/_UI/FormatValue";
import Badge from "@/_UI/Badge";

interface CreditAccount {
	id: string;
	creditStatus: "ACTIVE" | "SUSPENDED" | "DISABLED";
	creditLimit: number;
	outstandingBalance: number;
	availableCredit: number;
	paymentTermDays: number;
	dueDate?: string;
}

interface CreditTransaction {
	id: string;
	transactionType: "DEBIT" | "CREDIT" | "ADJUSTMENT";
	amount: number;
	description: string;
	createdAt: string;
}

const CreditDashboard: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated, user } = useAppSelector((state) => state.auth);
	const [creditAccount, setCreditAccount] = useState<CreditAccount | null>(null);
	const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAuthPrompt, setShowAuthPrompt] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			setShowAuthPrompt(true);
			return;
		}
	}, [isAuthenticated]);

	const fetchCreditData = useCallback(async () => {
		try {
			setLoading(true);
			// Fetch credit account
			const accountRes = await fetch("/api/v1/credit/account", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (accountRes.ok) {
				setCreditAccount(await accountRes.json());
			}

			// Fetch recent transactions
			const txRes = await fetch("/api/v1/credit/transactions?page=1&limit=5", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (txRes.ok) {
				const data = await txRes.json();
				setRecentTransactions(data?.items || []);
			}
		} catch (error) {
			toast.error("Failed to load credit information");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isAuthenticated) {
			fetchCreditData();
		}
	}, [isAuthenticated, fetchCreditData]);

	if (showAuthPrompt) return <AuthPrompt />;
	if (loading) return <PageLoader />;
	if (!creditAccount) return <div className="p-6">No credit account found</div>;

	const statusColor = {
		ACTIVE: "success",
		SUSPENDED: "warning",
		DISABLED: "error",
	} as const;

	const utilizationPercent = (creditAccount.outstandingBalance / creditAccount.creditLimit) * 100;

	return (
		<Layout>
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Credit</h1>
					<p className="text-gray-600 dark:text-gray-400">Manage your credit account and payment history</p>
				</div>

				{/* Credit Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					{/* Credit Limit Card */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Credit Limit</div>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">
							{formatCurrency(creditAccount.creditLimit)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Maximum available</div>
					</div>

					{/* Outstanding Balance Card */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Outstanding Balance</div>
						<div className="text-2xl font-bold text-red-600 dark:text-red-400">
							{formatCurrency(creditAccount.outstandingBalance)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Amount owed</div>
					</div>

					{/* Available Credit Card */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Credit</div>
						<div className="text-2xl font-bold text-green-600 dark:text-green-400">
							{formatCurrency(creditAccount.availableCredit)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Ready to use</div>
					</div>

					{/* Status Card */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</div>
						<Badge variant={statusColor[creditAccount.creditStatus]}>
							{creditAccount.creditStatus}
						</Badge>
						<div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Account status</div>
					</div>
				</div>

				{/* Utilization Bar */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
					<div className="flex justify-between mb-2">
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Credit Utilization</span>
						<span className="text-sm font-bold text-gray-900 dark:text-white">
							{utilizationPercent.toFixed(0)}%
						</span>
					</div>
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
						<div
							className={`h-2 rounded-full transition-all ${
								utilizationPercent > 80
									? "bg-red-500"
									: utilizationPercent > 50
										? "bg-yellow-500"
										: "bg-green-500"
							}`}
							style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
						/>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
					<Link href="/credit/submit-payment">
						<a className="block bg-green-600 hover:bg-green-700 text-white rounded-lg shadow p-6 text-center transition">
							<div className="text-lg font-bold mb-1">I've Made a Payment</div>
							<div className="text-sm opacity-90">Submit payment proof for verification</div>
						</a>
					</Link>
					<Link href="/credit/transactions">
						<a className="block bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow p-6 text-center transition">
							<div className="text-lg font-bold mb-1">View History</div>
							<div className="text-sm opacity-90">See all credit transactions</div>
						</a>
					</Link>
				</div>

				{/* Recent Transactions */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
					{recentTransactions.length === 0 ? (
						<div className="text-center py-8 text-gray-500 dark:text-gray-400">
							No transactions yet
						</div>
					) : (
						<div className="space-y-3">
							{recentTransactions.map((tx) => (
								<div
									key={tx.id}
									className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-b-0"
								>
									<div className="flex items-center space-x-3">
										{tx.transactionType === "DEBIT" ? (
											<ArrowUpRight className="text-red-500" size={20} />
										) : (
											<ArrowDownLeft className="text-green-500" size={20} />
										)}
										<div>
											<div className="text-sm font-medium text-gray-900 dark:text-white">
												{tx.description}
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												{new Date(tx.createdAt).toLocaleDateString()}
											</div>
										</div>
									</div>
									<div
										className={`text-sm font-bold ${
											tx.transactionType === "DEBIT"
												? "text-red-600 dark:text-red-400"
												: "text-green-600 dark:text-green-400"
										}`}
									>
										{tx.transactionType === "DEBIT" ? "+" : "-"}
										{formatCurrency(tx.amount)}
									</div>
								</div>
							))}
						</div>
					)}
					<Link href="/credit/transactions">
						<a className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
							View all transactions →
						</a>
					</Link>
				</div>

				{/* Payment Terms Info */}
				{creditAccount.creditStatus === "ACTIVE" && (
					<div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start space-x-3">
						<AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
						<div>
							<div className="text-sm font-medium text-blue-900 dark:text-blue-100">
								Payment Terms: {creditAccount.paymentTermDays} days
							</div>
							<div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
								Your credit orders are due within {creditAccount.paymentTermDays} days. Submit payment proof to settle your account.
							</div>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
};

export default CreditDashboard;
