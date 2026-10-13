export interface AdvancedFilterOption {
  label: string;
  value: string;
  description?: string;
}

/**
 * One filter in the panel. Give it `getValue` / `getDate` and the table filters its own rows by it;
 * leave them out when the page sends the value to the API instead (server-side filters).
 */
export type AdvancedFilterField<T = unknown> =
  | {
      key: string;
      label: string;
      type: "select";
      /** The choices; or name a server enum with `enumName` and they come from its list. */
      options?: AdvancedFilterOption[];
      enumName?: string;
      /** With enumName: leave out values the server marks selectable: false. */
      selectableOnly?: boolean;
      /** A row with several values (e.g. a hub serving both divisions) matches if any equals the choice. */
      getValue?: (row: T) => string | readonly string[] | null | undefined;
    }
  | { key: string; label: string; type: "dateRange"; getDate?: (row: T) => string | Date | null | undefined };

/**
 * Applied filter values. A select stores its value under `key`; a date range stores local
 * calendar days (`YYYY-MM-DD`) under `${key}From` / `${key}To`. Missing = not filtered.
 */
export type AdvancedFilterValues = Record<string, string | undefined>;

export interface AdvancedFilterConfig<T = unknown> {
  fields: AdvancedFilterField<T>[];
  value: AdvancedFilterValues;
  onApply: (value: AdvancedFilterValues) => void;
}

/** DataTable's `advancedFilter` prop: pass `value`/`onApply` only when the page needs the values (e.g. for the API). */
export interface TableAdvancedFilter<T> {
  fields: AdvancedFilterField<T>[];
  value?: AdvancedFilterValues;
  onApply?: (value: AdvancedFilterValues) => void;
}

export interface ActiveFilter {
  label: string;
  /** Value keys to clear when the chip is removed. */
  keys: string[];
}

export interface FilterFieldProps<T> {
  field: AdvancedFilterField<T>;
  draft: AdvancedFilterValues;
  set: (key: string, v: string | undefined) => void;
}
