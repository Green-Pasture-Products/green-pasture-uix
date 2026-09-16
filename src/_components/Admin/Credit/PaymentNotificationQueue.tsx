import React from "react";
import Link from "next/link";
import { Clock, AlertCircle } from "lucide-react";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface PaymentNotification {
	id: string;
	customerName: string;
	paymentAmount: number;
	paymentDate: string;
	notificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
	submittedAt: string;
}

interface PaymentNotificationQueueProps {
	notifications: PaymentNotification[];
	loading?: boolean;
	onRefresh?: () => void;
}

const PaymentNotificationQueue: React.FC<PaymentNotificationQueueProps> = ({
	notifications,
	loading = false,
	onRefresh,
}) => {
	const pendingCount = notifications.filter((n) => n.notificationStatus === "PENDING").length;

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

	if (notifications.length === 0) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
				<Clock className="mx-auto mb-4 text-gray-400 dark:text-gray-600 opacity-50" size={48} />
				<p className="text-gray-600 dark:text-gray-400 mb-4">No payment notifications</p>
				{onRefresh && (
					<button
						onClick={onRefresh}
						disabled={loading}
						className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
					>
						{loading ? "Refreshing..." : "Refresh"}
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Summary */}
			{pendingCount > 0 && (
				<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
					<AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
					<div className="flex-1">
						<p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
							{pendingCount} pending payment{pendingCount !== 1 ? "s" : ""} awaiting verification
						</p>
					</div>
					<Link href="/admin/credit/payments?status=PENDING">
						<a className="text-xs text-yellow-700 dark:text-yellow-300 hover:underline font-medium">
							View All →
						</a>
					</Link>
				</div>
			)}

			{/* Queue List */}
			<div className="space-y-3">
				{notifications.map((notification) => (
					<Link key={notification.id} href={`/admin/credit/payments/${notification.id}`}>
						<a className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition border-l-4 border-gray-300 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-500">
							<div className="flex items-center justify-between mb-2">
								<div className="flex-1">
									<p className="font-semibold text-gray-900 dark:text-white">
										{notification.customerName}
									</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										{new Date(notification.submittedAt).toLocaleDateString()}
									</p>
								</div>
								<Badge variant={getStatusColor(notification.notificationStatus)}>
									{notification.notificationStatus}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<p className="text-lg font-bold text-green-600 dark:text-green-400">
									{formatCurrency(notification.paymentAmount)}
								</p>
								<p className="text-xs text-gray-600 dark:text-gray-400">
									Paid: {new Date(notification.paymentDate).toLocaleDateString()}
								</p>
							</div>
						</a>
					</Link>
				))}
			</div>

			{/* Refresh Button */}
			{onRefresh && (
				<div className="text-center">
					<button
						onClick={onRefresh}
						disabled={loading}
						className="text-blue-600 dark:text-blue-400 hover:underline text-sm disabled:opacity-50"
					>
						{loading ? "Refreshing..." : "Refresh Queue"}
					</button>
				</div>
			)}
		</div>
	);
};

export default PaymentNotificationQueue;
