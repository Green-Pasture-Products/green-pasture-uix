import type * as React from "react";
import type { ActionMenuItem } from "../../action-dropdown";
import type {
  AdvancedFilterConfig,
  AdvancedFilterField,
  AdvancedFilterValues,
  TableAdvancedFilter,
} from "../../advanced-filter";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  /** EGFM patch: keeps this column at the far right, after the audit columns (an Action column). */
  pinEnd?: boolean;
  /** CSV value for this column (MuiTable's `customExport`); defaults to `accessorKey`, else the rendered cell's text. `false` leaves the column out of the export. */
  exportValue?: ((item: T) => string | number | null | undefined) | false;
  /** Makes the header a sort toggle. The value rows are ordered by (dates as ISO strings or Date); `true` sorts by `accessorKey`. */
  sort?: true | ((item: T) => string | number | Date | null | undefined);
}

/** EGFM patch: see DataTableProps.serverPagination. */
export interface ServerPagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export type SortDirection = "asc" | "desc";

/** Which column (by header) the rows are ordered by. */
export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Append Created By / Last Modified / Modified By, like falcon's tables. On by default; turn off for records that are never modified (e.g. the append-only audit log). */
  auditColumns?: boolean;
  showSerialNumber?: boolean;
  /** Client-side search over one or more fields. */
  searchKey?: keyof T | (keyof T)[];
  /** Server-side search: the table renders the same search box but hands the (undebounced) text to the page instead of filtering itself. */
  onSearchChange?: (value: string) => void;
  /** EGFM patch: the search the box starts with, so a page that remembers its search shows it. */
  searchValue?: string;
  searchPlaceholder?: string;
  /** Refresh button in the toolbar (spins while `refreshing`), like MuiTableWrapper's. */
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  loadingType?: "skeleton" | "logo";
  /** MuiTable-style filter panel (selects + date ranges, applied together, shown as removable chips). */
  /**
   * Filter panel fields. Every table also gets "Last modified" (when audit columns show). Fields with
   * getValue/getDate filter the rows here; pass value/onApply only when the page needs the values (API).
   */
  advancedFilter?: TableAdvancedFilter<T>;
  actions?: React.ReactNode;
  /** Export CSV file name (without `.csv`). Exports every row matching the current search/filters, not just the visible page. */
  exportFileName?: string;
  /** Row menu, first item: open the record. */
  onView?: (item: T) => void;
  /** Row menu, second item: edit the record. Leave it out for records that can't be edited. */
  onEdit?: (item: T) => void;
  /** Hides Edit for users without the right privilege, or for rows that can't be edited. */
  canEdit?: boolean | ((item: T) => boolean);
  /** The table's own row actions, listed after View and Edit (with a divider). */
  rowActions?: (item: T) => ActionMenuItem[];
  /** Header shown above the per-row menu's items, e.g. "Role Actions". */
  rowActionsTitle?: string | ((item: T) => string);
  onRowClick?: (item: T) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  /**
   * EGFM patch: server-side paging. `data` is already the current page and `total` counts every matching row;
   * the table reports page / page-size changes back (and resets to page 1 on search or filter).
   */
  serverPagination?: ServerPagination;
  /** EGFM patch: replaces the built-in CSV export (which only sees `data`), e.g. to export every row from the API. */
  onExport?: () => void;
  /** Hide the search / filter / export bar (e.g. a short "recent items" table). Default shown. */
  showToolbar?: boolean;
  /** The order rows start in, by a sortable column's header. */
  defaultSort?: SortState;
  /** EGFM patch: test-id prefix for the table's parts (search, count, rows…). */
  testId?: string;
  /** EGFM patch: remembers which columns the user hid, per this key, and shows a Columns menu. */
  columnsKey?: string;
  /** EGFM patch: row id for test ids and keys when rows have none of their own. */
  emptyState?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

export interface UseDataTableOptions<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T | (keyof T)[];
  /** Server-side search: the hook keeps the box's text but leaves filtering to the page. */
  serverSearch: boolean;
  pageSize: number;
  exportFileName: string;
  filterFields: AdvancedFilterField<T>[];
  filterValue: AdvancedFilterValues;
  defaultSort?: SortState;
  /** EGFM patch: the search to start with (a page restoring its state). */
  initialSearch?: string;
}

export interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showToolbar?: boolean;
}

export interface DataTableToolbarProps<T = unknown> {
  showSearch: boolean;
  searchTerm: string;
  searchPlaceholder: string;
  onSearch: (value: string) => void;
  onFilterChange: () => void;
  advancedFilter?: AdvancedFilterConfig<T>;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  refreshing: boolean;
  onExport: () => void;
  canExport: boolean;
  testId?: string;
}

export interface DataTablePaginationProps {
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  showPageSizeSelector: boolean;
  paginationRange: (number | string)[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  testId?: string;
}

export type RowMenuConfig<T> = Pick<DataTableProps<T>, "onView" | "onEdit" | "canEdit" | "rowActions">;

export interface DataTableGridProps<T> extends RowMenuConfig<T>, Pick<DataTableProps<T>, "rowActionsTitle" | "onRowClick" | "emptyState"> {
  rows: T[];
  columns: Column<T>[];
  showSerialNumber: boolean;
  /** Serial number of the first row on this page. */
  firstSerial: number;
  sort: SortState | null;
  onSort: (column: string) => void;
  testId?: string;
}

/** Every API record carries these (BaseEntity); `createdBy`/`updatedBy` arrive already resolved to names. */
export interface AuditFields {
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}
