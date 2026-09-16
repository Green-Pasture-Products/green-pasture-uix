import React from "react";
import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/_UI/FormatValue";

interface CreditSummaryCardProps {
	title: string;
	value: string | number;
	subtext?: string;
	icon?: React.ReactNode;
	variant?: "default" | "success" | "warning" | "danger";
	highlighted?: boolean;
}

const CreditSummaryCard: React.FC<CreditSummaryCardProps> = ({
	title,
	value,
	subtext,
	icon,
	variant = "default",
	highlighted = false,
}) => {
	const variantClasses = {
		default: "bg-white dark:bg-gray-800 border-l-4 border-blue-500",
		success: "bg-white dark:bg-gray-800 border-l-4 border-green-500",
		warning: "bg-white dark:bg-gray-800 border-l-4 border-yellow-500",
		danger: "bg-white dark:bg-gray-800 border-l-4 border-red-500",
	};

	const valueClasses = {
		default: "text-gray-900 dark:text-white",
		success: "text-green-600 dark:text-green-400",
		warning: "text-yellow-600 dark:text-yellow-400",
		danger: "text-red-600 dark:text-red-400",
	};

	return (
		<div className={`rounded-lg shadow p-6 ${variantClasses[variant]} ${highlighted ? "ring-2 ring-blue-500" : ""}`}>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</div>
					<div className={`text-3xl font-bold ${valueClasses[variant]}`}>
						{typeof value === "number" ? formatCurrency(value) : value}
					</div>
					{subtext && <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{subtext}</div>}
				</div>
				{icon && (
					<div className="flex-shrink-0">
						<div
							className={`rounded-full p-3 ${
								variant === "default"
									? "bg-blue-100 dark:bg-blue-900/30"
									: variant === "success"
										? "bg-green-100 dark:bg-green-900/30"
										: variant === "warning"
											? "bg-yellow-100 dark:bg-yellow-900/30"
											: "bg-red-100 dark:bg-red-900/30"
							}`}
						>
							{icon}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CreditSummaryCard;
