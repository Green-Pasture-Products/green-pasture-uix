import React, { ReactNode, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Loader from "../Loader";
import CustomModal from ".";

interface DeleteModalProps {
	onDeleteAction: () => void;
	title?: string;
	message?: string;
	isLoading?: boolean;
	confirmText?: string;
	cancelText?: string;
	type?: "danger" | "warning";
	children: ReactNode;
	className: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
	onDeleteAction,
	title = "Delete Item",
	message = "Are you sure you want to delete this item? This action cannot be undone.",
	isLoading = false,
	confirmText = "Delete",
	cancelText = "Cancel",
	type = "danger",
	children,
	className,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleConfirm = () => {
		onDeleteAction();
	};

	const onClose = () => {
		setIsModalOpen(false);
	};

	return (
		<>
			<button
				className={`px-3 py-1 text-sm rounded flex items-center space-x-1 cursor-pointer ${className}`}
				onClick={() => setIsModalOpen(true)}
			>
				{isLoading ? "loading..." : children}
			</button>

			<CustomModal
				isOpen={isModalOpen}
				onClose={onClose}
				title={title}
				size="sm"
			>
				<div className="break-all flex items-center space-x-2">
					<div className="h-6 w-6">
						<AlertTriangle
							className={` ${
								type === "danger" ? "text-red-600" : "text-yellow-600"
							}`}
						/>
					</div>
					<p className="text-gray-600 m-0">{message}</p>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end space-x-3 mt-8">
					<button
						onClick={onClose}
						disabled={isLoading}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{cancelText}
					</button>
					<button
						onClick={handleConfirm}
						disabled={isLoading}
						className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
							type === "danger"
								? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
								: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
						}`}
					>
						{isLoading ? <Loader text="Deleting..." /> : confirmText}
					</button>
				</div>
			</CustomModal>
		</>
	);
};

export default DeleteModal;
