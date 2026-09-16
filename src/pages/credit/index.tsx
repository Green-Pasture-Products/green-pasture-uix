import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { TrendingUp, History, ShoppingCart, AlertCircle } from "lucide-react";

import Layout from "@/_components/Layout";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";

const CreditIndex: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated } = useAppSelector((state) => state.auth);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return <PageLoader />;
	}

	return (
		<Layout>
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Credit Management</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Manage your credit account, view transactions, and submit payments
					</p>
				</div>

				{/* Navigation Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Dashboard Card */}
					<Link href="/credit/dashboard">
						<a className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500 hover:border-blue-600">
							<div className="flex items-center mb-4">
								<div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
									<TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
								</div>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dashboard</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
								View your credit summary, limit, and available balance
							</p>
							<span className="text-blue-600 dark:text-blue-400 font-medium text-sm">View →</span>
						</a>
					</Link>

					{/* Transactions Card */}
					<Link href="/credit/transactions">
						<a className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500 hover:border-green-600">
							<div className="flex items-center mb-4">
								<div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
									<History className="text-green-600 dark:text-green-400" size={24} />
								</div>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transaction History</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
								View all debits, credits, and adjustments on your account
							</p>
							<span className="text-green-600 dark:text-green-400 font-medium text-sm">View →</span>
						</a>
					</Link>

					{/* Credit Orders Card */}
					<Link href="/credit/orders">
						<a className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500 hover:border-purple-600">
							<div className="flex items-center mb-4">
								<div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
									<ShoppingCart className="text-purple-600 dark:text-purple-400" size={24} />
								</div>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Credit Orders</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
								View orders placed using your credit facility
							</p>
							<span className="text-purple-600 dark:text-purple-400 font-medium text-sm">View →</span>
						</a>
					</Link>

					{/* Submit Payment Card */}
					<Link href="/credit/submit-payment">
						<a className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500 hover:border-yellow-600">
							<div className="flex items-center mb-4">
								<div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
									<AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
								</div>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Submit Payment</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
								Submit payment proof for credit account
							</p>
							<span className="text-yellow-600 dark:text-yellow-400 font-medium text-sm">Submit →</span>
						</a>
					</Link>
				</div>

				{/* Info Section */}
				<div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
					<h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">About Your Credit Account</h2>
					<ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
						<li className="flex items-start">
							<span className="mr-3">•</span>
							<span>Your credit limit is approved by our admin team after careful review</span>
						</li>
						<li className="flex items-start">
							<span className="mr-3">•</span>
							<span>All transactions are recorded in an immutable ledger for audit purposes</span>
						</li>
						<li className="flex items-start">
							<span className="mr-3">•</span>
							<span>Payment submissions require verification before being credited</span>
						</li>
						<li className="flex items-start">
							<span className="mr-3">•</span>
							<span>Contact support if you need to adjust your credit limit or have payment issues</span>
						</li>
					</ul>
				</div>
			</div>
		</Layout>
	);
};

export default CreditIndex;
