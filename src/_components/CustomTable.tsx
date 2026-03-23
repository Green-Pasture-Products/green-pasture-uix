import React, { useState } from "react";
import { Pagination } from "./Pagination";

export type Column<T> = {
	key: keyof T;
	header: string;
	render?: (value: string | number, row: T) => React.ReactNode;
};

type TableProps<T> = {
	columns: Column<T>[];
	tableRow: T[];
	isLoading?: boolean;
	currentPage: number;
	setCurrentPage: (val: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomTable<T extends Record<string, any>>({
	columns,
	tableRow,
	isLoading,
	currentPage,
	setCurrentPage,
}: TableProps<T>) {
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const totalPages = Math.ceil(tableRow?.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentData = tableRow.slice(startIndex, endIndex);

	// Reset to page 1 when items per page changes
	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		setCurrentPage(1);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="w-8 h-8 border-4 border-[#B28309] border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<>
			<div className="w-full bg-white dark:bg-white/[0.04] rounded-lg shadow-sm border border-gray-200 dark:border-white/8 overflow-x-auto scrollbar-hidden">
				<table className="w-full table-auto divide-y divide-gray-200 dark:divide-white/8">
					<thead className="bg-gray-50 dark:bg-white/[0.02]">
						<tr>
							{columns?.map((col) => (
								<th
									key={String(col.key)}
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
								>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200 dark:divide-white/8">
						{currentData?.length > 0 ? (
							currentData?.map((row, rowIndex) => (
								<tr
									key={rowIndex}
									className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition duration-150"
								>
									{columns?.map((col) => (
										<td
											key={String(col.key)}
											className="px-6 py-4 text-sm text-gray-900 dark:text-white/90 last:relative whitespace-nowrap"
										>
											{col.render
												? col.render(row[col.key], row)
												: String(row[col.key])}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns?.length}
									className="text-center py-4 font-semibold"
								>
									No data available
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{!isLoading && tableRow?.length > 0 && (
				<Pagination
					onItemsPerPageChange={handleItemsPerPageChange}
					onPageChange={setCurrentPage}
					totalItems={tableRow?.length}
					itemsPerPage={itemsPerPage}
					currentPage={currentPage}
					totalPages={totalPages}
				/>
			)}
		</>
	);
}
