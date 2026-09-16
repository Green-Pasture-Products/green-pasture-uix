import React from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface CreditStatusBadgeProps {
	status: "ACTIVE" | "SUSPENDED" | "DISABLED";
	size?: "sm" | "md" | "lg";
}

const CreditStatusBadge: React.FC<CreditStatusBadgeProps> = ({ status, size = "md" }) => {
	const getStatusIcon = () => {
		switch (status) {
			case "ACTIVE":
				return <CheckCircle size={size === "sm" ? 16 : size === "md" ? 20 : 24} />;
			case "SUSPENDED":
				return <AlertCircle size={size === "sm" ? 16 : size === "md" ? 20 : 24} />;
			case "DISABLED":
				return <XCircle size={size === "sm" ? 16 : size === "md" ? 20 : 24} />;
		}
	};

	const getStatusClasses = () => {
		const baseClasses = "inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium";
		const sizeClasses = {
			sm: "text-xs",
			md: "text-sm",
			lg: "text-base px-4 py-2",
		};

		const variantClasses = {
			ACTIVE: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
			SUSPENDED: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
			DISABLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
		};

		return `${baseClasses} ${sizeClasses[size]} ${variantClasses[status]}`;
	};

	return (
		<span className={getStatusClasses()}>
			{getStatusIcon()}
			<span>{status}</span>
		</span>
	);
};

export default CreditStatusBadge;
