import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Filter, Download, Inbox } from "lucide-react";

// ── Types ──

export type Column<T> = {
	key: keyof T | string;
	header: string;
	render?: (value: any, row: T, index: number) => React.ReactNode;
	width?: string;
	maxWidth?: string;
	align?: "left" | "center" | "right";
	hidden?: boolean;
	truncate?: boolean;
};

export interface FilterDef {
	key: string;
	label: string;
	options: { value: string; label: string }[];
}

interface PaginationMeta {
	currentPage: number;
	totalItems: number;
	itemsPerPage: number;
	totalPages: number;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	isLoading?: boolean;
	pagination?: PaginationMeta;
	onPageChange?: (page: number) => void;
	onSearch?: (query: string) => void;
	searchPlaceholder?: string;
	filters?: FilterDef[];
	filterValues?: Record<string, string>;
	onFilterChange?: (key: string, value: string) => void;
	onRowClick?: (row: T) => void;
	actions?: React.ReactNode;
	onExport?: () => void;
	emptyMessage?: string;
	emptyDescription?: string;
	className?: string;
	showSN?: boolean;

	// Legacy compat props
	currentPage?: number;
	totalPages?: number;
}

// ── Skeleton Row ──

const SkeletonRow: React.FC<{ cols: number; showSN?: boolean }> = ({ cols, showSN }) => (
	<tr style={{ borderBottom: "1px solid var(--border-light)" }}>
		{showSN && (
			<td className="px-4 py-4" style={{ width: 52 }}>
				<div
					className="h-3.5 w-5 rounded-full animate-pulse"
					style={{ background: "var(--surface-medium)" }}
				/>
			</td>
		)}
		{Array.from({ length: cols }).map((_, i) => (
			<td key={i} className="px-4 py-4">
				<div
					className="h-3.5 rounded-full animate-pulse"
					style={{
						width: `${50 + Math.random() * 40}%`,
						background: "var(--surface-medium)",
					}}
				/>
			</td>
		))}
	</tr>
);

// ── Filter Chip ──

const FilterChip: React.FC<{
	label: string;
	value: string;
	onClear: () => void;
}> = ({ label, value, onClear }) => (
	<span
		className="inline-flex items-center gap-1 text-[0.65rem] font-medium px-2 py-1 rounded-md"
		style={{
			background: "var(--surface-medium)",
			color: "var(--text-secondary)",
		}}
	>
		{label}: {value}
		<button
			onClick={onClear}
			className="ml-0.5 hover:opacity-70 cursor-pointer"
		>
			<svg
				width="10"
				height="10"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
			>
				<path d="M18 6L6 18M6 6l12 12" />
			</svg>
		</button>
	</span>
);

// ── Main Component ──

