import { useLayoutEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

export default function CustomModal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
}: ModalProps) {
	useLayoutEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
	};

	return (
		<div
			className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 bg-opacity-75 backdrop-blur-md"
			onClick={onClose}
		>
			<div
				className={`relative w-full ${sizeClasses[size]} h-fit max-h-2xl overflow-y-auto overflow-x-hidden bg-white rounded-lg shadow-xl transform transition-all`} // top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h3 className="text-xl font-semibold text-gray-900">
							{title}
						</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="Close modal"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				)}

				<div className="p-6">{children}</div>
			</div>
		</div>
	);
}
