import React from "react";
import Link from "next/link";
import Badge from "@/_UI/Badge";
import { formatCurrency } from "@/_UI/FormatValue";

interface CreditCustomer {
	id: string;
	name: string;
	email: string;
	phone: string;
	creditAccount?: {
		creditStatus: "ACTIVE" | "SUSPENDED" | "DISABLED";
		creditLimit: number;
		outstandingBalance: number;
		availableCredit: number;
	};
}

interface AdminCreditCustomersTableProps {
	customers: CreditCustomer[];
	onSelectCustomer?: (customer: CreditCustomer) => void;
	isSelectable?: boolean;
}

const AdminCreditCustomersTable: React.FC<AdminCreditCustomersTableProps> = ({
	customers,
	onSelectCustomer,
	isSelectable = false,
}) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "success";
			case "SUSPENDED":
				return "warning";
			case "DISABLED":
				return "danger";
			default:
				return "info";
		}
	};

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead className="border-b border-gray-200 dark:border-gray-700">
					<tr>
						{isSelectable && (
							<th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 w-12">
								<input type="checkbox" className="w-4 h-4" />
							</th>
						)}
						<th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
							Customer
						</th>
						<th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
							Status
						</th>
						<th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
							Limit
						</th>
						<th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
							Outstanding
						</th>
						<th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
							Available
						</th>
						<th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					{customers.map((customer) => (
						<tr
							key={customer.id}
							className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
							onClick={() => onSelectCustomer?.(customer)}
						>
							{isSelectable && (
								<td className="px-4 py-3">
									<input type="checkbox" className="w-4 h-4" />
								</td>
							)}
							<td className="px-4 py-3">
								<div className="font-semibold text-gray-900 dark:text-white">
									{customer.name}
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400">
									{customer.email}
								</div>
							</td>
							<td className="px-4 py-3">
								{customer.creditAccount && (
									<Badge variant={getStatusColor(customer.creditAccount.creditStatus)}>
										{customer.creditAccount.creditStatus}
									</Badge>
								)}
							</td>
							<td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
								{customer.creditAccount
									? formatCurrency(customer.creditAccount.creditLimit)
									: "-"}
							</td>
							<td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
								{customer.creditAccount
									? formatCurrency(customer.creditAccount.outstandingBalance)
									: "-"}
							</td>
							<td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">
								{customer.creditAccount
									? formatCurrency(customer.creditAccount.availableCredit)
									: "-"}
							</td>
							<td className="px-4 py-3 text-center">
								<Link href={`/admin/credit/customers/${customer.id}`}>
									<a className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">
										Manage
									</a>
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default AdminCreditCustomersTable;
