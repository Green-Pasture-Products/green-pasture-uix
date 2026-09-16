import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, CheckCircle, XCircle } from "lucide-react";

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
	customerEmail: string;
	creditAccountId: string;
	paymentAmount: number;
	paymentDate: string;
	notificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
	paymentMethod: string;
	transactionReference?: string;
	proofOfPaymentUrl?: string;
	rejectionReason?: string;
	submittedAt: string;
	verifiedAt?: string;
	verifiedBy?: string;
}

const AdminPaymentDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [payment, setPayment] = useState<PaymentNotification | null>(null);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [verificationNotes, setVerificationNotes] = useState("");

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		if (id) {
			fetchPayment();
		}
	}, [isAuthenticated, id]);

	const fetchPayment = async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/v1/admin/credit/payment-notifications/${id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});
			if (res.ok) {
				setPayment(await res.json());
			} else {
				toast.error("Failed to fetch payment");
			}
		} catch (error) {
			toast.error("Error loading payment");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleVerify = async () => {
		try {
			setProcessing(true);
			const res = await fetch(`/api/v1/admin/credit/payment-notifications/${id}/verify`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ verificationNotes }),
			});

			if (res.ok) {
				toast.success("Payment verified successfully");
				fetchPayment();
			} else {
				toast.error("Failed to verify payment");
			}
		} catch (error) {
			toast.error("Error verifying payment");
			console.error(error);
		} finally {
			setProcessing(false);
		}
	};

	const handleReject = async () => {
		if (!rejectionReason.trim()) {
			toast.error("Please provide a rejection reason");
			return;
		}

		try {
			setProcessing(true);
			const res = await fetch(`/api/v1/admin/credit/payment-notifications/${id}/reject`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ rejectionReason }),
			});

			if (res.ok) {
				toast.success("Payment rejected successfully");
				fetchPayment();
			} else {
				toast.error("Failed to reject payment");
			}
		} catch (error) {
			toast.error("Error rejecting payment");
			console.error(error);
		} finally {
			setProcessing(false);
		}
	};

	if (loading) return <PageLoader />;

	if (!payment) {
		return (
			<Layout>
				<div className="max-w-2xl mx-auto px-4 py-8">
					<p className="text-gray-600 dark:text-gray-400">Payment not found</p>
				</div>
			</Layout>
		);
	}

	const isPending = payment.notificationStatus === "PENDING";

	return (
		<Layout>
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link href="/admin/credit/payments">
					<a className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
						<ChevronLeft size={20} />
						<span>Back to Payments</span>
					</a>
				</Link>

				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Notification</h1>
						<p className="text-gray-600 dark:text-gray-400">Review and verify customer payment</p>
					</div>
					<Badge
						variant={
							payment.notificationStatus === "PENDING"
								? "warning"
								: payment.notificationStatus === "VERIFIED"
									? "success"
									: "danger"
						}
					>
						{payment.notificationStatus}
					</Badge>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Customer Info */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Name</p>
								<p className="text-sm font-semibold text-gray-900 dark:text-white">
									{payment.customerName}
								</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Email</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">{payment.customerEmail}</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Customer ID</p>
								<p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{payment.customerId}</p>
							</div>
						</div>
					</div>

					{/* Payment Details */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Amount</p>
								<p className="text-2xl font-bold text-green-600 dark:text-green-400">
									{formatCurrency(payment.paymentAmount)}
								</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Payment Date</p>
								<p className="text-sm text-gray-900 dark:text-white">
									{new Date(payment.paymentDate).toLocaleDateString()}
								</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Payment Method</p>
								<p className="text-sm text-gray-900 dark:text-white">
									{payment.paymentMethod.replace(/_/g, " ")}
								</p>
							</div>
						</div>
					</div>

					{/* Submission Details */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submission Details</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Submitted</p>
								<p className="text-sm text-gray-900 dark:text-white">
									{new Date(payment.submittedAt).toLocaleDateString()}
								</p>
							</div>
							{payment.verifiedAt && (
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Verified</p>
									<p className="text-sm text-gray-900 dark:text-white">
										{new Date(payment.verifiedAt).toLocaleDateString()}
									</p>
								</div>
							)}
							{payment.transactionReference && (
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Reference</p>
									<p className="text-xs text-gray-900 dark:text-white font-mono">
										{payment.transactionReference}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Proof of Payment */}
				{payment.proofOfPaymentUrl && (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proof of Payment</h3>
						<a
							href={payment.proofOfPaymentUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 dark:text-blue-400 hover:underline"
						>
							View Proof →
						</a>
					</div>
				)}

				{/* Verification Section */}
				{isPending ? (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Verify */}
						<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
								<CheckCircle size={24} />
								Verify Payment
							</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
										Verification Notes (Optional)
									</label>
									<textarea
										value={verificationNotes}
										onChange={(e) => setVerificationNotes(e.target.value)}
										placeholder="e.g., Bank statement verified, receipt confirmed"
										rows={4}
										className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md bg-white dark:bg-green-900/10 text-green-900 dark:text-green-100"
									/>
								</div>
								<button
									onClick={handleVerify}
									disabled={processing}
									className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition"
								>
									{processing ? "Processing..." : "Verify Payment"}
								</button>
							</div>
						</div>

						{/* Reject */}
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
								<XCircle size={24} />
								Reject Payment
							</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
										Rejection Reason *
									</label>
									<textarea
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										placeholder="e.g., Amount mismatch, invalid proof, etc."
										rows={4}
										className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md bg-white dark:bg-red-900/10 text-red-900 dark:text-red-100"
									/>
								</div>
								<button
									onClick={handleReject}
									disabled={processing}
									className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition"
								>
									{processing ? "Processing..." : "Reject Payment"}
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Decision Details</h3>
						{payment.notificationStatus === "VERIFIED" && payment.verifiedAt && (
							<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
								<p className="text-green-900 dark:text-green-100">
									✓ Payment verified on {new Date(payment.verifiedAt).toLocaleDateString()} by{" "}
									{payment.verifiedBy}
								</p>
							</div>
						)}
						{payment.notificationStatus === "REJECTED" && payment.rejectionReason && (
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
								<p className="text-red-900 dark:text-red-100 font-medium mb-2">Rejection Reason:</p>
								<p className="text-red-800 dark:text-red-200">{payment.rejectionReason}</p>
							</div>
						)}
					</div>
				)}
			</div>
		</Layout>
	);
};

export default AdminPaymentDetail;
