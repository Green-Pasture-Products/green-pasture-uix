import * as React from "react";
import { Columns3 } from "lucide-react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Checkbox } from "../checkbox";
import { AnimatedLogoLoader } from "../animated-logo-loader";
import { withAuditColumns } from "./audit-columns";
import { DataTableGrid } from "./data-table-grid";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTableToolbar } from "./data-table-toolbar";
import type { DataTableProps } from "./types";
import { useDataTable } from "./use-data-table";
import { useTableFilter } from "./use-table-filter";
import { getPaginationRange } from "./pagination-range";

export type { AuditFields, Column, DataTableProps, ServerPagination, SortState } from "./types";
export { DataTableSkeleton } from "./data-table-skeleton";
export { buildRowMenu } from "./row-menu";
// EGFM patch: the CSV helpers, for exports that fetch every row from the API.
export { downloadCsv, toCsv } from "./csv";
// EGFM patch: Modified By is empty until the record is modified.
export { modifiedBy, wasModified } from "./audit-helpers";

/** The admin console's one table: toolbar (search, filters, refresh, CSV), grid, pagination — MuiTableWrapper's shape. */
export function DataTable<T extends { id: string | number }>({
  data,
  columns: pageColumns,
  auditColumns = true,
  showSerialNumber = true,
  searchKey,
  onSearchChange,
  searchValue,
  searchPlaceholder = "Search records...",
  onRefresh,
  refreshing = false,
  loading = false,
  loadingType = "skeleton",
  advancedFilter,
  actions,
  exportFileName = "export",
  onView,
  onEdit,
  canEdit,
  rowActions,
  rowActionsTitle,
  onRowClick,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showPageSizeSelector = true,
  defaultSort,
  showToolbar = true,
  emptyState,
  serverPagination: server,
  onExport,
  testId = "data-table",
  columnsKey,
}: DataTableProps<T>) {
  // EGFM patch: a server page can't be sorted client-side honestly (only that page would reorder).
  const allColumns = withAuditColumns(server ? pageColumns.map((c) => ({ ...c, sort: undefined })) : pageColumns, auditColumns);
  // EGFM patch: hidden columns are remembered per `columnsKey` (read after mount so server and client markup match).
  const [hidden, setHidden] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!columnsKey) return;
    try {
      setHidden(JSON.parse(localStorage.getItem(`gp:table-columns:${columnsKey}`) ?? "[]"));
    } catch {}
  }, [columnsKey]);
  const toggleColumn = (header: string) =>
    setHidden((prev) => {
      const next = prev.includes(header) ? prev.filter((h) => h !== header) : [...prev, header];
      try {
        if (columnsKey) localStorage.setItem(`gp:table-columns:${columnsKey}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  const columns = allColumns.filter((c) => !hidden.includes(c.header));
  // EGFM patch: "Last modified" would filter only the loaded page on a server table, so it is client-only.
  const filter = useTableFilter(advancedFilter, auditColumns && !server);
  const table = useDataTable({
    data,
    columns,
    searchKey,
    serverSearch: !!onSearchChange,
    pageSize,
    exportFileName,
    filterFields: filter.fields,
    filterValue: filter.value,
    defaultSort,
    initialSearch: searchValue,
  });

  // EGFM patch: server paging. The page owns page/pageSize/total; `data` is the current page as-is.
  const page = server
    ? {
        rows: table.filteredData,
        total: server.total,
        current: server.page,
        size: server.pageSize,
        totalPages: Math.max(1, Math.ceil(server.total / server.pageSize)),
        range: getPaginationRange(server.page, Math.max(1, Math.ceil(server.total / server.pageSize))),
        setPage: server.onPageChange,
        setSize: (size: number) => {
          server.onPageSizeChange?.(size);
          server.onPageChange(1);
        },
      }
    : {
        rows: table.paginatedData,
        total: table.filteredData.length,
        current: table.currentPage,
        size: table.currentPageSize,
        totalPages: table.totalPages,
        range: table.paginationRange,
        setPage: table.setCurrentPage,
        setSize: (size: number) => {
          table.setCurrentPageSize(size);
          table.setCurrentPage(1);
        },
      };

  return (
    <div className="space-y-3" data-testid={testId}>
      {showToolbar && (
      <DataTableToolbar
        showSearch={!!(searchKey || onSearchChange)}
        searchTerm={table.searchTerm}
        searchPlaceholder={searchPlaceholder}
        onSearch={(value) => {
          table.setSearchTerm(value);
          onSearchChange?.(value);
          page.setPage(1);
        }}
        advancedFilter={filter.fields.length ? { fields: filter.fields, value: filter.value, onApply: filter.apply } : undefined}
        onFilterChange={() => page.setPage(1)}
        actions={
          <>
            {actions}
            {columnsKey && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-xs" data-testid={`${testId}-columns`}>
                    <Columns3 className="size-3.5" />
                    <span className="hidden sm:inline">Columns</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={6} className="w-52 p-1.5">
                  <p className="text-muted-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-wider">Toggle columns</p>
                  {allColumns.map((c) => (
                    <label key={c.header} className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium">
                      <Checkbox checked={!hidden.includes(c.header)} onChange={() => toggleColumn(c.header)} data-testid={`${testId}-column-${c.header}`} />
                      {c.header}
                    </label>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </>
        }
        testId={testId}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onExport={onExport ?? table.exportCsv}
        canExport={page.total > 0}
      />
      )}

      {loading ? (
        <DataTableSkeleton rows={Math.min(pageSize || 5, 8)} columns={columns.length + (showSerialNumber ? 1 : 0) + (onView || onEdit || rowActions ? 1 : 0)} showToolbar={false} />
      ) : (
      <div className="rounded-xl border border-border/70 dark:border-border/60 bg-card shadow-xs overflow-hidden transition-all duration-200">
        <DataTableGrid
          rows={page.rows}
          columns={columns}
          showSerialNumber={showSerialNumber}
          firstSerial={(page.current - 1) * page.size + 1}
          onView={onView}
          onEdit={onEdit}
          canEdit={canEdit}
          rowActions={rowActions}
          rowActionsTitle={rowActionsTitle}
          onRowClick={onRowClick}
          emptyState={emptyState}
          sort={table.sort}
          onSort={table.toggleSort}
          testId={testId}
        />
        <DataTablePagination
          total={page.total}
          currentPage={page.current}
          totalPages={page.totalPages}
          pageSize={page.size}
          pageSizeOptions={pageSizeOptions}
          showPageSizeSelector={showPageSizeSelector}
          paginationRange={page.range}
          onPageChange={page.setPage}
          onPageSizeChange={page.setSize}
          testId={testId}
        />
      </div>
      )}
    </div>
  );
}

export default DataTable;
