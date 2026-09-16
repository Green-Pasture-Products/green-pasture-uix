import React, { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentSubmissionFormProps {
	outstandingBalance: number;
	onSubmit: (data: {
		paymentAmount: number;
		paymentDate: string;
		paymentMethod: string;
		transactionReference?: string;
		proofOfPaymentUrl?: string;
	}) => Promise<void>;
	loading?: boolean;
}

const PaymentSubmissionForm: React.FC<PaymentSubmissionFormProps> = ({
	outstandingBalance,
	onSubmit,
	loading = false,
}) => {
	const [formData, setFormData] = useState({
		paymentAmount: "",
		paymentDate: "",
		paymentMethod: "BANK_TRANSFER",
		transactionReference: "",
	});
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size must be less than 5MB");
			return;
		}

		setUploading(true);
		try {
			const formDataUpload = new FormData();
			formDataUpload.append("file", file);

			const res = await fetch("/api/v1/upload", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: formDataUpload,
			});

			if (res.ok) {
				const data = await res.json();
				setUploadedFile(file);
				setFormData((prev) => ({
					...prev,
					proofOfPaymentUrl: data.url,
				}));
				toast.success("File uploaded successfully");
			} else {
				toast.error("Failed to upload file");
			}
		} catch (error) {
			toast.error("Error uploading file");
			console.error(error);
		} finally {
			setUploading(false);
		}
	};

	const handleRemoveFile = () => {
		setUploadedFile(null);
		setFormData((prev) => ({
			...prev,
			proofOfPaymentUrl: undefined,
		}));
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const amount = parseFloat(formData.paymentAmount);
		if (!amount || amount <= 0) {
			toast.error("Please enter a valid payment amount");
			return;
		}

		if (amount > outstandingBalance) {
			toast.error(`Payment amount cannot exceed outstanding balance of ${outstandingBalance}`);
			return;
		}

		if (!formData.paymentDate) {
			toast.error("Please select a payment date");
			return;
		}

		await onSubmit({
			paymentAmount: amount,
			paymentDate: formData.paymentDate,
			paymentMethod: formData.paymentMethod,
			transactionReference: formData.transactionReference || undefined,
			proofOfPaymentUrl: (formData as any).proofOfPaymentUrl,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Outstanding Balance Alert */}
			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<p className="text-sm text-blue-900 dark:text-blue-100">
					Outstanding Balance:{" "}
					<span className="font-bold text-lg">₦{outstandingBalance.toLocaleString()}</span>
				</p>
			</div>

			{/* Payment Amount */}
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Payment Amount *
				</label>
				<div className="relative">
					<span className="absolute left-3 top-3 text-gray-600 dark:text-gray-400">₦</span>
					<input
						type="number"
						name="paymentAmount"
						value={formData.paymentAmount}
						onChange={handleChange}
						placeholder="0.00"
						step="0.01"
						min="0"
						max={outstandingBalance}
						className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
					/>
				</div>
				<p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
					Maximum: ₦{outstandingBalance.toLocaleString()}
				</p>
			</div>

			{/* Payment Date */}
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Payment Date *
				</label>
				<input
					type="date"
					name="paymentDate"
					value={formData.paymentDate}
					onChange={handleChange}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
				/>
			</div>

			{/* Payment Method */}
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Payment Method *
				</label>
				<select
					name="paymentMethod"
					value={formData.paymentMethod}
					onChange={handleChange}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
				>
					<option value="BANK_TRANSFER">Bank Transfer</option>
					<option value="CASH">Cash</option>
					<option value="CHECK">Check</option>
					<option value="OTHER">Other</option>
				</select>
			</div>

			{/* Transaction Reference */}
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Transaction Reference
				</label>
				<input
					type="text"
					name="transactionReference"
					value={formData.transactionReference}
					onChange={handleChange}
					placeholder="e.g., Transfer receipt number"
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
				/>
			</div>

			{/* File Upload */}
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Proof of Payment (Optional)
				</label>
				<input
					ref={fileInputRef}
					type="file"
					onChange={handleFileUpload}
					accept="image/*,.pdf"
					className="hidden"
					disabled={uploading}
				/>

				{uploadedFile ? (
					<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-green-700 dark:text-green-100 text-sm font-medium">
								✓ {uploadedFile.name}
							</span>
						</div>
						<button
							type="button"
							onClick={handleRemoveFile}
							className="text-red-600 dark:text-red-400 hover:opacity-75"
						>
							<X size={18} />
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading}
						className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 disabled:opacity-50 transition"
					>
						<Upload className="mx-auto mb-2 text-gray-400" size={24} />
						<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{uploading ? "Uploading..." : "Click to upload payment proof"}
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							PNG, JPG, PDF up to 5MB
						</p>
					</button>
				)}
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={loading || uploading}
				className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition"
			>
				{loading ? "Submitting..." : "Submit Payment"}
			</button>
		</form>
	);
};

export default PaymentSubmissionForm;
