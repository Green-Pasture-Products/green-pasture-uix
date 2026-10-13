import type { AdvancedFilterField } from "../advanced-filter";
import { AUDIT_COLUMNS, LAST_MODIFIED_FILTER } from "./constants";
import type { Column } from "./types";

export function withAuditColumns<T>(columns: Column<T>[], enabled: boolean): Column<T>[] {
  return enabled ? [...columns, ...(AUDIT_COLUMNS as Column<T>[])] : columns;
}

/** The page's own filter fields, plus "Last modified" wherever the audit columns show. */
export function withDefaultFilters<T>(fields: AdvancedFilterField<T>[], enabled: boolean): AdvancedFilterField<T>[] {
  if (!enabled || fields.some((f) => f.key === LAST_MODIFIED_FILTER.key)) return fields;
  return [...fields, LAST_MODIFIED_FILTER as AdvancedFilterField<T>];
}
