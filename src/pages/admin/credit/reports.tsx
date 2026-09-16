import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, BarChart3, TrendingUp, AlertCircle, Download } from "lucide-react";

import Layout from "@/_components/Layout";
import toast from "react-hot-toast";
import { useAppSelector } from "@/_redux/store";
import PageLoader from "@/_UI/PageLoader";
import { formatCurrency } from "@/_UI/FormatValue";

interface CreditReport {
	totalCreditAccounts: number;
	activeAccounts: number;
	suspendedAccounts: number;
	disabledAccounts: number;
	totalCreditLimit: number;
	totalOutstandingCredit: number;
	totalAvailableCredit: number;
	averageCreditLimit: number;
	overdueAccounts: number;
	overdueAmount: number;
	pendingPaymentNotifications: number;
	verifiedPaymentsThisMonth: number;
	rejectedPaymentsThisMonth: number;
	totalPaymentsThisMonth: number;
	monthlyCollections: number;
}

const AdminCreditReports: React.FC = () => {
	const router = useRouter();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [report, setReport] = useState<CreditReport | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		fetchReport();
	}, [isAuthenticated]);

	const fetchReport = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/v1/admin/credit/reports", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				setReport(await res.json());
			} else {
				toast.error("Failed to fetch reports");
			}
		} catch (error) {
			toast.error("Error loading reports");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadReport = async () => {
		try {
			const res = await fetch("/api/v1/admin/credit/reports/export", {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				const blob = await res.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `credit-report-${new Date().toISOString().split("T")[0]}.xlsx`;
				a.click();
				window.URL.revokeObjectURL(url);
				toast.success("Report downloaded successfully");
			} else {
				toast.error("Failed to download report");
			}
		} catch (error) {
			toast.error("Error downloading report");
			console.error(error);
		}
	};

	if (loading) return <PageLoader />;

	if (!report) {
		return (
			<Layout>
				<div className="max-w-2xl mx-auto px-4 py-8">
					<p className="text-gray-600 dark:text-gray-400">Failed to load report</p>
				</div>
			</Layout>
		);
	}

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
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Credit Reports</h1>
						<p className="text-gray-600 dark:text-gray-400">Comprehensive credit management analytics</p>
					</div>
					<button
						onClick={handleDownloadReport}
						className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
					>
						<Download size={18} />
						<span>Export Report</span>
					</button>
				</div>

				{/* Account Overview */}
				<div className="mb-8">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Overview</h2>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-white">
										{report.totalCreditAccounts}
									</p>
								</div>
								<BarChart3 className="text-blue-500" size={32} />
							</div>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
									<p className="text-3xl font-bold text-green-600 dark:text-green-400">
										{report.activeAccounts}
									</p>
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400 text-right">
									{((report.activeAccounts / report.totalCreditAccounts) * 100).toFixed(1)}%
								</div>
							</div>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
									<p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
										{report.suspendedAccounts}
									</p>
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400 text-right">
									{((report.suspendedAccounts / report.totalCreditAccounts) * 100).toFixed(1)}%
								</div>
							</div>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400">Disabled</p>
									<p className="text-3xl font-bold text-red-600 dark:text-red-400">
										{report.disabledAccounts}
									</p>
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400 text-right">
									{((report.disabledAccounts / report.totalCreditAccounts) * 100).toFixed(1)}%
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Credit Exposure */}
				<div className="mb-8">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Credit Exposure</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Credit Limit</p>
							<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
								{formatCurrency(report.totalCreditLimit)}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
								Average: {formatCurrency(report.averageCreditLimit)}
							</p>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Outstanding</p>
							<p className="text-3xl font-bold text-red-600 dark:text-red-400">
								{formatCurrency(report.totalOutstandingCredit)}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
								Utilization:{" "}
								{(
									(report.totalOutstandingCredit / report.totalCreditLimit) *
									100
								).toFixed(1)}
								%
							</p>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Available</p>
							<p className="text-3xl font-bold text-green-600 dark:text-green-400">
								{formatCurrency(report.totalAvailableCredit)}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
								Capacity:{" "}
								{(
									(report.totalAvailableCredit / report.totalCreditLimit) *
									100
								).toFixed(1)}
								%
							</p>
						</div>
					</div>
				</div>

				{/* Risk Analysis */}
				<div className="mb-8">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk Analysis</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6">
							<div className="flex items-center gap-2 mb-4">
								<AlertCircle className="text-red-600 dark:text-red-400" size={24} />
								<h3 className="font-bold text-red-900 dark:text-red-100">Overdue Accounts</h3>
							</div>
							<p className="text-3xl font-bold text-red-600 dark:text-red-400">
								{report.overdueAccounts}
							</p>
							<p className="text-sm text-red-700 dark:text-red-300 mt-2">
								Outstanding: {formatCurrency(report.overdueAmount)}
							</p>
						</div>
						<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow p-6">
							<div className="flex items-center gap-2 mb-4">
								<TrendingUp className="text-yellow-600 dark:text-yellow-400" size={24} />
								<h3 className="font-bold text-yellow-900 dark:text-yellow-100">Pending Verifications</h3>
							</div>
							<p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
								{report.pendingPaymentNotifications}
							</p>
							<p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
								Awaiting admin review
							</p>
						</div>
					</div>
				</div>

				{/* Payment Activity */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Activity (This Month)</h2>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
							<p className="text-3xl font-bold text-gray-900 dark:text-white">
								{report.totalPaymentsThisMonth}
							</p>
						</div>
						<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow p-6">
							<p className="text-sm text-green-900 dark:text-green-100">Verified</p>
							<p className="text-3xl font-bold text-green-600 dark:text-green-400">
								{report.verifiedPaymentsThisMonth}
							</p>
						</div>
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6">
							<p className="text-sm text-red-900 dark:text-red-100">Rejected</p>
							<p className="text-3xl font-bold text-red-600 dark:text-red-400">
								{report.rejectedPaymentsThisMonth}
							</p>
						</div>
						<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow p-6">
							<p className="text-sm text-blue-900 dark:text-blue-100">Collections</p>
							<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{formatCurrency(report.monthlyCollections)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default AdminCreditReports;
