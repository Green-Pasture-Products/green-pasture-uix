import type { AdvancedFilterField } from "../advanced-filter";
import { AUDIT_COLUMNS, LAST_MODIFIED_FILTER } from "./constants";
import type { Column } from "./types";

export function withAuditColumns<T>(columns: Column<T>[], enabled: boolean): Column<T>[] {
  // EGFM patch: the table closes with Status, then the audit columns, then Action (pinned last).
  const pinned = columns.filter((c) => c.pinEnd);
  const status = columns.filter((c) => !c.pinEnd && c.statusColumn);
  const rest = columns.filter((c) => !c.pinEnd && !c.statusColumn);
  return [...rest, ...status, ...(enabled ? (AUDIT_COLUMNS as Column<T>[]) : []), ...pinned];
}

/** The page's own filter fields, plus "Last modified" wherever the audit columns show. */
export function withDefaultFilters<T>(fields: AdvancedFilterField<T>[], enabled: boolean): AdvancedFilterField<T>[] {
  if (!enabled || fields.some((f) => f.key === LAST_MODIFIED_FILTER.key)) return fields;
  return [...fields, LAST_MODIFIED_FILTER as AdvancedFilterField<T>];
}
