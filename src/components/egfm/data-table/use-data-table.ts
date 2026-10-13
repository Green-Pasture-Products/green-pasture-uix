import * as React from "react";
import { rowMatchesFilters } from "../advanced-filter";
import { downloadCsv, nodeText, toCsv } from "./csv";
import { getPaginationRange } from "./pagination-range";
import type { Column, SortState, UseDataTableOptions } from "./types";

const sortKey = <T,>(col: Column<T>, item: T) => {
  const v = col.sort === true ? (col.accessorKey ? (item[col.accessorKey] as unknown) : undefined) : col.sort?.(item);
  return v instanceof Date ? v.getTime() : (v as string | number | null | undefined);
};

/** Ascending, numbers as numbers, text by locale; empty values always last. */
function compare(a: string | number | null | undefined, b: string | number | null | undefined) {
  if (a == null || a === "") return b == null || b === "" ? 0 : 1;
  if (b == null || b === "") return -1;
  return typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), undefined, { numeric: true });
}

/** Search, paging and CSV export state for DataTable. */
export function useDataTable<T>({ data, columns, searchKey, serverSearch, pageSize, exportFileName, filterFields, filterValue, defaultSort, initialSearch }: UseDataTableOptions<T>) {
  // EGFM patch: a page restoring its search shows it in the box.
  const [searchTerm, setSearchTerm] = React.useState(initialSearch ?? "");
  const [sort, setSort] = React.useState<SortState | null>(defaultSort ?? null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize);

  React.useEffect(() => setCurrentPageSize(pageSize), [pageSize]);

  const filteredData = React.useMemo(() => {
    const filtered = data.filter((item) => rowMatchesFilters(item, filterFields, filterValue));
    if (!searchTerm || !searchKey || serverSearch) return filtered;
    const keys = Array.isArray(searchKey) ? searchKey : [searchKey];
    const term = searchTerm.toLowerCase();
    return filtered.filter((item) => keys.some((k) => String(item[k] ?? "").toLowerCase().includes(term)));
  }, [data, searchTerm, searchKey, serverSearch, filterFields, filterValue]);

  const sortedData = React.useMemo(() => {
    const col = sort && columns.find((c) => c.header === sort.column && c.sort);
    if (!col) return filteredData;
    const sign = sort.direction === "asc" ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      const ka = sortKey(col, a);
      const kb = sortKey(col, b);
      // Empty values stay last whichever way the column is sorted.
      if (ka == null || ka === "" || kb == null || kb === "") return compare(ka, kb);
      return sign * compare(ka, kb);
    });
  }, [filteredData, sort, columns]);

  /** A header click: ascending first, then descending, then back to the unsorted order. */
  const toggleSort = (column: string) => {
    setSort((s) => (s?.column !== column ? { column, direction: "asc" } : s.direction === "asc" ? { column, direction: "desc" } : null));
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / currentPageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * currentPageSize;
    return sortedData.slice(start, start + currentPageSize);
  }, [sortedData, currentPage, currentPageSize]);

  const paginationRange = React.useMemo(() => getPaginationRange(currentPage, totalPages), [currentPage, totalPages]);

  function exportCsv() {
    const cols = columns.filter((c) => c.exportValue !== false);
    const rows = sortedData.map((item) =>
      cols.map((c) => {
        if (c.exportValue) return c.exportValue(item);
        if (c.accessorKey) return item[c.accessorKey] as unknown;
        return c.cell ? nodeText(c.cell(item)) : "";
      }),
    );
    downloadCsv(exportFileName, toCsv(cols.map((c) => c.header), rows));
  }

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    currentPageSize,
    setCurrentPageSize,
    filteredData,
    paginatedData,
    totalPages,
    paginationRange,
    exportCsv,
    sort,
    toggleSort,
  };
}
