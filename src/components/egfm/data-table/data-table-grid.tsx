import { ArrowDown, ArrowUp, ChevronsUpDown, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { ActionDropdown } from "../action-dropdown";
import { buildRowMenu, hasRowMenu } from "./row-menu";
import type { DataTableGridProps } from "./types";

export function DataTableGrid<T extends { id: string | number }>({
  rows,
  columns,
  showSerialNumber,
  firstSerial,
  onView,
  onEdit,
  canEdit,
  rowActions,
  rowActionsTitle = "Actions",
  onRowClick,
  emptyState,
  sort,
  onSort,
  testId = "data-table",
}: DataTableGridProps<T>) {
  const menu = { onView, onEdit, canEdit, rowActions };
  const showMenu = hasRowMenu(menu);
  const colSpan = columns.length + (showSerialNumber ? 1 : 0) + (showMenu ? 1 : 0);

  return (
    <div className="overflow-x-auto scrollbar-none">
      <Table>
        <TableHeader>
          <TableRow className="bg-brand-soft hover:bg-brand-soft dark:bg-white/[0.04] dark:hover:bg-white/[0.04] border-b border-border/80 whitespace-nowrap">
            {showSerialNumber && (
              <TableHead className="w-12 text-center text-xs font-semibold text-muted-foreground whitespace-nowrap select-none">SN</TableHead>
            )}
            {columns.map((col, idx) => {
              const direction = sort?.column === col.header ? sort.direction : undefined;
              const SortIcon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ChevronsUpDown;
              return (
                <TableHead
                  key={idx}
                  aria-sort={col.sort ? (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none") : undefined}
                  className={cn("text-xs font-semibold whitespace-nowrap px-4 text-muted-foreground", col.className)}
                >
                  {col.sort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.header)}
                      className="-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {col.header}
                      <SortIcon className={cn("size-3", direction ? "text-foreground" : "opacity-50")} aria-hidden />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
            {showMenu && (
              <TableHead className="text-xs font-semibold whitespace-nowrap px-4 text-muted-foreground text-right w-16"><span className="sr-only">Actions</span></TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((item, rowIdx) => (
              <TableRow
                key={item.id}
                data-testid={`${testId}-row-${item.id}`}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "transition-colors duration-150 border-b border-border/60 hover:bg-muted/50 dark:hover:bg-muted/30 active:bg-muted/70",
                  onRowClick && "cursor-pointer",
                )}
              >
                {showSerialNumber && (
                  <TableCell className="w-12 text-center font-mono text-[11px] font-medium text-muted-foreground/80 select-none">
                    {firstSerial + rowIdx}
                  </TableCell>
                )}
                {columns.map((col, idx) => (
                  <TableCell key={idx} className={cn("text-xs py-3 text-foreground/90 whitespace-nowrap", col.className)}>
                    {col.cell ? col.cell(item) : String(col.accessorKey ? item[col.accessorKey] ?? "" : "")}
                  </TableCell>
                ))}
                {showMenu && (
                  <TableCell className="text-xs py-3 text-right">
                    <div className="flex justify-end">
                      <ActionDropdown
                        title={typeof rowActionsTitle === "function" ? rowActionsTitle(item) : rowActionsTitle}
                        items={buildRowMenu(item, menu)}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-44 text-center py-10">
                <div className="flex flex-col items-center justify-center gap-2" data-testid={`${testId}-empty`}>
                  <Filter className="size-8 text-muted-foreground/40" />
                  <p className="font-semibold text-sm text-foreground">{emptyState?.title || "No records found"}</p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {emptyState?.description || "Try adjusting your search filter or add a new record."}
                  </p>
                  {emptyState?.action && <div className="mt-2">{emptyState.action}</div>}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
