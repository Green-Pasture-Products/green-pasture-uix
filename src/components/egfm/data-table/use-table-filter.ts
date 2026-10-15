import * as React from "react";
import type { AdvancedFilterValues, TableAdvancedFilter } from "../advanced-filter";
import { withDefaultFilters } from "./audit-columns";

/**
 * The table's filter panel: the page's fields plus the default "Last modified", with the applied
 * values kept here unless the page passes its own value/onApply (server-side filters).
 */
export function useTableFilter<T>(config: TableAdvancedFilter<T> | undefined, auditColumns: boolean) {
  const [inner, setInner] = React.useState<AdvancedFilterValues>({});
  const fields = withDefaultFilters(config?.fields ?? [], auditColumns);
  const value = config?.value ?? inner;

  const apply = (next: AdvancedFilterValues) => {
    if (config?.value === undefined) setInner(next);
    config?.onApply?.(next);
  };

  return { fields, value, apply };
}
