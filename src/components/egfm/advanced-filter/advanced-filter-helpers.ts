import { formatDate } from "../lib/format-date";
import type { ActiveFilter, AdvancedFilterField, AdvancedFilterValues } from "./types";

export const fromKey = (key: string) => `${key}From`;
export const toKey = (key: string) => `${key}To`;

/** `YYYY-MM-DD` for a local calendar day (not UTC, so late-evening picks don't shift a day). */
export function toDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDay(day: string | undefined): Date | undefined {
  if (!day) return undefined;
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** ISO instants covering whole local days, for an API's `from`/`to` params. */
export function dayRangeToIso(from: string | undefined, to: string | undefined) {
  const start = fromDay(from);
  const end = fromDay(to);
  end?.setHours(23, 59, 59, 999);
  return { from: start?.toISOString(), to: end?.toISOString() };
}

export function isRangeInvalid<T>(fields: AdvancedFilterField<T>[], value: AdvancedFilterValues): boolean {
  return fields.some((f) => {
    if (f.type !== "dateRange") return false;
    const from = value[fromKey(f.key)];
    const to = value[toKey(f.key)];
    return !!from && !!to && from > to;
  });
}

/** One chip per filtered field, e.g. "Action: SIGNED_IN" or "Occurred: Sep 1, 2026 – Sep 24, 2026". */
export function activeFilters<T>(fields: AdvancedFilterField<T>[], value: AdvancedFilterValues): ActiveFilter[] {
  return fields.flatMap((f): ActiveFilter[] => {
    if (f.type === "select") {
      const v = value[f.key];
      if (!v) return [];
      return [{ label: `${f.label}: ${f.options?.find((o) => o.value === v)?.label ?? v}`, keys: [f.key] }];
    }
    const from = fromDay(value[fromKey(f.key)]);
    const to = fromDay(value[toKey(f.key)]);
    if (!from && !to) return [];
    const range =
      from && to ? `${formatDate(from)} – ${formatDate(to)}` : from ? `from ${formatDate(from)}` : `until ${formatDate(to!)}`;
    return [{ label: `${f.label}: ${range}`, keys: [fromKey(f.key), toKey(f.key)] }];
  });
}

/** Whether a row passes every applied filter that knows how to read it (fields without getValue/getDate are the API's job). */
export function rowMatchesFilters<T>(row: T, fields: AdvancedFilterField<T>[], value: AdvancedFilterValues): boolean {
  return fields.every((f) => {
    if (f.type === "select") {
      const wanted = value[f.key];
      if (!wanted || !f.getValue) return true;
      const actual = f.getValue(row);
      return Array.isArray(actual) ? actual.includes(wanted) : actual === wanted;
    }
    const from = value[fromKey(f.key)];
    const to = value[toKey(f.key)];
    if ((!from && !to) || !f.getDate) return true;
    const raw = f.getDate(row);
    const date = raw ? new Date(raw) : undefined;
    if (!date || Number.isNaN(date.getTime())) return false;
    const day = toDay(date);
    return (!from || day >= from) && (!to || day <= to);
  });
}
