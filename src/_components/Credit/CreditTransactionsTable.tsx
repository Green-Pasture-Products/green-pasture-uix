import React from "react";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface Transaction {
	id: string;
	transactionType: "DEBIT" | "CREDIT" | "ADJUSTMENT";
	amount: number;
	description: string;
	referenceId?: string;
	createdAt: string;
	createdBy: string;
}

interface CreditTransactionsTableProps {
	transactions: Transaction[];
	onViewAll?: () => void;
	limit?: number;
}

const CreditTransactionsTable: React.FC<CreditTransactionsTableProps> = ({
	transactions,
	onViewAll,
	limit = 5,
}) => {
	const displayedTransactions = transactions.slice(0, limit);

	const getVariant = (type: string) => {
		switch (type) {
			case "DEBIT":
				return "error";
			case "CREDIT":
				return "success";
			case "ADJUSTMENT":
				return "info";
			default:
				return "neutral";
		}
	};

	if (transactions.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500 dark:text-gray-400">
				<p>No transactions yet</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead className="border-b border-gray-200 dark:border-gray-700">
					<tr>
						<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
						<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Description</th>
						<th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
						<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
					</tr>
				</thead>
				<tbody>
					{displayedTransactions.map((transaction) => (
						<tr
							key={transaction.id}
							className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
						>
							<td className="py-3 px-4">
								<Badge variant={getVariant(transaction.transactionType)}>
									{transaction.transactionType}
								</Badge>
							</td>
							<td className="py-3 px-4 text-gray-900 dark:text-white">{transaction.description}</td>
							<td
								className={`py-3 px-4 text-right font-semibold ${
									transaction.transactionType === "DEBIT"
										? "text-red-600 dark:text-red-400"
										: "text-green-600 dark:text-green-400"
								}`}
							>
								{transaction.transactionType === "DEBIT" ? "-" : "+"}
								{formatCurrency(transaction.amount)}
							</td>
							<td className="py-3 px-4 text-gray-600 dark:text-gray-400">
								{new Date(transaction.createdAt).toLocaleDateString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{transactions.length > limit && onViewAll && (
				<div className="text-center py-4">
					<button
						onClick={onViewAll}
						className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
					>
						View all transactions →
					</button>
				</div>
			)}
		</div>
	);
};

export default CreditTransactionsTable;
