"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable as EgfmDataTable, type Column } from "@/components/egfm/data-table";
import type { AdvancedFilterField, AdvancedFilterValues } from "@/components/egfm/advanced-filter";
import { Button } from "@/components/egfm/button";
import { StateFeedback } from "@/components/shared/state-feedback";
import type { FilterDef, DataTableProps as ClassicProps } from "./DataTableClassic";

export type { FilterDef } from "./DataTableClassic";

/**
 * The admin's table: the egfm DataTable (toolbar, grid, in-card pagination, row
 * menu, filters, CSV) behind the props Green Pasture's pages already use
 * (TanStack column defs, 0-based server paging, FilterDef selects), so every
 * admin list gets the egfm table without each page being rewritten.
 */
export type DataTableProps<T> = Pick<
	ClassicProps<T>,
	| "columns"
	| "data"
	| "pageCount"
	| "pageIndex"
	| "pageSize"
	| "onPageChange"
	| "onPageSizeChange"
	| "pageSizeOptions"
	| "manualPagination"
	| "totalItems"
	| "manualFiltering"
	| "globalFilter"
	| "onGlobalFilterChange"
	| "isLoading"
	| "isError"
	| "onRetry"
	| "onRefresh"
	| "refreshing"
	| "toolbar"
	| "filters"
	| "filterValues"
	| "onFilterChange"
	| "searchPlaceholder"
	| "emptyMessage"
	| "emptyDescription"
	| "emptyAction"
	| "onRowClick"
	| "testId"
	| "showSN"
	| "showAuditColumns"
>;

const humanize = (s: string) => s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

/** TanStack column def -> egfm column. The cell gets the same {row, getValue} the page's renderer expects. */
function toColumn<T>(def: ColumnDef<T, any>, index: number): Column<T> {
	const accessorKey = (def as any).accessorKey as keyof T | undefined;
	const id = (def.id as string | undefined) ?? (accessorKey as string | undefined) ?? `col-${index}`;
	const meta = def.meta;
	const header = typeof def.header === "string" ? def.header : humanize(id);
	const isActions = id === "actions";
	const align = meta?.align === "center" ? "text-center" : meta?.align === "right" ? "text-right" : undefined;
	const cls = [align, isActions && "w-16 text-right", (meta?.truncate || meta?.maxWidth) && "max-w-xs truncate"].filter(Boolean).join(" ");

	return {
		header,
		accessorKey,
		className: cls || undefined,
		sort: def.enableSorting === false || isActions || !accessorKey ? undefined : true,
		exportValue: isActions ? false : undefined,
		pinEnd: isActions || undefined,
		cell: (item: T) => {
			const value = accessorKey ? (item[accessorKey] as unknown) : undefined;
			if (typeof def.cell === "function") {
				return (def.cell as (ctx: unknown) => React.ReactNode)({ row: { original: item, index }, getValue: () => value, column: { id }, table: {} });
			}
			return value == null ? "" : String(value);
		},
	};
}

export function DataTable<T extends { id?: string | number }>({
	columns,
	data,
	pageCount,
	pageIndex = 0,
	pageSize,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions,
	manualPagination = true,
	totalItems,
	manualFiltering = false,
	globalFilter,
	onGlobalFilterChange,
	isLoading = false,
	isError = false,
	onRetry,
	onRefresh,
	refreshing = false,
	toolbar,
	filters,
	filterValues = {},
	onFilterChange,
	searchPlaceholder = "Search…",
	emptyMessage = "No records found",
	emptyDescription,
	emptyAction,
	onRowClick,
	testId = "data-table",
	showSN = true,
	showAuditColumns = true,
}: DataTableProps<T>) {
	const [path, setPath] = React.useState("");
	React.useEffect(() => setPath(window.location.pathname), []);

	const egfmColumns = React.useMemo(() => columns.map(toColumn) as unknown as Column<{ id: string | number }>[], [columns]);

	// The server search is debounced here, as the previous table did, so each keystroke isn't a request.
	const [pending, setPending] = React.useState<string | null>(null);
	React.useEffect(() => {
		if (pending === null || !onGlobalFilterChange) return;
		const t = setTimeout(() => onGlobalFilterChange(pending), 300);
		return () => clearTimeout(t);
	}, [pending, onGlobalFilterChange]);

	const filterFields: AdvancedFilterField<{ id: string | number }>[] | undefined = filters?.map((f) => ({ key: f.key, label: f.label, type: "select", options: f.options.map((o) => ({ value: o.value, label: o.label })) }));

	const effPageSize = pageSize ?? pageSizeOptions?.[0] ?? 10;
	const rows = data as unknown as { id: string | number }[];
	const hasRowIds = rows.every((r) => r.id !== undefined && r.id !== null);
	// Rows without their own id still need a stable key.
	const keyed = hasRowIds ? rows : rows.map((r, i) => ({ ...r, id: i }));

	if (isError) {
		return (
			<div className="border-border bg-card rounded-xl border p-6" data-testid={`${testId}-error`}>
				<StateFeedback variant="error" size="sm" title="Couldn't load data." action={onRetry ? { label: "Retry", onClick: onRetry } : undefined} />
			</div>
		);
	}

	const searchKeys = columns.map((c) => (c as any).accessorKey).filter(Boolean);

	return (
		<EgfmDataTable
			data={keyed as { id: string | number }[]}
			columns={egfmColumns}
			testId={testId}
			columnsKey={path ? `${path}:${testId}` : undefined}
			exportFileName={testId}
			showSerialNumber={showSN}
			auditColumns={showAuditColumns}
			loading={isLoading}
			searchPlaceholder={searchPlaceholder}
			{...(manualFiltering ? { onSearchChange: (v: string) => setPending(v), searchValue: globalFilter } : { searchKey: searchKeys })}
			onRefresh={onRefresh}
			refreshing={refreshing}
			actions={toolbar}
			onRowClick={onRowClick as ((item: { id: string | number }) => void) | undefined}
			pageSize={effPageSize}
			pageSizeOptions={pageSizeOptions ?? [10, 15, 20, 50]}
			serverPagination={
				manualPagination
					? {
							page: pageIndex + 1,
							pageSize: effPageSize,
							total: Math.max(totalItems ?? (pageCount ? pageCount * effPageSize : keyed.length), keyed.length),
							onPageChange: (p) => onPageChange?.(p - 1),
							onPageSizeChange,
						}
					: undefined
			}
			advancedFilter={
				filterFields && filterFields.length
					? {
							fields: filterFields,
							value: filterValues as AdvancedFilterValues,
							onApply: (v) => filterFields.forEach((f) => onFilterChange?.(f.key, v[f.key] ?? "")),
						}
					: undefined
			}
			emptyState={{
				title: emptyMessage,
				description: emptyDescription ?? "Try adjusting your search or filters, or add a new record.",
				action: emptyAction ? (
					emptyAction.href ? (
						<a href={emptyAction.href} className="text-brand-ink text-xs font-semibold underline">
							{emptyAction.label}
						</a>
					) : (
						<Button size="sm" variant="outline" onClick={emptyAction.onClick}>
							{emptyAction.label}
						</Button>
					)
				) : undefined,
			}}
		/>
	);
}

export default DataTable;
