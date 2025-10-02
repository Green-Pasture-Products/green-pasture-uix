import React from "react";

export type Column<T> = {
	key: keyof T;
	header: string;
	render?: (value: string | number, row: T) => React.ReactNode;
};

type TableProps<T> = {
	columns: Column<T>[];
	data: T[];
	isLoading?: boolean;
	searching?: boolean;
	currentPage?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Table<T extends Record<string, any>>({
	columns,
	data,
	isLoading,
	searching,
	currentPage,
}: TableProps<T>) {
	if (isLoading || searching) {
		// if (((data?.length === 0 || currentPage !== 1) && isLoading) || searching) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="w-8 h-8 border-4 border-[#B28309] border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto scrollbar-hidden">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						{columns?.map((col) => (
							<th
								key={String(col.key)}
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{data?.length > 0 ? (
						data?.map((row, rowIndex) => (
							<tr key={rowIndex} className="hover:bg-gray-50">
								{columns?.map((col) => (
									<td
										key={String(col.key)}
										className="px-6 py-4 text-sm text-gray-900 last:relative whitespace-nowrap"
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
	);
}
