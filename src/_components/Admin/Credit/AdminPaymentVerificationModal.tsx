import React, { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/_UI/FormatValue";

interface PaymentNotification {
	id: string;
	customerName: string;
	paymentAmount: number;
	paymentDate: string;
	paymentMethod: string;
	transactionReference?: string;
	proofOfPaymentUrl?: string;
}

interface AdminPaymentVerificationModalProps {
	isOpen: boolean;
	payment: PaymentNotification | null;
	onClose: () => void;
	onVerify: (notes?: string) => Promise<void>;
	onReject: (reason: string) => Promise<void>;
	isLoading?: boolean;
}

const AdminPaymentVerificationModal: React.FC<AdminPaymentVerificationModalProps> = ({
	isOpen,
	payment,
	onClose,
	onVerify,
	onReject,
	isLoading = false,
}) => {
	const [action, setAction] = useState<"verify" | "reject" | null>(null);
	const [notes, setNotes] = useState("");
	const [reason, setReason] = useState("");

	if (!isOpen || !payment) return null;

	const handleVerify = async () => {
		try {
			await onVerify(notes);
			handleClose();
		} catch (error) {
			console.error(error);
		}
	};

	const handleReject = async () => {
		if (!reason.trim()) {
			toast.error("Please provide a rejection reason");
			return;
		}
		try {
			await onReject(reason);
			handleClose();
		} catch (error) {
			console.error(error);
		}
	};

	const handleClose = () => {
		setAction(null);
		setNotes("");
		setReason("");
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Payment</h2>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
					>
						<X size={24} />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4">
					{/* Payment Info */}
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">Customer:</span>
								<span className="font-semibold text-gray-900 dark:text-white">
									{payment.customerName}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
								<span className="font-bold text-green-600 dark:text-green-400">
									{formatCurrency(payment.paymentAmount)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">Method:</span>
								<span className="text-sm text-gray-900 dark:text-white">
									{payment.paymentMethod.replace(/_/g, " ")}
								</span>
							</div>
							{payment.transactionReference && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600 dark:text-gray-400">Reference:</span>
									<span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
										{payment.transactionReference}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Action Selection */}
					{action === null && (
						<div className="space-y-3">
							<button
								onClick={() => setAction("verify")}
								className="w-full flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:shadow transition text-left"
							>
								<CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
								<div>
									<p className="font-semibold text-green-900 dark:text-green-100">Verify Payment</p>
									<p className="text-xs text-green-800 dark:text-green-200">
										Confirm payment received
									</p>
								</div>
							</button>
							<button
								onClick={() => setAction("reject")}
								className="w-full flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow transition text-left"
							>
								<XCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
								<div>
									<p className="font-semibold text-red-900 dark:text-red-100">Reject Payment</p>
									<p className="text-xs text-red-800 dark:text-red-200">
										Request customer to resubmit
									</p>
								</div>
							</button>
						</div>
					)}

					{/* Verify Form */}
					{action === "verify" && (
						<div className="space-y-3 pt-3">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Verification Notes (Optional)
								</label>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="e.g., Verified via bank statement"
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								/>
							</div>
							<div className="flex gap-2">
								<button
									onClick={handleVerify}
									disabled={isLoading}
									className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg disabled:opacity-50 transition"
								>
									{isLoading ? "Verifying..." : "Verify"}
								</button>
								<button
									onClick={() => setAction(null)}
									className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 px-3 rounded-lg transition"
								>
									Back
								</button>
							</div>
						</div>
					)}

					{/* Reject Form */}
					{action === "reject" && (
						<div className="space-y-3 pt-3">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Rejection Reason *
								</label>
								<textarea
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="e.g., Amount mismatch, invalid proof, etc."
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								/>
							</div>
							<div className="flex gap-2">
								<button
									onClick={handleReject}
									disabled={isLoading}
									className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg disabled:opacity-50 transition"
								>
									{isLoading ? "Rejecting..." : "Reject"}
								</button>
								<button
									onClick={() => setAction(null)}
									className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 px-3 rounded-lg transition"
								>
									Back
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminPaymentVerificationModal;
