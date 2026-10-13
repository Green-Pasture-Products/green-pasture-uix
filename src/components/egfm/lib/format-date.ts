// The one place dates become text: en-US short month, the viewer's time zone, "—" when empty or invalid.
type DateInput = string | number | Date | null | undefined;

const DATE: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
const DATE_TIME: Intl.DateTimeFormatOptions = { ...DATE, hour: "numeric", minute: "2-digit" };
const MONTH: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
// Built per call so the viewer's current time zone always applies.
const format = (d: Date | null, options: Intl.DateTimeFormatOptions) => (d ? new Intl.DateTimeFormat("en-US", options).format(d) : "—");

/** A Date, or null; a bare "2026-09-30" (or "2026-09") is a calendar day, read as local midnight rather than UTC. */
function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = typeof value === "string" && /^\d{4}-\d{2}(-\d{2})?$/.test(value)
    ? new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Sep 30, 2026". */
export function formatDate(value: DateInput): string {
  return format(toDate(value), DATE);
}

/** "Sep 30, 2026, 7:59 AM": for timestamps where the time matters (audit, last modified). */
export function formatDateTime(value: DateInput): string {
  return format(toDate(value), DATE_TIME);
}

/** "Sep 2026": a month, e.g. a forecast or season month. */
export function formatMonth(value: DateInput): string {
  return format(toDate(value), MONTH);
}
