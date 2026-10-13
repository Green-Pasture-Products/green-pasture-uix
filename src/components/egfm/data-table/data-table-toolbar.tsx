import * as React from "react";
import { Download, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../button";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { AdvancedFilterButton } from "../advanced-filter";
import type { DataTableToolbarProps } from "./types";

export function DataTableToolbar<T>({
  showSearch,
  searchTerm,
  searchPlaceholder,
  onSearch,
  onFilterChange,
  advancedFilter,
  actions,
  onRefresh,
  refreshing,
  onExport,
  canExport,
  testId = "data-table",
}: DataTableToolbarProps<T>) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {showSearch && (
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              aria-label={searchPlaceholder || "Search"}
              data-testid={`${testId}-search`}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-8 text-xs bg-card h-9 rounded-lg"
            />
          </div>
        )}


        {advancedFilter && (
          <AdvancedFilterButton
            {...advancedFilter}
            onApply={(v) => {
              advancedFilter.onApply(v);
              onFilterChange();
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {actions}
        {onRefresh ? (
          // Search, filter and one "More": at most 3 visible choices (Hick's law).
          <TableMoreMenu onRefresh={onRefresh} refreshing={refreshing} onExport={onExport} canExport={canExport} />
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-xs" onClick={onExport} disabled={!canExport}>
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        )}
      </div>
    </div>
  );
}

const MENU_ITEM =
  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50 pointer-coarse:min-h-12 cursor-pointer";

/** Refresh and Export CSV folded under one "More" button. */
function TableMoreMenu({ onRefresh, refreshing, onExport, canExport }: Pick<DataTableToolbarProps<unknown>, "onRefresh" | "refreshing" | "onExport" | "canExport">) {
  const [open, setOpen] = React.useState(false);
  const run = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-xs" aria-label="More table actions">
          <MoreHorizontal className="size-3.5" />
          <span className="hidden sm:inline">More</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-44 p-1">
        <button type="button" className={MENU_ITEM} onClick={run(onRefresh)} disabled={refreshing}>
          <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
        <button type="button" className={MENU_ITEM} onClick={run(onExport)} disabled={!canExport}>
          <Download className="size-3.5" />
          Export CSV
        </button>
      </PopoverContent>
    </Popover>
  );
}
