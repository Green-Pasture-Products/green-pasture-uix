import type { AdvancedFilterField } from "../advanced-filter";
import { AUDIT_COLUMNS, LAST_MODIFIED_FILTER } from "./constants";
import type { Column } from "./types";

export function withAuditColumns<T>(columns: Column<T>[], enabled: boolean): Column<T>[] {
  if (!enabled) return columns;
  // EGFM patch: the audit columns go before any column pinned to the end (Action stays the last column).
  const pinned = columns.filter((c) => c.pinEnd);
  const rest = columns.filter((c) => !c.pinEnd);
  return [...rest, ...(AUDIT_COLUMNS as Column<T>[]), ...pinned];
}

/** The page's own filter fields, plus "Last modified" wherever the audit columns show. */
export function withDefaultFilters<T>(fields: AdvancedFilterField<T>[], enabled: boolean): AdvancedFilterField<T>[] {
  if (!enabled || fields.some((f) => f.key === LAST_MODIFIED_FILTER.key)) return fields;
  return [...fields, LAST_MODIFIED_FILTER as AdvancedFilterField<T>];
}