export function DataTable<T extends Record<string, any>>({
	columns,
	data,
	isLoading = false,
	pagination,
	onPageChange,
	onSearch,
	searchPlaceholder = "Search...",
	filters,
	filterValues = {},
	onFilterChange,
	onRowClick,
	actions,
	onExport,
	emptyMessage = "No data found",
	emptyDescription,
	className = "",
	showSN = true,
	currentPage: legacyCurrentPage,
	totalPages: legacyTotalPages,
}: DataTableProps<T>) {
	const [searchValue, setSearchValue] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [localPage, setLocalPage] = useState(1);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const visibleColumns = columns.filter((c) => !c.hidden);

	const activeFilterCount = Object.values(filterValues).filter(
		(v) => v && v !== ""
	).length;

	// Debounced search
	useEffect(() => {
		if (!onSearch) return;
		debounceRef.current = setTimeout(() => {
			onSearch(searchValue);
		}, 400);
		return () => clearTimeout(debounceRef.current);
	}, [searchValue, onSearch]);

	const getValue = useCallback((row: T, key: string) => {
		const parts = key.split(".");
		let val: unknown = row;
		for (const p of parts) {
			if (val == null) return undefined;
			val = (val as Record<string, unknown>)[p];
		}
		return val;
	}, []);

	// Pagination
	const totalPages = pagination?.totalPages ?? legacyTotalPages ?? (Math.ceil(data.length / 10) || 1);
	const page = pagination?.currentPage ?? legacyCurrentPage ?? localPage;
	const totalItems = pagination?.totalItems ?? data.length;
	const itemsPerPage = pagination?.itemsPerPage ?? 10;
	const startItem = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
	const endItem = Math.min(page * itemsPerPage, totalItems);

	const displayData =
		pagination || onPageChange
			? data
			: data.slice((localPage - 1) * 10, localPage * 10);

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		if (onPageChange) {
			onPageChange(newPage);
		} else {
			setLocalPage(newPage);
		}
	};

	const getPageNumbers = (): (number | "ellipsis")[] => {
		const pages: (number | "ellipsis")[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			if (page > 3) pages.push("ellipsis");
			const start = Math.max(2, page - 1);
			const end = Math.min(totalPages - 1, page + 1);
			for (let i = start; i <= end; i++) pages.push(i);
			if (page < totalPages - 2) pages.push("ellipsis");
			pages.push(totalPages);
		}
		return pages;
	};

	return (
		<div
			className={`rounded-xl overflow-hidden transition-colors duration-200 ${className}`}
			style={{
				background: "var(--surface-paper)",
				border: "1px solid var(--border-light)",
				boxShadow: "var(--shadow-sm)",
			}}
		>
			{/* ── Toolbar ── */}
			{(onSearch || actions || onExport || (filters && filters.length > 0)) && (
				<div
					className="flex flex-col gap-3 px-4 sm:px-5 py-3.5"
					style={{ borderBottom: "1px solid var(--border-light)" }}
				>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
						{/* Search */}
						{onSearch && (
							<div className="relative flex-1 max-w-sm">
								<Search
									className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
									style={{ color: "var(--text-hint)" }}
								/>
								<input
									type="text"
									value={searchValue}
									onChange={(e) =>
										setSearchValue(e.target.value)
									}
									placeholder={searchPlaceholder}
									className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-all"
									style={{
										background: "var(--surface-low)",
										border: "1px solid var(--border-light)",
										color: "var(--text-primary)",
									}}
								/>
							</div>
						)}

						{/* Action buttons */}
						<div className="flex items-center gap-2 shrink-0">
							{filters && filters.length > 0 && (
								<button
									onClick={() =>
										setShowFilters((prev) => !prev)
									}
									className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer"
									style={{
										border: "1px solid var(--border-medium)",
										color:
											activeFilterCount > 0
												? "var(--color-primary)"
												: "var(--text-secondary)",
										background: showFilters
											? "var(--surface-low)"
											: "transparent",
									}}
								>
									<Filter className="h-3.5 w-3.5" />
									Filters
									{activeFilterCount > 0 && (
										<span
											className="ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[0.6rem] font-bold rounded-full text-white"
											style={{
												background:
													"var(--color-primary)",
											}}
										>
											{activeFilterCount}
										</span>
									)}
								</button>
							)}

							{onExport && (
								<button
									onClick={onExport}
									disabled={data.length === 0}
									className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
									style={{
										border: "1px solid var(--border-medium)",
										color: "var(--text-secondary)",
									}}
								>
									<Download className="h-3.5 w-3.5" />
									Export
								</button>
							)}

							{actions}
						</div>
					</div>

					{/* Filter bar */}
					{showFilters && filters && filters.length > 0 && (
						<div className="flex flex-wrap items-center gap-2 animate-fade-up">
							{filters.map((f) => (
								<select
									key={f.key}
									value={filterValues[f.key] ?? ""}
									onChange={(e) =>
										onFilterChange?.(
											f.key,
											e.target.value
										)
									}
									className="text-xs font-medium px-2.5 py-1.5 rounded-lg outline-none cursor-pointer transition-all"
									style={{
										background: "var(--surface-low)",
										border: "1px solid var(--border-light)",
										color: "var(--text-primary)",
										minWidth: 130,
									}}
								>
									<option value="">{f.label}</option>
									{f.options.map((opt) => (
										<option
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</option>
									))}
								</select>
							))}

							{activeFilterCount > 0 && (
								<>
									<div
										className="h-5 w-px mx-1"
										style={{
											background: "var(--border-medium)",
										}}
									/>
									{Object.entries(filterValues)
										.filter(([, v]) => v && v !== "")
										.map(([key, value]) => {
											const def = filters.find(
												(f) => f.key === key
											);
											const optLabel =
												def?.options.find(
													(o) => o.value === value
												)?.label ?? value;
											return (
												<FilterChip
													key={key}
													label={
														def?.label ?? key
													}
													value={optLabel}
													onClear={() =>
														onFilterChange?.(
															key,
															""
														)
													}
												/>
											);
										})}
								</>
							)}
						</div>
					)}
				</div>
			)}

			{/* ── Table ── */}
			<div className="overflow-x-auto">
				<table className="w-full" style={{ tableLayout: "fixed" }}>
					<thead>
						<tr
							style={{
								background: "var(--surface-low)",
								borderBottom: "1px solid var(--border-light)",
							}}
						>
							{showSN && (
								<th
									className="px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-wider whitespace-nowrap text-left"
									style={{
										color: "var(--text-hint)",
										width: 52,
									}}
								>
									S/N
								</th>
							)}
							{visibleColumns.map((col) => (
								<th
									key={String(col.key)}
									className={`px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-wider whitespace-nowrap ${
										col.align === "center"
											? "text-center"
											: col.align === "right"
												? "text-right"
												: "text-left"
									}`}
									style={{
										color: "var(--text-hint)",
										width: col.width,
										maxWidth: col.maxWidth,
									}}
								>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							Array.from({ length: 6 }).map((_, i) => (
								<SkeletonRow
									key={i}
									cols={visibleColumns.length}
									showSN={showSN}
								/>
							))
						) : displayData.length === 0 ? (
							<tr>
								<td
									colSpan={visibleColumns.length + (showSN ? 1 : 0)}
									className="px-6 py-16 text-center"
								>
									<div className="flex flex-col items-center">
										<Inbox
											className="h-12 w-12 mb-3"
											style={{
												color: "var(--text-disabled)",
											}}
										/>
										<p
											className="text-sm font-medium"
											style={{
												color: "var(--text-secondary)",
											}}
										>
											{emptyMessage}
										</p>
										{emptyDescription && (
											<p
												className="text-xs mt-1"
												style={{
													color: "var(--text-hint)",
												}}
											>
												{emptyDescription}
											</p>
										)}
									</div>
								</td>
							</tr>
						) : (
							displayData.map((row, rowIndex) => (
								<tr
									key={
										(row as any).id ?? rowIndex
									}
									onClick={() => onRowClick?.(row)}
									className={`transition-colors duration-150 animate-row-enter ${
										onRowClick
											? "cursor-pointer"
											: ""
									}`}
									style={{
										borderBottom:
											"1px solid var(--border-light)",
										background:
											rowIndex % 2 === 0
												? "transparent"
												: "var(--surface-low)",
										animationDelay: `${rowIndex * 30}ms`,
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background =
											"var(--surface-medium)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background =
											rowIndex % 2 === 0
												? "transparent"
												: "var(--surface-low)";
									}}
								>
									{showSN && (
										<td
											className="px-4 py-3.5 text-[0.8rem] tabular-nums"
											style={{
												color: "var(--text-hint)",
												width: 52,
											}}
										>
											{startItem + rowIndex}
										</td>
									)}
									{visibleColumns.map((col) => {
										const val = getValue(
											row,
											String(col.key)
										);
										const shouldTruncate = col.truncate !== false && (col.maxWidth || col.truncate);
										return (
											<td
												key={String(col.key)}
												className={`px-4 py-3.5 text-[0.8rem] ${
													col.align === "center"
														? "text-center"
														: col.align ===
															  "right"
															? "text-right"
															: "text-left"
												}`}
												style={{
													color: "var(--text-primary)",
													maxWidth: col.maxWidth,
													...(shouldTruncate
														? {
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
															}
														: {}),
												}}
												title={shouldTruncate ? String(val ?? "") : undefined}
											>
												{col.render
													? col.render(
															val,
															row,
															rowIndex
														)
													: String(val ?? "")}
											</td>
										);
									})}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* ── Footer / Pagination ── */}
			{!isLoading && displayData.length > 0 && (
				<div
					className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5"
					style={{
						borderTop: "1px solid var(--border-light)",
						background: "var(--surface-low)",
					}}
				>
					<span
						className="text-xs"
						style={{ color: "var(--text-hint)" }}
					>
						Showing{" "}
						<span
							className="font-medium"
							style={{ color: "var(--text-primary)" }}
						>
							{startItem}–{endItem}
						</span>{" "}
						of{" "}
						<span
							className="font-medium"
							style={{ color: "var(--text-primary)" }}
						>
							{totalItems}
						</span>{" "}
						results
					</span>

					<div className="flex items-center gap-1">
						<button
							disabled={page <= 1}
							onClick={() => handlePageChange(page - 1)}
							className="p-1.5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
							style={{ color: "var(--text-hint)" }}
						>
							<ChevronLeft className="w-3.5 h-3.5" />
						</button>

						{getPageNumbers().map((p, i) =>
							p === "ellipsis" ? (
								<span
									key={`e${i}`}
									className="px-1 text-xs"
									style={{ color: "var(--text-disabled)" }}
								>
									...
								</span>
							) : (
								<button
									key={p}
									onClick={() =>
										handlePageChange(p as number)
									}
									className="min-w-[32px] h-8 rounded-md text-xs font-medium transition-all cursor-pointer"
									style={
										p === page
											? {
													background:
														"var(--color-primary)",
													color: "#fff",
													boxShadow:
														"var(--shadow-sm)",
												}
											: {
													color: "var(--text-secondary)",
												}
									}
								>
									{p}
								</button>
							)
						)}

						<button
							disabled={page >= totalPages}
							onClick={() => handlePageChange(page + 1)}
							className="p-1.5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
							style={{ color: "var(--text-hint)" }}
						>
							<ChevronRight className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default DataTable;
