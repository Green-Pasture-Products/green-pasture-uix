import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { NAV_BUTTON } from "./constants";
import type { DataTablePaginationProps } from "./types";

export function DataTablePagination({
  total,
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  showPageSizeSelector,
  paginationRange,
  onPageChange,
  onPageSizeChange,
  testId = "data-table",
}: DataTablePaginationProps) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const atStart = currentPage === 1 || total === 0;
  const atEnd = currentPage === totalPages || total === 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/70 px-4 py-3 text-xs text-muted-foreground bg-secondary/15 dark:bg-secondary/10 select-none">
      <div className="text-[11px] sm:text-xs" data-testid={`${testId}-count`}>
        {total > 0 ? (
          <>
            Showing <span className="font-semibold text-foreground">{start}</span> to{" "}
            <span className="font-semibold text-foreground">{end}</span> of{" "}
            <span className="font-semibold text-foreground">{total}</span> entries
          </>
        ) : (
          <span>Showing 0 entries</span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs text-muted-foreground">Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
              <SelectTrigger className="h-7 w-[68px] bg-card text-xs px-2 text-foreground" data-testid={`${testId}-page-size`}>
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent side="top" align="end">
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={atStart} className={NAV_BUTTON} title="First Page" aria-label="Go to first page">
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={atStart} className={NAV_BUTTON} title="Previous Page" aria-label="Go to previous page" data-testid={`${testId}-prev`}>
            <ChevronLeft className="size-3.5" />
          </Button>

          <div className="flex items-center gap-1 px-0.5">
            {paginationRange.map((pageNumber, idx) =>
              typeof pageNumber === "string" ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground font-medium select-none">
                  &#8230;
                </span>
              ) : (
                <Button
                  key={`page-${pageNumber}`}
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onPageChange(pageNumber)}
                  className={cn(
                    "h-7 min-w-[28px] px-1.5 text-xs font-medium transition-all",
                    // Outlined, not filled: the page's primary stays the only fill (Von Restorff).
                    pageNumber === currentPage
                      ? "border-brand bg-brand/10 dark:bg-white/10 text-foreground font-bold ring-1 ring-brand hover:bg-brand/15 dark:hover:bg-white/15"
                      : "border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                >
                  {pageNumber}
                </Button>
              ),
            )}
          </div>

          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={atEnd} className={NAV_BUTTON} title="Next Page" aria-label="Go to next page" data-testid={`${testId}-next`}>
            <ChevronRight className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={atEnd} className={NAV_BUTTON} title="Last Page" aria-label="Go to last page">
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
